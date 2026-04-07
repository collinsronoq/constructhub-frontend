# app/ai/providers/ollama_provider.py
from __future__ import annotations

import json
from typing import AsyncIterator
from typing import Any, Optional

import httpx

from app.ai.config import OllamaConfig
from app.ai.providers.base import LLMProvider
from app.core.logging import setup_logger


logger = setup_logger("ai.provider.ollama")


class OllamaProvider(LLMProvider):
    """
    Calls local Ollama HTTP API.
    Uses /api/chat with messages and returns a single assistant message.
    """

    def __init__(self, *, config: Optional[OllamaConfig] = None, client: Optional[httpx.AsyncClient] = None) -> None:
        cfg = config or OllamaConfig.from_env()
        self.base_url = cfg.base_url
        self.model = cfg.model
        self.temperature = cfg.temperature
        self.timeout = cfg.timeout
        self.num_predict = cfg.num_predict
        self._client = client
        self._logged_runtime_config = False

    def _get_client(self) -> httpx.AsyncClient:
        if self._client is None:
            # Reuse one async client to avoid per-request connection setup overhead.
            self._client = httpx.AsyncClient(timeout=self.timeout)
        return self._client

    async def generate(
        self,
        *,
        system_prompt: str,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]] | None = None,
        num_predict: int | None = None,
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
        effective_num_predict = num_predict if num_predict is not None else self.num_predict
        if effective_num_predict:
            payload["options"]["num_predict"] = effective_num_predict

        if not self._logged_runtime_config:
            logger.info(
                "Ollama provider active",
                extra={
                    "model": self.model,
                    "base_url": self.base_url,
                    "temperature": self.temperature,
                    "num_predict": effective_num_predict,
                },
            )
            self._logged_runtime_config = True

        client = self._get_client()
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

    async def stream_generate(
        self,
        *,
        system_prompt: str,
        messages: list[dict[str, Any]],
        num_predict: int | None = None,
    ) -> AsyncIterator[str]:
        """
        Stream assistant text deltas from Ollama /api/chat (NDJSON stream).
        """
        ollama_messages = [{"role": "system", "content": system_prompt}, *messages]
        payload = {
            "model": self.model,
            "messages": ollama_messages,
            "stream": True,
            "options": {"temperature": self.temperature},
        }
        effective_num_predict = num_predict if num_predict is not None else self.num_predict
        if effective_num_predict:
            payload["options"]["num_predict"] = effective_num_predict

        if not self._logged_runtime_config:
            logger.info(
                "Ollama provider active",
                extra={
                    "model": self.model,
                    "base_url": self.base_url,
                    "temperature": self.temperature,
                    "num_predict": effective_num_predict,
                },
            )
            self._logged_runtime_config = True

        client = self._get_client()
        async with client.stream("POST", f"{self.base_url}/api/chat", json=payload) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if not line:
                    continue
                try:
                    data = json.loads(line)
                except Exception:
                    continue

                delta = (data.get("message") or {}).get("content", "") or ""
                if delta:
                    yield delta

                if data.get("done"):
                    break
