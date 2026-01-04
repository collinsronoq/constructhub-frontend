# app/ai/providers/base.py
from abc import ABC, abstractmethod
from typing import Any

class LLMProvider(ABC):
    @abstractmethod
    async def generate(self, *, system_prompt: str, messages: list[dict[str, Any]], tools: list[dict[str, Any]]) -> dict[str, Any]:
        """
        Return a dict that includes:
          - assistant_text (str) OR tool_calls (list)
          - usage info if available
        """
        raise NotImplementedError
