# app/ai/service.py
from __future__ import annotations

import json
import re
from datetime import datetime
from time import perf_counter
from typing import Any, AsyncIterator

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.config import AIServiceConfig
from app.models.ai import AIThread, AIMessage, AIToolCall
from app.ai.schemas.schemas import ChatRequest, AssistantPayload, Card, NextAction, Citation, Usage
from app.ai.prompts import get_prompt
from app.ai.tools.tools import get_estimate_summary, search_material_listings, search_technicians, rough_cost_estimate
from app.core.logging import setup_logger

from app.ai.providers.ollama_provider import OllamaProvider


_SERVICE_CONFIG = AIServiceConfig.from_env()
AI_MAX_TOOL_CALLS = _SERVICE_CONFIG.max_tool_calls
AI_MAX_HISTORY_MESSAGES = _SERVICE_CONFIG.max_history_messages
AI_MAX_GROUNDED_HISTORY_MESSAGES = _SERVICE_CONFIG.max_grounded_history_messages
AI_GROUNDED_NUM_PREDICT = _SERVICE_CONFIG.grounded_num_predict
AI_STREAM_NUM_PREDICT = _SERVICE_CONFIG.stream_num_predict
logger = setup_logger("ai.service.ollama")
ALLOWED_TOOLS = {
    "get_estimate_summary",
    "get_project_summary",
    "search_material_listings",
    "search_technicians",
    "rough_cost_estimate",
}


SYSTEM_PROMPT = f"""
You are ConstructHub AI Construction Assistant for builders in Kenya.

Return EXACTLY one JSON object and nothing else.
Use strict JSON only (quoted strings, no comments, no markdown, no placeholders).

Allowed output #1 (tool call object):
- type: "tool_call"
- tool_name: one of "get_estimate_summary", "search_material_listings", "search_technicians", "rough_cost_estimate"
- args: JSON object with actual argument values (no placeholders)

Allowed output #2 (final object):
- type: "final"
- text: string
- confidence: number
- citations: array (optional)
- cards: array (optional)
- next_actions: array (optional)

Rules:
- If the user asks for ConstructHub platform facts (estimate/project/vendor/technician/material listing), call a tool first.
- If required args are missing, return FINAL asking for the missing detail (short clarification).
- For get_estimate_summary, use project_id from user/context only; never invent placeholders like "your_project_id" or "abc-123".
- Required args:
  - get_estimate_summary: project_id
  - search_material_listings: material (optional location, max_price, limit)
  - search_technicians: profession (optional location, verified_only, limit)
  - rough_cost_estimate: floor_area_sqm OR bedrooms/bathrooms (optional quality, location)
- Tool key must be "tool_name" (not "type_name").
- Keep responses practical and concise for Kenya construction context.
""".strip()

STREAM_TEXT_SYSTEM_PROMPT = """
You are the ConstructHub AI Construction Assistant.
Respond in plain text (no JSON) with concise, practical guidance for builders in Kenya.
If the user asks for factual platform data tied to ConstructHub records (estimate/project/vendor/technician),
state that the request requires grounded lookup and ask for the needed details.
""".strip()

GROUNDED_KEYWORDS = (
    "estimate",
    "project",
    "vendor",
    "technician",
    "supplier",
    "material listing",
    "material",
    "my cost",
    "my estimate",
    "summarize my",
    "quote",
    "pricing",
    "price",
    "plumber",
    "electrician",
    "mason",
    "fundi",
)

THREAD_PROJECT_FOLLOWUP_HINTS = (
    "my estimate",
    "this estimate",
    "my project",
    "this project",
    "estimate total",
    "project total",
    "project cost",
    "budget",
    "summarize",
    "summary",
    "vendor",
    "technician",
    "material",
    "quote",
)


async def _load_recent_messages(db: AsyncSession, thread_id: str, limit: int = AI_MAX_HISTORY_MESSAGES) -> list[dict[str, Any]]:
    q = await db.execute(
        select(AIMessage)
        .where(AIMessage.thread_id == thread_id)
        .order_by(AIMessage.created_at.desc())
        .limit(limit)
    )
    rows = list(reversed(q.scalars().all()))
    out: list[dict[str, Any]] = []
    for m in rows:
        if m.text:
            out.append({"role": m.role, "content": m.text})
    return out


async def _save_message(db: AsyncSession, *, thread_id: str, role: str, text: str | None, structured_json: dict | None = None) -> AIMessage:
    msg = AIMessage(thread_id=thread_id, role=role, text=text, structured_json=structured_json)
    db.add(msg)
    await db.flush()
    return msg


async def _log_tool_call(
    db: AsyncSession,
    *,
    assistant_message_id: str,
    tool_name: str,
    tool_args: dict,
    tool_result: dict | None,
    status: str = "ok",
    latency_ms: int | None = None,
) -> None:
    rec = AIToolCall(
        message_id=assistant_message_id,
        tool_name=tool_name,
        tool_args=tool_args,
        tool_result=tool_result,
        status=status,
        latency_ms=latency_ms,
    )
    db.add(rec)
    await db.flush()


