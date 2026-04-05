from __future__ import annotations

from dataclasses import dataclass
import os


def _int_env(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except Exception:
        return default


def _optional_int_env(name: str) -> int | None:
    raw = os.getenv(name)
    if raw is None:
        return None
    try:
        value = int(raw)
        return value if value > 0 else None
    except Exception:
        return None


def _float_env(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, str(default)))
    except Exception:
        return default


@dataclass(frozen=True)
class AIServiceConfig:
    provider: str
    max_tool_calls: int
    max_history_messages: int

    @classmethod
    def from_env(cls) -> "AIServiceConfig":
        return cls(
            provider=os.getenv("AI_PROVIDER", "ollama_local"),
            max_tool_calls=_int_env("AI_MAX_TOOL_CALLS", 4),
            max_history_messages=_int_env("AI_MAX_HISTORY_MESSAGES", 12),
        )


@dataclass(frozen=True)
class OllamaConfig:
    base_url: str
    model: str
    temperature: float
    timeout: float
    num_predict: int | None

    @classmethod
    def from_env(cls) -> "OllamaConfig":
        return cls(
            base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/"),
            model=os.getenv("OLLAMA_MODEL", "llama3:8b"),
            temperature=_float_env("AI_TEMPERATURE", 0.2),
            timeout=_float_env("OLLAMA_TIMEOUT", 120.0),
            num_predict=_optional_int_env("OLLAMA_NUM_PREDICT") or 256,
        )
