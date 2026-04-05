# app/ai/service/service_openai.py
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.schemas.schemas import ChatRequest, AssistantPayload, Usage


async def handle_chat(db: AsyncSession, *, user_id: str, payload: ChatRequest) -> tuple[str, AssistantPayload, Usage]:
    """
    Legacy placeholder for a future OpenAI migration.
    The active runtime router uses app.ai.service.service_ollama.handle_chat.
    """
    raise RuntimeError(
        "OpenAI chat service is not active in the current runtime. "
        "Use app.ai.service.service_ollama.handle_chat."
    )
