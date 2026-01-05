# app/ai/service.py
from __future__ import annotations

import json
import os
from datetime import datetime
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai import AIThread, AIMessage, AIToolCall
from app.ai.schemas.schemas import ChatRequest, AssistantPayload, Card, NextAction, Citation, Usage
from app.ai.prompts import get_prompt
from app.ai.tools.tools import get_estimate_summary, search_material_listings, search_technicians, rough_cost_estimate
from app.core.logging import setup_logger

from app.ai.providers.ollama_provider import OllamaProvider
# Later: from app.ai.providers.openai_provider import OpenAIProvider


def _int_env(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except Exception:
        return default


AI_MAX_TOOL_CALLS = _int_env("AI_MAX_TOOL_CALLS", 4)
AI_MAX_HISTORY_MESSAGES = _int_env("AI_MAX_HISTORY_MESSAGES", 12)
logger = setup_logger("ai.service.ollama")
ALLOWED_TOOLS = {
    "get_estimate_summary",
    "get_project_summary",
    "search_material_listings",
    "search_technicians",
    "rough_cost_estimate",
}


SYSTEM_PROMPT = f"""
You are the ConstructHub AI Construction Assistant.

Hard rules:
1) If the user asks for platform facts (estimates, vendors, technicians), you MUST call a tool.
2) You MUST respond with ONLY valid JSON (no markdown, no extra text).
3) You can respond in ONLY one of these JSON formats:

TOOL CALL:
{{
  "type": "tool_call",
  "tool_name": "get_estimate_summary" | "search_material_listings" | "search_technicians" | "rough_cost_estimate",
  "args": {{ ... }}
}}

FINAL ANSWER:
{{
  "type": "final",
  "text": "string",
  "confidence": 0.0,
  "citations": [{{"type":"estimate|vendor|technician|knowledge","id":"string","chunk_id":null}}],
  "cards": [{{"type":"string","title":"string","subtitle":null,"data":{{}}}}],
  "next_actions": [{{"label":"string","action":"string","payload":{{}}}}]
}}

Tool arg rules (ask a short clarification if missing; do NOT call tools with missing required args):
- get_estimate_summary: requires project_id (estimate_id).
- search_material_listings: requires material; optional location, max_price, limit.
- search_technicians: requires profession; optional location, verified_only, limit.
- rough_cost_estimate: needs floor_area_sqm OR bedrooms/bathrooms; optional quality, location.

Tool JSON must use key "tool_name" (not "type_name").

Examples of valid tool calls:
- {{ "type": "tool_call", "tool_name": "get_estimate_summary", "args": {{ "project_id": "bd74f501-8d93-4d50-9f8f-75a715aa69bb" }} }}
- {{ "type": "tool_call", "tool_name": "search_technicians", "args": {{ "profession": "plumber", "location": "Nakuru" }} }}
- {{ "type": "tool_call", "tool_name": "rough_cost_estimate", "args": {{ "bedrooms": 3, "location": "Kiambu" }} }}

Common requests and preferred actions:
- "summarize my estimate" -> call get_estimate_summary with project_id/estimate_id if provided; else ask for it.
- "find masons in Nakuru" -> call search_technicians with profession + location.
- "find cement deals in Nairobi under 800" -> call search_material_listings with material + location + max_price.
- "rough cost for 3-bedroom" -> call rough_cost_estimate with bedrooms (or floor_area_sqm if provided).
- For general guidance (permits, tips), respond with FINAL without tools.

Constraints:
- Keep answers practical for builders in Kenya.
- Do not provide legal determinations; provide general guidance and suggest verifying with relevant authorities.
- Maximum tool calls per user message: {AI_MAX_TOOL_CALLS}.
""".strip()


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


def _provider_factory():
    provider = os.getenv("AI_PROVIDER", "ollama_local")
    if provider.startswith("ollama"):
        return OllamaProvider()
    # Later:
    # if provider == "openai":
    #     return OpenAIProvider()
    return OllamaProvider()


async def handle_chat(db: AsyncSession, *, user_id: str, payload: ChatRequest) -> tuple[str, AssistantPayload, Usage]:
    # Ensure thread exists and belongs to user
    q = await db.execute(select(AIThread).where(AIThread.id == payload.thread_id, AIThread.user_id == user_id))
    thread = q.scalars().first()
    if not thread:
        raise ValueError("Thread not found")

    # Save user message
    await _save_message(db, thread_id=thread.id, role="user", text=payload.message)

    # Load history
    history = await _load_recent_messages(db, thread.id)

    provider = _provider_factory()
    usage_acc = {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}

    # Tool calling loop
    tool_calls_used = 0
    tool_context_messages: list[dict[str, Any]] = []

    while True:
        # Build user content with optional prompt template and context
        user_content_parts = []
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
        user_content = "\n".join([part for part in user_content_parts if part])

        model_messages = history + tool_context_messages + [{"role": "user", "content": user_content}]
        try:
            llm = await provider.generate(system_prompt=SYSTEM_PROMPT, messages=model_messages, tools=None)
        except Exception:
            logger.exception(
                "AI provider call failed",
                extra={"thread_id": thread.id, "user_id": user_id, "provider": type(provider).__name__},
            )
            raise

        usage_acc["prompt_tokens"] += int(llm.get("usage", {}).get("prompt_tokens", 0) or 0)
        usage_acc["completion_tokens"] += int(llm.get("usage", {}).get("completion_tokens", 0) or 0)
        usage_acc["total_tokens"] = usage_acc["prompt_tokens"] + usage_acc["completion_tokens"]

        assistant_text = llm.get("assistant_text", "")

        # Save assistant raw message (text) for traceability
        assistant_msg = await _save_message(db, thread_id=thread.id, role="assistant", text=assistant_text)

        parsed = _safe_json_parse(assistant_text)

        # If it didn't produce valid JSON, fallback with a controlled message
        if not parsed:
            fallback = AssistantPayload(
                text="I had trouble formatting the response. Please rephrase your question briefly.",
                confidence=0.0,
                citations=[],
                cards=[],
                next_actions=[],
            )
            thread.last_message_at = datetime.utcnow()
            thread.updated_at = datetime.utcnow()
            return assistant_msg.id, fallback, Usage(**usage_acc)

        msg_type = parsed.get("type")

        if msg_type == "final":
            assistant_payload = _assistant_payload_from_final(parsed)

            # Persist structured payload for UI
            assistant_msg.structured_json = {
                "citations": [c.model_dump() for c in assistant_payload.citations],
                "cards": [c.model_dump() for c in assistant_payload.cards],
                "next_actions": [a.model_dump() for a in assistant_payload.next_actions],
                "confidence": assistant_payload.confidence,
            }

            thread.last_message_at = datetime.utcnow()
            thread.updated_at = datetime.utcnow()
            return assistant_msg.id, assistant_payload, Usage(**usage_acc)

        if msg_type == "tool_call":
            if tool_calls_used >= AI_MAX_TOOL_CALLS:
                stop_payload = AssistantPayload(
                    text="I need one more detail to proceed. Please specify your project (or location/material) so I can search accurately.",
                    confidence=0.0,
                    citations=[],
                    cards=[],
                    next_actions=[],
                )
                thread.last_message_at = datetime.utcnow()
                thread.updated_at = datetime.utcnow()
                return assistant_msg.id, stop_payload, Usage(**usage_acc)

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
                thread.last_message_at = datetime.utcnow()
                thread.updated_at = datetime.utcnow()
                return assistant_msg.id, stop_payload, Usage(**usage_acc)

            # Required-arg preflight to avoid useless tool calls
            required_args: dict[str, list[str]] = {
                "get_estimate_summary": ["project_id"],
                "get_project_summary": ["project_id"],
                "search_material_listings": ["material"],
                "search_technicians": ["profession"],
            }
            # Fill missing project_id from context if present
            if tool_name in ("get_estimate_summary", "get_project_summary") and not tool_args.get("project_id"):
                ctx_pid = getattr(payload.context, "project_id", None) if payload.context else None
                if ctx_pid:
                    tool_args["project_id"] = ctx_pid

            missing = [a for a in required_args.get(str(tool_name), []) if tool_args.get(a) in (None, "", [])]
            if missing:
                stop_payload = AssistantPayload(
                    text=f"I need {', '.join(missing)} to proceed. Please provide it and I'll continue.",
                    confidence=0.0,
                    citations=[],
                    cards=[],
                    next_actions=[],
                )
                thread.last_message_at = datetime.utcnow()
                thread.updated_at = datetime.utcnow()
                return assistant_msg.id, stop_payload, Usage(**usage_acc)

            # Execute tool
            try:
                result = await _run_tool(tool_name, tool_args, db=db, user_id=user_id)
                await _log_tool_call(
                    db,
                    assistant_message_id=assistant_msg.id,
                    tool_name=str(tool_name),
                    tool_args=tool_args,
                    tool_result=result,
                    status="ok",
                )
            except Exception as e:
                err = {"error": str(e)}
                await _log_tool_call(
                    db,
                    assistant_message_id=assistant_msg.id,
                    tool_name=str(tool_name),
                    tool_args=tool_args,
                    tool_result=err,
                    status="error",
                )
                result = err

            tool_calls_used += 1

            # Provide tool result back to the model as context for the next turn
            tool_context_messages.append(
                {
                    "role": "tool",
                    "content": json.dumps({"tool_name": tool_name, "result": result}),
                }
            )

            # Continue loop: model will (ideally) produce a "final"
            continue

        # Unknown type: fallback
        fallback = AssistantPayload(
            text="I could not interpret the assistant response. Please try again.",
            confidence=0.0,
        )
        thread.last_message_at = datetime.utcnow()
        thread.updated_at = datetime.utcnow()
        return assistant_msg.id, fallback, Usage(**usage_acc)
