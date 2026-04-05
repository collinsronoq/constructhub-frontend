# app/ai/service.py
from __future__ import annotations

import json
import re
from datetime import datetime
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
Do not add markdown, labels, schema text, placeholders, pipes, or ellipsis.
Use real argument values from the user/context.

Allowed output #1 (tool call object):
- type: "tool_call"
- tool_name: one of "get_estimate_summary", "search_material_listings", "search_technicians", "rough_cost_estimate"
- args: JSON object with actual argument values (no placeholders)

Allowed output #2 (final object):
- type: "final"
- text: string
- confidence: number
- citations: array
- cards: array
- next_actions: array

Rules:
- If the user asks for ConstructHub platform facts (estimate/project/vendor/technician/material listing), call a tool first.
- If required args are missing, return FINAL asking for the missing detail (short clarification).
- For get_estimate_summary, use project_id from user/context only; never invent placeholders like "your_project_id" or "abc-123".
- After a tool result is provided in context, respond with FINAL on the next response (do not repeat the same tool call).
- Required args:
  - get_estimate_summary: project_id
  - search_material_listings: material (optional location, max_price, limit)
  - search_technicians: profession (optional location, verified_only, limit)
  - rough_cost_estimate: floor_area_sqm OR bedrooms/bathrooms (optional quality, location)
- Tool key must be "tool_name" (not "type_name").
- Maximum tool calls per user message: {AI_MAX_TOOL_CALLS}.
- Keep answers practical and avoid legal determinations.
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

    provider = _provider_factory()
    usage_acc = {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}

    # Tool calling loop.
    tool_calls_used = 0
    tool_context_messages: list[dict[str, Any]] = []
    current_user_message = {"role": "user", "content": user_content}
    repair_attempted = False
    grounded_retry_attempted = False
    repeated_tool_call_guard_used = False
    last_tool_signature: str | None = None
    retry_instruction: str | None = None
    must_ground_with_tool = _requires_grounded_tool(payload, thread)

    while True:
        model_messages = history_without_current + tool_context_messages + [current_user_message]
        if retry_instruction:
            model_messages.append({"role": "system", "content": retry_instruction})

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
            return await _persist_final_assistant(
                db,
                thread=thread,
                payload=fallback,
                usage_acc=usage_acc,
                raw_protocol=assistant_text,
            )

        msg_type = parsed.get("type")

        if msg_type == "final":
            # For grounded/platform-fact questions, insist on at least one tool call.
            if must_ground_with_tool and tool_calls_used == 0:
                if not grounded_retry_attempted:
                    grounded_retry_attempted = True
                    retry_instruction = (
                        "This user request needs grounded platform data. "
                        "Respond with a valid TOOL CALL JSON first (strict JSON, no placeholders), "
                        "then final only after tool result."
                    )
                    continue

                stop_payload = AssistantPayload(
                    text="I need grounded ConstructHub data first. Please provide project_id, material+location, or profession+location so I can run a lookup.",
                    confidence=0.0,
                    citations=[],
                    cards=[],
                    next_actions=[],
                )
                return await _persist_final_assistant(
                    db,
                    thread=thread,
                    payload=stop_payload,
                    usage_acc=usage_acc,
                    raw_protocol=assistant_text,
                )

            assistant_payload = _assistant_payload_from_final(parsed)
            return await _persist_final_assistant(
                db,
                thread=thread,
                payload=assistant_payload,
                usage_acc=usage_acc,
                raw_protocol=assistant_text,
            )

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
                return await _persist_final_assistant(
                    db,
                    thread=thread,
                    payload=stop_payload,
                    usage_acc=usage_acc,
                    raw_protocol=assistant_text,
                )

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
                return await _persist_final_assistant(
                    db,
                    thread=thread,
                    payload=stop_payload,
                    usage_acc=usage_acc,
                    raw_protocol=assistant_text,
                )

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
                return await _persist_final_assistant(
                    db,
                    thread=thread,
                    payload=stop_payload,
                    usage_acc=usage_acc,
                    raw_protocol=assistant_text,
                )

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
                return await _persist_final_assistant(
                    db,
                    thread=thread,
                    payload=stop_payload,
                    usage_acc=usage_acc,
                    raw_protocol=assistant_text,
                )

            # Execute tool
            try:
                result = await _run_tool(tool_name, tool_args, db=db, user_id=user_id)
                await _log_tool_call(
                    db,
                    assistant_message_id=tool_protocol_msg.id,
                    tool_name=str(tool_name),
                    tool_args=tool_args,
                    tool_result=result,
                    status="ok",
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
                )
                result = err

            tool_calls_used += 1
            last_tool_signature = tool_signature
            repeated_tool_call_guard_used = False
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
        return await _persist_final_assistant(
            db,
            thread=thread,
            payload=fallback,
            usage_acc=usage_acc,
            raw_protocol=assistant_text,
        )


async def stream_chat_events(
    db: AsyncSession,
    *,
    user_id: str,
    payload: ChatRequest,
) -> AsyncIterator[dict[str, Any]]:
    q = await db.execute(select(AIThread).where(AIThread.id == payload.thread_id, AIThread.user_id == user_id))
    thread = q.scalars().first()
    if not thread:
        raise ValueError("Thread not found")

    # Tool-grounded questions use the existing deterministic non-stream flow.
    if _requires_grounded_tool(payload, thread):
        message_id, assistant_payload, usage = await handle_chat(db, user_id=user_id, payload=payload)
        yield {"event": "fallback", "data": {"mode": "non_stream_tool"}}
        yield {
            "event": "done",
            "data": {
                "thread_id": payload.thread_id,
                "message_id": message_id,
                "assistant": assistant_payload.model_dump(),
                "usage": usage.model_dump(),
                "mode": "non_stream_tool",
            },
        }
        return

    # Streaming text mode (non-tool path).
    await _save_message(db, thread_id=thread.id, role="user", text=payload.message)
    history = await _load_recent_messages(db, thread.id)
    history_without_current = _history_without_current_turn(history, payload)
    user_content = _build_user_content(payload)
    provider = _provider_factory()

    deltas: list[str] = []
    try:
        async for delta in provider.stream_generate(
            system_prompt=STREAM_TEXT_SYSTEM_PROMPT,
            messages=history_without_current + [{"role": "user", "content": user_content}],
        ):
            if not delta:
                continue
            deltas.append(delta)
            yield {"event": "chunk", "data": {"delta": delta}}
    except Exception:
        logger.exception(
            "AI stream provider call failed",
            extra={"thread_id": thread.id, "user_id": user_id, "provider": type(provider).__name__},
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
    yield {
        "event": "done",
        "data": {
            "thread_id": payload.thread_id,
            "message_id": message_id,
            "assistant": assistant_payload.model_dump(),
            "usage": usage.model_dump(),
            "mode": "stream_text",
        },
    }
