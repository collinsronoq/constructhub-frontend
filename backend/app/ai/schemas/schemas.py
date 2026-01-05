# app/ai/schemas.py
from pydantic import BaseModel, Field
from typing import Literal, Optional, Any


class ThreadCreateRequest(BaseModel):
    project_id: Optional[str] = None
    title: Optional[str] = None


class ThreadResponse(BaseModel):
    thread_id: str
    title: str
    project_id: Optional[str] = None
    created_at: str


class ChatContext(BaseModel):
    project_id: Optional[str] = None
    location: Optional[str] = None
    role: Optional[str] = None
    budget_kes: Optional[float] = None


class ChatRequest(BaseModel):
    thread_id: str
    message: str
    context: Optional[ChatContext] = None
    response_mode: Literal["text", "structured"] = "structured"
    client_trace_id: Optional[str] = None
    prompt_id: Optional[str] = None


class Citation(BaseModel):
    type: Literal["estimate", "vendor", "technician", "knowledge"]
    id: str
    chunk_id: Optional[str] = None


class Card(BaseModel):
    type: str
    title: str
    subtitle: Optional[str] = None
    data: dict[str, Any] = Field(default_factory=dict)


class NextAction(BaseModel):
    label: str
    action: str
    payload: dict[str, Any] = Field(default_factory=dict)


class AssistantPayload(BaseModel):
    text: str
    confidence: float = 0.0
    citations: list[Citation] = Field(default_factory=list)
    cards: list[Card] = Field(default_factory=list)
    next_actions: list[NextAction] = Field(default_factory=list)


class Usage(BaseModel):
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0


class ChatResponse(BaseModel):
    thread_id: str
    message_id: str
    assistant: AssistantPayload
    usage: Usage = Field(default_factory=Usage)


class MessageOut(BaseModel):
    id: str
    role: str
    text: Optional[str]
    created_at: str
    cards: list[Card] = Field(default_factory=list)


class ThreadMessagesResponse(BaseModel):
    thread_id: str
    messages: list[MessageOut]


class FeedbackRequest(BaseModel):
    thread_id: str
    message_id: str
    rating: int = Field(ge=1, le=5)
    tags: Optional[list[str]] = None
    comment: Optional[str] = None