async def _run_tool(tool_name: str, tool_args: dict, *, db: AsyncSession, user_id: str) -> dict:
    if tool_name in ("get_estimate_summary", "get_project_summary"):
        project_id = tool_args.get("project_id")
        if not project_id:
            return {"error": "project_id is required for get_estimate_summary"}
        return await get_estimate_summary(project_id=project_id, db=db, user_id=user_id)

    if tool_name == "search_material_listings":
        return await search_material_listings(
            material=tool_args["material"],
            location=tool_args.get("location"),
            max_price=tool_args.get("max_price"),
            limit=tool_args.get("limit", 5),
            db=db,
        )

    if tool_name == "search_technicians":
        return await search_technicians(
            profession=tool_args["profession"],
            location=tool_args.get("location"),
            verified_only=tool_args.get("verified_only", True),
            limit=tool_args.get("limit", 5),
            db=db,
        )

    if tool_name == "rough_cost_estimate":
        return await rough_cost_estimate(
            bedrooms=tool_args.get("bedrooms"),
            bathrooms=tool_args.get("bathrooms"),
            floor_area_sqm=tool_args.get("floor_area_sqm"),
            quality=tool_args.get("quality", "standard"),
            location=tool_args.get("location"),
            db=db,
        )

    return {"error": f"Unknown tool: {tool_name}"}


def _safe_json_parse(text: str) -> dict | None:
    """
    Ollama sometimes returns leading/trailing whitespace.
    This enforces strict JSON parsing but also tolerates simple wrappers like "TOOL CALL:" or code fences.
    """
    raw = (text or "").strip()

    # Strip Markdown code fences if present
    if raw.startswith("```"):
        raw = raw.strip("`")
        if raw.lower().startswith("json"):
            raw = raw[4:].strip()

    # Try strict parse first
    try:
        return json.loads(raw)
    except Exception:
        pass

    # Fallback: extract first JSON object in the string (handles "TOOL CALL:\n{...}")
    start = raw.find("{")
    end = raw.rfind("}")
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(raw[start : end + 1])
        except Exception:
            return None

    return None


def _resolve_context_project_id(payload: ChatRequest, thread: AIThread) -> str | None:
    context_project_id = getattr(payload.context, "project_id", None) if payload.context else None
    return context_project_id or getattr(thread, "project_id", None)


def _is_placeholder_value(value: Any) -> bool:
    if value is None:
        return True
    text = str(value).strip().lower()
    if not text:
        return True
    placeholder_tokens = (
        "your_project_id",
        "abc-123",
        "<project",
        "project_id",
        "placeholder",
        "...",
    )
    return any(token in text for token in placeholder_tokens)


def _requires_grounded_tool(payload: ChatRequest, thread: AIThread) -> bool:
    text = (payload.message or "").strip().lower()
    if not text:
        return False

    # Explicit request payload project context indicates a grounded turn.
    explicit_project_id = getattr(payload.context, "project_id", None) if payload.context else None
    if explicit_project_id:
        return True

    if any(token in text for token in GROUNDED_KEYWORDS):
        return True

    # Thread-level project context is useful fallback for project-specific follow-ups,
    # but should not force all turns into the grounded/tool flow.
    if getattr(thread, "project_id", None):
        return any(token in text for token in THREAD_PROJECT_FOLLOWUP_HINTS)

    return False


def _history_without_current_turn(history: list[dict[str, Any]], payload: ChatRequest) -> list[dict[str, Any]]:
    if (
        history
        and history[-1].get("role") == "user"
        and history[-1].get("content") == payload.message
    ):
        return history[:-1]
    return history


def _build_user_content(payload: ChatRequest) -> str:
    user_content_parts: list[str] = []
    if payload.prompt_id:
        prompt = get_prompt(payload.prompt_id)
        if prompt and prompt.get("template"):
            user_content_parts.append(prompt["template"])
    user_content_parts.append(payload.message)
    if payload.context:
        try:
            user_content_parts.append(f"Context: {payload.context.model_dump(exclude_none=True)}")
        except Exception:
            pass
    return "\n".join([part for part in user_content_parts if part])


def _assistant_payload_from_final(final_json: dict) -> AssistantPayload:
    # Defensive parsing with defaults
    text = str(final_json.get("text", "")).strip()
    confidence = float(final_json.get("confidence", 0.0) or 0.0)

    citations = []
    for c in final_json.get("citations", []) or []:
        try:
            citations.append(Citation(**c))
        except Exception:
            continue

    cards = []
    for cd in final_json.get("cards", []) or []:
        try:
            cards.append(Card(**cd))
        except Exception:
            continue

    next_actions = []
    for na in final_json.get("next_actions", []) or []:
        try:
            next_actions.append(NextAction(**na))
        except Exception:
            continue

    return AssistantPayload(
        text=text or "I could not generate a response. Please try again.",
        confidence=confidence,
        citations=citations,
        cards=cards,
        next_actions=next_actions,
    )


