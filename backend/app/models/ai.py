# app/ai/models.py
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Boolean, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.sqlite import JSON as SQLiteJSON

from app.models.base import Base  # your declarative base


def _uuid() -> str:
    return str(uuid.uuid4())


class AIThread(Base):
    __tablename__ = "ai_threads"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), index=True)
    project_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)

    title: Mapped[str] = mapped_column(String(200), default="AI Assistant")
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc))
    last_message_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    messages = relationship("AIMessage", back_populates="thread", cascade="all, delete-orphan")


class AIMessage(Base):
    __tablename__ = "ai_messages"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    thread_id: Mapped[str] = mapped_column(String, ForeignKey("ai_threads.id"), index=True)

    role: Mapped[str] = mapped_column(String(20))  # user|assistant|system|tool
    text: Mapped[str | None] = mapped_column(Text, nullable=True)
    structured_json: Mapped[dict | None] = mapped_column(SQLiteJSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc))

    thread = relationship("AIThread", back_populates="messages")
    tool_calls = relationship("AIToolCall", back_populates="message", cascade="all, delete-orphan")


class AIToolCall(Base):
    __tablename__ = "ai_tool_calls"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    message_id: Mapped[str] = mapped_column(String, ForeignKey("ai_messages.id"), index=True)

    tool_name: Mapped[str] = mapped_column(String(100))
    tool_args: Mapped[dict] = mapped_column(SQLiteJSON)
    tool_result: Mapped[dict | None] = mapped_column(SQLiteJSON, nullable=True)

    status: Mapped[str] = mapped_column(String(20), default="ok")  # ok|error
    latency_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc))

    message = relationship("AIMessage", back_populates="tool_calls")


class AIFeedback(Base):
    __tablename__ = "ai_feedback"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), index=True)

    thread_id: Mapped[str] = mapped_column(String, ForeignKey("ai_threads.id"), index=True)
    message_id: Mapped[str] = mapped_column(String, ForeignKey("ai_messages.id"), index=True)

    rating: Mapped[int] = mapped_column(Integer)  # 1-5
    tags: Mapped[list[str] | None] = mapped_column(SQLiteJSON, nullable=True)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc))
