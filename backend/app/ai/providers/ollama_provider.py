# app/ai/providers/ollama_provider.py
from __future__ import annotations

import os
from typing import Any, Optional

import httpx

from app.ai.providers.base import LLMProvider


class OllamaProvider(LLMProvider):
    """
    Calls local Ollama HTTP API.
    Uses /api/chat with messages and returns a single assistant message.
    """

    def __init__(self) -> None:
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
        self.model = os.getenv("OLLAMA_MODEL", "llama3:8b")
        self.temperature = float(os.getenv("AI_TEMPERATURE", "0.2"))
        self.timeout = float(os.getenv("OLLAMA_TIMEOUT", "120"))

    async def generate(
        self,
        *,
        system_prompt: str,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        """
        tools is unused at the HTTP level for Ollama in this implementation.
        We enforce tool calling via a strict JSON protocol in the system prompt.
        """
        # Ollama expects: [{"role": "...", "content": "..."}]
        ollama_messages = [{"role": "system", "content": system_prompt}, *messages]

        payload = {
            "model": self.model,
            "messages": ollama_messages,
            "stream": False,
            "options": {"temperature": self.temperature},
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.post(f"{self.base_url}/api/chat", json=payload)
            r.raise_for_status()
            data = r.json()

        # Typical response includes { "message": {"role":"assistant","content":"..."}, ... }
        content = (data.get("message") or {}).get("content", "") or ""

        # token usage fields may exist but are not guaranteed; keep optional
        usage = {
            "prompt_tokens": int(data.get("prompt_eval_count", 0) or 0),
            "completion_tokens": int(data.get("eval_count", 0) or 0),
        }
        usage["total_tokens"] = usage["prompt_tokens"] + usage["completion_tokens"]

        return {
            "assistant_text": content,
            "usage": usage,
            "raw": data,
        }