def _prepare_model_history(history_without_current: list[dict[str, Any]], *, grounded: bool) -> list[dict[str, Any]]:
    if not grounded:
        return history_without_current
    if AI_MAX_GROUNDED_HISTORY_MESSAGES <= 0:
        return []
    return history_without_current[-AI_MAX_GROUNDED_HISTORY_MESSAGES:]


def _to_float(value: Any) -> float | None:
    try:
        if value is None:
            return None
        return float(value)
    except Exception:
        return None


def _format_kes(value: Any) -> str | None:
    amt = _to_float(value)
    if amt is None:
        return None
    if abs(amt - round(amt)) < 0.01:
        return f"KES {round(amt):,}"
    return f"KES {amt:,.2f}"


def _synthesize_estimate_summary(tool_args: dict[str, Any], result: dict[str, Any]) -> AssistantPayload:
    error = result.get("error")
    if error:
        return AssistantPayload(
            text=f"I could not load this estimate: {error}. Please confirm the project_id and try again.",
            confidence=0.0,
            citations=[],
            cards=[],
            next_actions=[NextAction(label="Provide project ID", action="request_project_id", payload={})],
        )

    project_ref = str(result.get("estimate_id") or tool_args.get("project_id") or "").strip()
    summary = result.get("summary") or {}
    project_details = result.get("project_details") or {}
    phase_insights = list(result.get("phase_insights") or [])

    total_cost = _to_float(summary.get("total_cost"))
    material_cost = _to_float(summary.get("material_cost")) or 0.0
    labour_cost = _to_float(summary.get("labour_cost")) or 0.0
    other_cost = _to_float(summary.get("other_cost")) or 0.0
    phase_count = int(summary.get("phases_count") or len(phase_insights) or 0)

    project_name = str(project_details.get("project_name") or "").strip()
    location = str(project_details.get("location") or "").strip()

    ranked_phases: list[dict[str, Any]] = []
    for phase in phase_insights:
        share = _to_float(phase.get("share_of_total")) or 0.0
        phase_name = str(phase.get("phase") or "phase").replace("_", " ").strip().title()
        ranked_phases.append(
            {
                "name": phase_name,
                "share": share,
                "note": str(phase.get("note") or "").strip(),
                "top_materials": list(phase.get("top_materials") or []),
                "top_labour": list(phase.get("top_labour") or []),
            }
        )
    ranked_phases.sort(key=lambda p: p["share"], reverse=True)

    def _share_text(value: float | None) -> str:
        if value is None:
            return "n/a"
        return f"{round(value * 100)}%"

    def _cost_share(cost_value: float) -> float | None:
        if total_cost is None or total_cost <= 0:
            return None
        return cost_value / total_cost

    material_share = _cost_share(material_cost)
    labour_share = _cost_share(labour_cost)
    other_share = _cost_share(other_cost)

    total_cost_text = _format_kes(summary.get("total_cost"))
    lines: list[str] = ["### Estimate Summary"]
    if project_name or location:
        project_label = project_name or "Current project"
        location_suffix = f" ({location})" if location else ""
        lines.append(f"- Project: **{project_label}**{location_suffix}.")
    if total_cost_text:
        lines.append(f"- Total estimate: **{total_cost_text}** across **{max(phase_count, 1)} phases**.")

    top_phase = ranked_phases[0] if ranked_phases else None
    second_phase = ranked_phases[1] if len(ranked_phases) > 1 else None
    if top_phase and top_phase.get("share", 0) > 0:
        lines.append(
            f"- The biggest cost pressure is **{top_phase['name']}** at **{_share_text(top_phase['share'])}** of total."
        )
    if second_phase and second_phase.get("share", 0) >= 0.12:
        lines.append(
            f"- A secondary driver is **{second_phase['name']}** at **{_share_text(second_phase['share'])}**."
        )

    if material_share is not None and labour_share is not None and other_share is not None:
        lines.append(
            "- Cost mix: "
            f"**{_share_text(material_share)} materials**, "
            f"**{_share_text(labour_share)} labour**, "
            f"**{_share_text(other_share)} other costs**."
        )

    observations: list[str] = []
    if top_phase:
        top_note = top_phase.get("note") or ""
        if top_note:
            observations.append(top_note)
    if top_phase and second_phase:
        combined = (top_phase.get("share") or 0.0) + (second_phase.get("share") or 0.0)
        if combined >= 0.55:
            observations.append(
                f"The top two phases ({top_phase['name']} and {second_phase['name']}) account for about {_share_text(combined)} of total cost."
            )
    if material_share is not None and material_share >= 0.6:
        observations.append("Material spend is dominant, so supplier pricing and quantity control will heavily affect final cost.")
    if labour_share is not None and labour_share >= 0.25:
        observations.append("Labour is a meaningful share; crew productivity and sequencing can materially shift spend.")
    if other_share is not None and other_share >= 0.1:
        observations.append("Other costs are non-trivial; recheck assumptions for permits, logistics, and site overheads.")

    top_phase_name_lower = (top_phase or {}).get("name", "").lower()
    if "site preparation" in top_phase_name_lower or "foundation" in top_phase_name_lower:
        observations.append(
            "Early works are carrying a large share, so validate ground conditions, excavation scope, and concrete quantities before execution."
        )

    if not observations:
        observations.append("The estimate appears relatively distributed across phases, so focus on the largest two phase budgets first.")

    lines.append("### What Stands Out")
    for obs in observations[:3]:
        lines.append(f"- {obs}")

    planning_notes: list[str] = []
    if top_phase:
        planning_notes.append(f"Review unit rates and quantities in **{top_phase['name']}** before locking procurement.")
    if material_share is not None and material_share >= 0.6:
        planning_notes.append("Prioritize early supplier quotes for high-value materials to reduce price volatility risk.")
    elif labour_share is not None and labour_share >= 0.25:
        planning_notes.append("Track labour productivity by phase to prevent schedule and wage overrun.")
    else:
        planning_notes.append("Track actual spend against the phase breakdown weekly to catch overruns early.")

    lines.append("### Planning Notes")
    for note in planning_notes[:2]:
        lines.append(f"- {note}")

    lines.append("### Limitation Note")
    lines.append(
        "- This summary is based on the current estimate breakdown only; it is not a Kenya-wide benchmark comparison."
    )

    card_data: dict[str, Any] = {
        "total_cost": summary.get("total_cost"),
        "phase_count": phase_count,
        "top_drivers": [
            {"phase": phase["name"], "share_pct": round((phase.get("share") or 0.0) * 100)}
            for phase in ranked_phases[:3]
        ],
    }
    if project_name:
        card_data["project_name"] = project_name
    if location:
        card_data["location"] = location

    cards = [
        Card(
            type="estimate_summary",
            title="Estimate Summary",
            subtitle=total_cost_text,
            data=card_data,
        )
    ]

    action_payload = {"project_id": project_ref} if project_ref else {}
    follow_up_phase = top_phase["name"] if top_phase else "top cost phase"

    return AssistantPayload(
        text="\n".join(lines),
        confidence=0.88,
        citations=[Citation(type="estimate", id="Current project estimate data", chunk_id=None)],
        cards=cards,
        next_actions=[
            NextAction(label="Review full estimate", action="open_estimate", payload=action_payload),
            NextAction(label="Inspect cost breakdown", action="view_cost_breakdown", payload=action_payload),
            NextAction(
                label=f"Ask why {follow_up_phase} is high",
                action="ask_followup",
                payload={"question": f"Why is {follow_up_phase} high in this estimate?", **action_payload},
            ),
        ],
    )


