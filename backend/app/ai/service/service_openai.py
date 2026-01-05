# app/ai/service.py
from __future__ import annotations

from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai import AIThread, AIMessage, AIToolCall
from app.ai.schemas.schemas import ChatRequest, AssistantPayload, Card, NextAction, Citation, Usage
from app.ai.tools.tools import get_estimate_summary, search_material_listings, search_technicians, rough_cost_estimate
from app.ai.providers.openai_provider import OpenAIProvider


SYSTEM_PROMPT = """
You are the ConstructHub AI Construction Assistant.
You MUST use tools for factual platform data (estimates, vendors, technicians).
If you do not have enough data, ask a short follow-up question.
Do not provide legal determinations; provide general guidance and suggest verification with relevant authorities when asked about compliance.
Respond in a concise, practical style suitable for builders in Kenya.
"""


def build_tool_schemas() -> list[dict]:
    # JSON-schema tool definitions for the model (function calling)
    return [
        {
            "type": "function",
            "function": {
                "name": "get_estimate_summary",
                "description": "Get estimate summary and breakdown for a given project.",
                "parameters": {
                    "type": "object",
                    "properties": {"project_id": {"type": "string"}},
                    "required": ["project_id"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "search_material_listings",
                "description": "Search marketplace material listings by material and optional location/price.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "material": {"type": "string"},
                        "location": {"type": "string"},
                        "max_price": {"type": "number"},
                        "limit": {"type": "integer", "default": 5},
                    },
                    "required": ["material"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "search_technicians",
                "description": "Search verified technicians by profession and optional location.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "profession": {"type": "string"},
                        "location": {"type": "string"},
                        "verified_only": {"type": "boolean", "default": True},
                        "limit": {"type": "integer", "default": 5},
                    },
                    "required": ["profession"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "rough_cost_estimate",
                "description": "Give a rough residential build cost band when no estimate_id exists.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "bedrooms": {"type": "integer"},
                        "bathrooms": {"type": "integer"},
                        "floor_area_sqm": {"type": "number"},
                        "quality": {"type": "string", "enum": ["basic", "standard", "premium"], "default": "standard"},
                        "location": {"type": "string"},
                    },
                    "required": [],
                },
            },
        },
    ]


async def _load_recent_messages(db: AsyncSession, thread_id: str, limit: int = 12) -> list[dict]:
    q = await db.execute(
        select(AIMessage).where(AIMessage.thread_id == thread_id).order_by(AIMessage.created_at.desc()).limit(limit)
    )
    rows = list(reversed(q.scalars().all()))
    messages = []
    for m in rows:
        if not m.text:
            continue
        messages.append({"role": m.role, "content": m.text})
    return messages


async def _save_message(db: AsyncSession, *, thread_id: str, role: str, text: str | None, structured_json: dict | None = None) -> AIMessage:
    msg = AIMessage(thread_id=thread_id, role=role, text=text, structured_json=structured_json)
    db.add(msg)
    await db.flush()
    return msg


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


async def handle_chat(db: AsyncSession, *, user_id: str, payload: ChatRequest) -> tuple[str, AssistantPayload, Usage]:
    # Ensure thread exists and belongs to user
    q = await db.execute(select(AIThread).where(AIThread.id == payload.thread_id, AIThread.user_id == user_id))
    thread = q.scalars().first()
    if not thread:
        raise ValueError("Thread not found")

    # Save user message
    await _save_message(db, thread_id=thread.id, role="user", text=payload.message)

    # Prepare LLM input
    history = await _load_recent_messages(db, thread.id)
    tools = build_tool_schemas()
    provider = OpenAIProvider()

    # Call provider (first pass)
    raw = await provider.generate(system_prompt=SYSTEM_PROMPT, messages=history + [{"role": "user", "content": payload.message}], tools=tools)

    # NOTE:
    # Parsing tool calls depends on the exact OpenAI response structure.
    # Implement parsing next once you confirm your OpenAI SDK version and response shape.
    # For now, we return a placeholder assistant response so your wiring works end-to-end.
    assistant_text = "AI module wired successfully. Next: parse tool calls from OpenAI response and execute tools."

    # Save assistant message
    assistant_msg = await _save_message(db, thread_id=thread.id, role="assistant", text=assistant_text)

    # Update thread timestamps
    thread.last_message_at = datetime.utcnow()
    thread.updated_at = datetime.utcnow()

    assistant_payload = AssistantPayload(
        text=assistant_text,
        confidence=0.2,
        citations=[],
        cards=[],
        next_actions=[],
    )

    usage = Usage()
    return assistant_msg.id, assistant_payload, usage
