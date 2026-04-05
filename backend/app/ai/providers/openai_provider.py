# app/ai/providers/openai_provider.py
from __future__ import annotations

from typing import Any

from app.ai.providers.base import LLMProvider


class OpenAIProvider(LLMProvider):
    """
    Legacy placeholder kept for future migration work.
    OpenAI is not an active runtime provider in the current Ollama-first path.
    """

    async def generate(
        self,
        *,
        system_prompt: str,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        raise NotImplementedError(
            "OpenAIProvider is not active in the current runtime. "
            "Use OllamaProvider via app.ai.service.service_ollama."
        )