def _synthesize_material_listings(tool_args: dict[str, Any], result: dict[str, Any]) -> AssistantPayload:
    query = result.get("query") or {}
    material = str(query.get("material") or tool_args.get("material") or "material")
    location = query.get("location") or tool_args.get("location")
    listings = list(result.get("results") or [])

    if not listings:
        location_text = f" in {location}" if location else ""
        return AssistantPayload(
            text=f"I did not find active listings for **{material}**{location_text}. Try a broader material name or remove price/location filters.",
            confidence=0.64,
            citations=[],
            cards=[],
            next_actions=[NextAction(label="Broaden search", action="refine_material_search", payload=query)],
        )

    lines: list[str] = ["### Material Listings"]
    lines.append(f"- Query: **{material}**" + (f" ({location})" if location else ""))
    lines.append(f"- Matches found: **{len(listings)}**")
    lines.append("### Best Matches")

    cards: list[Card] = []
    citations: list[Citation] = []
    for idx, item in enumerate(listings[:4], start=1):
        vendor = item.get("vendor") or {}
        price_text = _format_kes(item.get("price")) or "Price unavailable"
        unit = str(item.get("unit") or "").strip()
        vendor_name = str(vendor.get("name") or "Vendor")
        vendor_location = str(vendor.get("location") or "").strip()
        name = str(item.get("name") or "Item")

        unit_text = f"/{unit}" if unit else ""
        location_text = f", {vendor_location}" if vendor_location else ""
        lines.append(f"{idx}. **{name}** - {price_text}{unit_text} ({vendor_name}{location_text})")

        if idx <= 2:
            cards.append(
                Card(
                    type="material_listing",
                    title=name,
                    subtitle=f"{price_text}{unit_text} - {vendor_name}",
                    data={"item_id": item.get("id"), "vendor_id": vendor.get("id"), "location": vendor_location},
                )
            )

        vendor_id = vendor.get("id")
        if vendor_id:
            citations.append(Citation(type="vendor", id=str(vendor_id), chunk_id=None))

    return AssistantPayload(
        text="\n".join(lines),
        confidence=0.8,
        citations=citations[:3],
        cards=cards,
        next_actions=[NextAction(label="Adjust filters", action="refine_material_search", payload=query)],
    )


def _synthesize_technicians(tool_args: dict[str, Any], result: dict[str, Any]) -> AssistantPayload:
    query = result.get("query") or {}
    profession = str(query.get("profession") or tool_args.get("profession") or "technician")
    location = query.get("location") or tool_args.get("location")
    technicians = list(result.get("results") or [])

    if not technicians:
        location_text = f" in {location}" if location else ""
        return AssistantPayload(
            text=f"I could not find verified **{profession}** listings{location_text}. Try widening location or disabling strict filters.",
            confidence=0.62,
            citations=[],
            cards=[],
            next_actions=[NextAction(label="Refine technician search", action="refine_technician_search", payload=query)],
        )

    lines: list[str] = ["### Technician Matches"]
    lines.append(f"- Role: **{profession}**" + (f" ({location})" if location else ""))
    lines.append(f"- Matches found: **{len(technicians)}**")
    lines.append("### Top Technicians")

    cards: list[Card] = []
    citations: list[Citation] = []
    for idx, tech in enumerate(technicians[:4], start=1):
        name = str(tech.get("name") or "Technician")
        specialization = str(tech.get("specialization") or profession)
        tech_location = str(tech.get("location") or "").strip()
        rating = _to_float(tech.get("rating"))
        rating_text = f"{rating:.1f}/5" if rating is not None else "No rating"
        location_text = f", {tech_location}" if tech_location else ""
        lines.append(f"{idx}. **{name}** - {specialization} ({rating_text}{location_text})")

        if idx <= 2:
            cards.append(
                Card(
                    type="technician_match",
                    title=name,
                    subtitle=f"{specialization} - {rating_text}",
                    data={"technician_id": tech.get("id"), "location": tech_location},
                )
            )

        tech_id = tech.get("id")
        if tech_id:
            citations.append(Citation(type="technician", id=str(tech_id), chunk_id=None))

    return AssistantPayload(
        text="\n".join(lines),
        confidence=0.79,
        citations=citations[:3],
        cards=cards,
        next_actions=[NextAction(label="Filter technicians", action="refine_technician_search", payload=query)],
    )


def _synthesize_rough_cost(result: dict[str, Any]) -> AssistantPayload:
    error = result.get("error")
    if error:
        return AssistantPayload(
            text=f"I need one more detail to estimate cost: {error}",
            confidence=0.0,
            citations=[Citation(type="knowledge", id="rough_cost_estimate", chunk_id=None)],
            cards=[],
            next_actions=[NextAction(label="Provide floor area", action="request_floor_area", payload={})],
        )

    totals = result.get("total_kes") or {}
    low = _format_kes(totals.get("low"))
    mid = _format_kes(totals.get("mid"))
    high = _format_kes(totals.get("high"))
    area = result.get("area_sqm_used")
    rate = _format_kes(result.get("rate_per_sqm_kes"))
    assumptions = list(result.get("assumptions") or [])

    lines: list[str] = ["### Rough Cost Range"]
    if low and high:
        lines.append(f"- Estimated total range: **{low} to {high}**")
    if mid:
        lines.append(f"- Midpoint estimate: **{mid}**")
    if area:
        lines.append(f"- Area used: **{area} sqm**")
    if rate:
        lines.append(f"- Rate used: **{rate} per sqm**")
    if assumptions:
        lines.append("### Assumptions")
        for assumption in assumptions[:4]:
            lines.append(f"- {assumption}")

    cards = [
        Card(
            type="rough_cost_band",
            title="Rough Cost Estimate",
            subtitle=mid or low or high or "Cost band",
            data={"low": totals.get("low"), "mid": totals.get("mid"), "high": totals.get("high"), "area_sqm": area},
        )
    ]

    return AssistantPayload(
        text="\n".join(lines),
        confidence=0.74,
        citations=[Citation(type="knowledge", id="rough_cost_estimate", chunk_id=None)],
        cards=cards,
        next_actions=[NextAction(label="Create detailed estimate", action="start_estimation", payload={})],
    )


def _synthesize_tool_result(tool_name: str, tool_args: dict[str, Any], result: dict[str, Any]) -> AssistantPayload | None:
    if tool_name in ("get_estimate_summary", "get_project_summary"):
        return _synthesize_estimate_summary(tool_args, result)
    if tool_name == "search_material_listings":
        return _synthesize_material_listings(tool_args, result)
    if tool_name == "search_technicians":
        return _synthesize_technicians(tool_args, result)
    if tool_name == "rough_cost_estimate":
        return _synthesize_rough_cost(result)
    return None


_CACHED_PROVIDER: OllamaProvider | None = None
_WARNED_UNSUPPORTED_PROVIDER = False


def _provider_factory(provider_name: str | None = None) -> OllamaProvider:
    global _CACHED_PROVIDER
    global _WARNED_UNSUPPORTED_PROVIDER

    configured = (provider_name or _SERVICE_CONFIG.provider or "ollama_local").strip().lower()
    if not configured.startswith("ollama") and not _WARNED_UNSUPPORTED_PROVIDER:
        logger.warning(
            "Unsupported AI_PROVIDER '%s' in current runtime; falling back to Ollama provider.",
            configured,
        )
        _WARNED_UNSUPPORTED_PROVIDER = True

    if _CACHED_PROVIDER is None:
        _CACHED_PROVIDER = OllamaProvider()

    return _CACHED_PROVIDER


async def _persist_final_assistant(
    db: AsyncSession,
    *,
    thread: AIThread,
    payload: AssistantPayload,
    usage_acc: dict[str, int],
    raw_protocol: str | None = None,
) -> tuple[str, AssistantPayload, Usage]:
    structured: dict[str, Any] = {
        "citations": [c.model_dump() for c in payload.citations],
        "cards": [c.model_dump() for c in payload.cards],
        "next_actions": [a.model_dump() for a in payload.next_actions],
        "confidence": payload.confidence,
    }
    if raw_protocol:
        structured["raw_protocol"] = raw_protocol

    assistant_msg = await _save_message(
        db,
        thread_id=thread.id,
        role="assistant",
        text=payload.text,
        structured_json=structured,
    )

    thread.last_message_at = datetime.utcnow()
    thread.updated_at = datetime.utcnow()
    return assistant_msg.id, payload, Usage(**usage_acc)


async def handle_chat(db: AsyncSession, *, user_id: str, payload: ChatRequest) -> tuple[str, AssistantPayload, Usage]:
    # Ensure thread exists and belongs to user
    q = await db.execute(select(AIThread).where(AIThread.id == payload.thread_id, AIThread.user_id == user_id))
    thread = q.scalars().first()
    if not thread:
        raise ValueError("Thread not found")

    # Save user message
    await _save_message(db, thread_id=thread.id, role="user", text=payload.message)

    # Load history. The latest item will typically be the just-saved user message.
    history = await _load_recent_messages(db, thread.id)
    history_without_current = _history_without_current_turn(history, payload)
    user_content = _build_user_content(payload)
    must_ground_with_tool = _requires_grounded_tool(payload, thread)
    model_history = _prepare_model_history(history_without_current, grounded=must_ground_with_tool)

    provider = _provider_factory()
    usage_acc = {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
    turn_started = perf_counter()
    llm_calls = 0
    tool_calls_used = 0

    async def _finish(final_payload: AssistantPayload, *, raw_protocol: str | None, reason: str) -> tuple[str, AssistantPayload, Usage]:
        message_id, persisted_payload, usage = await _persist_final_assistant(
            db,
            thread=thread,
            payload=final_payload,
            usage_acc=usage_acc,
            raw_protocol=raw_protocol,
        )
        logger.info(
            "AI turn completed",
            extra={
                "thread_id": thread.id,
                "user_id": user_id,
                "grounded": must_ground_with_tool,
                "tool_calls": tool_calls_used,
                "llm_calls": llm_calls,
                "duration_ms": int((perf_counter() - turn_started) * 1000),
                "reason": reason,
            },
        )
        return message_id, persisted_payload, usage

    # Tool calling loop.
    tool_context_messages: list[dict[str, Any]] = []
    current_user_message = {"role": "user", "content": user_content}
    repair_attempted = False
    grounded_retry_attempted = False
    repeated_tool_call_guard_used = False
    last_tool_signature: str | None = None
    retry_instruction: str | None = None

    while True:
        model_messages = model_history + tool_context_messages + [current_user_message]
        if retry_instruction:
            model_messages.append({"role": "system", "content": retry_instruction})

        try:
            llm = await provider.generate(
                system_prompt=SYSTEM_PROMPT,
                messages=model_messages,
                tools=None,
                num_predict=AI_GROUNDED_NUM_PREDICT if must_ground_with_tool else None,
            )
            llm_calls += 1
        except Exception:
            logger.exception(
                "AI provider call failed",
                extra={
                    "thread_id": thread.id,
                    "user_id": user_id,
                    "provider": type(provider).__name__,
                    "grounded": must_ground_with_tool,
                    "duration_ms": int((perf_counter() - turn_started) * 1000),
                },
            )
            raise

        usage_acc["prompt_tokens"] += int(llm.get("usage", {}).get("prompt_tokens", 0) or 0)
        usage_acc["completion_tokens"] += int(llm.get("usage", {}).get("completion_tokens", 0) or 0)
        usage_acc["total_tokens"] = usage_acc["prompt_tokens"] + usage_acc["completion_tokens"]

        assistant_text = llm.get("assistant_text", "")
        parsed = _safe_json_parse(assistant_text)

        # Retry once with a strict repair instruction if output is not parseable JSON.
        if not parsed:
            if not repair_attempted:
                repair_attempted = True
                retry_instruction = (
                    "Return ONLY one valid JSON object using type='tool_call' or type='final'. "
                    "Use strict JSON (quoted strings, no comments, no ellipsis, no placeholders)."
                )
                continue

            fallback = AssistantPayload(
                text="I had trouble formatting the response. Please rephrase your question briefly.",
                confidence=0.0,
                citations=[],
                cards=[],
                next_actions=[],
            )
            return await _finish(fallback, raw_protocol=assistant_text, reason="invalid_json_fallback")

        msg_type = parsed.get("type")

        if msg_type == "final":
            # For grounded/platform-fact questions, insist on at least one tool call.
            if must_ground_with_tool and tool_calls_used == 0:
                if not grounded_retry_attempted:
                    grounded_retry_attempted = True
                    retry_instruction = (
                        "This user request needs grounded platform data. "
                        "Respond with a valid TOOL CALL JSON first (strict JSON, no placeholders)."
                    )
                    continue

                stop_payload = AssistantPayload(
                    text="I need grounded ConstructHub data first. Please provide project_id, material+location, or profession+location so I can run a lookup.",
                    confidence=0.0,
                    citations=[],
                    cards=[],
                    next_actions=[],
                )
                return await _finish(stop_payload, raw_protocol=assistant_text, reason="grounding_required")

            assistant_payload = _assistant_payload_from_final(parsed)
            return await _finish(assistant_payload, raw_protocol=assistant_text, reason="model_final")

        if msg_type == "tool_call":
            retry_instruction = None

            tool_protocol_msg = await _save_message(
                db,
                thread_id=thread.id,
                role="tool",
                text=None,
                structured_json={"raw_protocol": assistant_text, "parsed": parsed},
            )

            if tool_calls_used >= AI_MAX_TOOL_CALLS:
                stop_payload = AssistantPayload(
                    text="I need one more detail to proceed. Please specify your project (or location/material) so I can search accurately.",
                    confidence=0.0,
                    citations=[],
                    cards=[],
                    next_actions=[],
                )
                return await _finish(stop_payload, raw_protocol=assistant_text, reason="tool_call_limit")

            # Normalize/validate tool name
            tool_name = parsed.get("tool_name")
            if not tool_name and parsed.get("type_name"):
                tool_name = parsed.get("type_name")
            tool_args = parsed.get("args") or {}

            if not tool_name or str(tool_name) not in ALLOWED_TOOLS:
                stop_payload = AssistantPayload(
                    text="I couldn't tell which tool to use. Please say if you want an estimate summary (with project_id), technician search (with profession/location), material search (with material/location), or a rough cost.",
                    confidence=0.0,
                    citations=[],
                    cards=[],
                    next_actions=[],
                )
                return await _finish(stop_payload, raw_protocol=assistant_text, reason="invalid_tool_name")

            # Required-arg preflight to avoid useless tool calls
            required_args: dict[str, list[str]] = {
                "get_estimate_summary": ["project_id"],
                "get_project_summary": ["project_id"],
                "search_material_listings": ["material"],
                "search_technicians": ["profession"],
            }
            # Fill missing project_id from request context, then fall back to thread context.
            if tool_name in ("get_estimate_summary", "get_project_summary") and _is_placeholder_value(tool_args.get("project_id")):
                fallback_project_id = _resolve_context_project_id(payload, thread)
                if fallback_project_id:
                    tool_args["project_id"] = fallback_project_id
                else:
                    tool_args.pop("project_id", None)

            missing = [a for a in required_args.get(str(tool_name), []) if tool_args.get(a) in (None, "", [])]
            if missing:
                stop_payload = AssistantPayload(
                    text=f"I need {', '.join(missing)} to proceed. Please provide it and I'll continue.",
                    confidence=0.0,
                    citations=[],
                    cards=[],
                    next_actions=[],
                )
                return await _finish(stop_payload, raw_protocol=assistant_text, reason="missing_tool_args")

            tool_signature = json.dumps({"tool_name": tool_name, "args": tool_args}, sort_keys=True, default=str)
            if tool_signature == last_tool_signature:
                if not repeated_tool_call_guard_used:
                    repeated_tool_call_guard_used = True
                    retry_instruction = (
                        "You already have the tool result in context. "
                        "Return type='final' JSON now and do not repeat the same tool call."
                    )
                    continue

                stop_payload = AssistantPayload(
                    text="I could not finalize the grounded answer from the available tool result. Please rephrase your question.",
                    confidence=0.0,
                    citations=[],
                    cards=[],
                    next_actions=[],
                )
                return await _finish(stop_payload, raw_protocol=assistant_text, reason="repeated_tool_call")

            # Execute tool
            tool_started = perf_counter()
            try:
                result = await _run_tool(tool_name, tool_args, db=db, user_id=user_id)
                await _log_tool_call(
                    db,
                    assistant_message_id=tool_protocol_msg.id,
                    tool_name=str(tool_name),
                    tool_args=tool_args,
                    tool_result=result,
                    status="ok",
                    latency_ms=int((perf_counter() - tool_started) * 1000),
                )
            except Exception as e:
                err = {"error": str(e)}
                await _log_tool_call(
                    db,
                    assistant_message_id=tool_protocol_msg.id,
                    tool_name=str(tool_name),
                    tool_args=tool_args,
                    tool_result=err,
                    status="error",
                    latency_ms=int((perf_counter() - tool_started) * 1000),
                )
                result = err

            tool_calls_used += 1
            last_tool_signature = tool_signature
            repeated_tool_call_guard_used = False

            synthesized_payload = _synthesize_tool_result(str(tool_name), tool_args, result)
            if synthesized_payload is not None:
                return await _finish(synthesized_payload, raw_protocol=assistant_text, reason="tool_synthesized")

            tool_context_messages.append(
                {
                    "role": "tool",
                    "content": json.dumps({"tool_name": tool_name, "result": result}),
                }
            )
            continue

        # Unknown type: retry once, then fallback.
        if not repair_attempted:
            repair_attempted = True
            retry_instruction = (
                "The previous output was invalid. Respond with exactly one strict JSON object "
                "with type='tool_call' or type='final' and no placeholders."
            )
            continue

        fallback = AssistantPayload(
            text="I could not interpret the assistant response. Please try again.",
            confidence=0.0,
        )
        return await _finish(fallback, raw_protocol=assistant_text, reason="unknown_message_type")


async def stream_chat_events(
    db: AsyncSession,
    *,
    user_id: str,
    payload: ChatRequest,
) -> AsyncIterator[dict[str, Any]]:
    stream_started = perf_counter()
    q = await db.execute(select(AIThread).where(AIThread.id == payload.thread_id, AIThread.user_id == user_id))
    thread = q.scalars().first()
    if not thread:
        raise ValueError("Thread not found")

    # Tool-grounded questions use the existing deterministic non-stream flow.
    if _requires_grounded_tool(payload, thread):
        status_msg = "Checking project data..." if _resolve_context_project_id(payload, thread) else "Analyzing your request..."
        yield {"event": "status", "data": {"message": status_msg, "mode": "non_stream_tool"}}
        grounded_started = perf_counter()
        message_id, assistant_payload, usage = await handle_chat(db, user_id=user_id, payload=payload)
        grounded_total_ms = int((perf_counter() - grounded_started) * 1000)
        logger.info(
            "AI grounded stream fallback completed",
            extra={
                "thread_id": payload.thread_id,
                "user_id": user_id,
                "grounded_total_ms": grounded_total_ms,
            },
        )
        yield {"event": "fallback", "data": {"mode": "non_stream_tool"}}
        yield {
            "event": "done",
            "data": {
                "thread_id": payload.thread_id,
                "message_id": message_id,
                "assistant": assistant_payload.model_dump(),
                "usage": usage.model_dump(),
                "mode": "non_stream_tool",
                "timing": {"grounded_total_ms": grounded_total_ms},
            },
        }
        return

    # Streaming text mode (non-tool path).
    await _save_message(db, thread_id=thread.id, role="user", text=payload.message)
    history = await _load_recent_messages(db, thread.id)
    history_without_current = _history_without_current_turn(history, payload)
    user_content = _build_user_content(payload)
    provider = _provider_factory()
    yield {"event": "status", "data": {"message": "Thinking...", "mode": "stream_text"}}

    deltas: list[str] = []
    first_chunk_ms: int | None = None
    try:
        async for delta in provider.stream_generate(
            system_prompt=STREAM_TEXT_SYSTEM_PROMPT,
            messages=history_without_current + [{"role": "user", "content": user_content}],
            num_predict=AI_STREAM_NUM_PREDICT,
        ):
            if not delta:
                continue
            if first_chunk_ms is None:
                first_chunk_ms = int((perf_counter() - stream_started) * 1000)
            deltas.append(delta)
            yield {"event": "chunk", "data": {"delta": delta}}
    except Exception:
        logger.exception(
            "AI stream provider call failed",
            extra={
                "thread_id": thread.id,
                "user_id": user_id,
                "provider": type(provider).__name__,
                "elapsed_ms": int((perf_counter() - stream_started) * 1000),
            },
        )
        fallback = AssistantPayload(
            text="The live stream was interrupted. Please try again.",
            confidence=0.0,
            citations=[],
            cards=[],
            next_actions=[],
        )
        message_id, assistant_payload, usage = await _persist_final_assistant(
            db,
            thread=thread,
            payload=fallback,
            usage_acc={"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
            raw_protocol=None,
        )
        yield {"event": "error", "data": {"detail": "stream_failed"}}
        yield {
            "event": "done",
            "data": {
                "thread_id": payload.thread_id,
                "message_id": message_id,
                "assistant": assistant_payload.model_dump(),
                "usage": usage.model_dump(),
                "mode": "stream_fallback",
                "timing": {"total_ms": int((perf_counter() - stream_started) * 1000)},
            },
        }
        return

    final_text = "".join(deltas).strip()
    if not final_text:
        final_text = "I could not generate a response. Please try again."
    final_text = re.sub(r"\s+\n", "\n", final_text).strip()

    assistant_payload = AssistantPayload(
        text=final_text,
        confidence=0.0,
        citations=[],
        cards=[],
        next_actions=[],
    )
    message_id, assistant_payload, usage = await _persist_final_assistant(
        db,
        thread=thread,
        payload=assistant_payload,
        usage_acc={"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
        raw_protocol=None,
    )
    total_ms = int((perf_counter() - stream_started) * 1000)
    logger.info(
        "AI text stream completed",
        extra={
            "thread_id": payload.thread_id,
            "user_id": user_id,
            "first_chunk_ms": first_chunk_ms,
            "total_ms": total_ms,
        },
    )
    yield {
        "event": "done",
        "data": {
            "thread_id": payload.thread_id,
            "message_id": message_id,
            "assistant": assistant_payload.model_dump(),
            "usage": usage.model_dump(),
            "mode": "stream_text",
            "timing": {"first_chunk_ms": first_chunk_ms, "total_ms": total_ms},
        },
    }
