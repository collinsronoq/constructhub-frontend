# app/ai/router.py
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, literal_column, select
import json

from app.ai.schemas.schemas import (
    ThreadCreateRequest, ThreadResponse,
    ChatRequest, ChatResponse,
    ThreadMessagesResponse, FeedbackRequest
)
from app.models.ai import AIThread, AIMessage, AIFeedback
from app.ai.service.service_ollama import handle_chat, stream_chat_events
from app.ai.prompts import list_prompts
from app.core.database import get_db  # adapt to your project
from app.auth.dependencies import get_current_user
from app.core.logging import setup_logger

router = APIRouter(prefix="/ai", tags=["AI"])
logger = setup_logger("ai.router")


def _serialize_sse_event(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


def _to_user_facing_messages(msgs: list[AIMessage]) -> list[dict]:
    out = []
    for m in msgs:
        if m.role not in {"user", "assistant"}:
            continue
        if m.text is None:
            continue
        out.append({
            "id": m.id,
            "role": m.role,
            "text": m.text,
            "created_at": m.created_at.isoformat(),
            "cards": (m.structured_json or {}).get("cards", []) if m.structured_json else [],
        })
    return out


async def _validate_feedback_target(db: AsyncSession, *, user_id: str, thread_id: str, message_id: str) -> tuple[AIThread, AIMessage]:
    thread_q = await db.execute(select(AIThread).where(AIThread.id == thread_id, AIThread.user_id == user_id))
    thread = thread_q.scalars().first()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")

    msg_q = await db.execute(select(AIMessage).where(AIMessage.id == message_id))
    msg = msg_q.scalars().first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    if msg.thread_id != thread.id:
        raise HTTPException(status_code=400, detail="Message does not belong to the provided thread")

    return thread, msg


@router.post("/threads", response_model=ThreadResponse)
async def create_thread(payload: ThreadCreateRequest, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    thread = AIThread(
        user_id=user.id,
        project_id=payload.project_id,
        title=payload.title or "AI Assistant",
    )
    db.add(thread)
    await db.commit()
    await db.refresh(thread)

    return ThreadResponse(
        thread_id=thread.id,
        title=thread.title,
        project_id=thread.project_id,
        created_at=thread.created_at.isoformat(),
    )


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    user_id = getattr(user, "id", None)
    try:
        message_id, assistant_payload, usage = await handle_chat(db, user_id=user_id, payload=payload)
        logger.info(
            "AI chat completed",
            extra={"thread_id": payload.thread_id, "user_id": user_id, "message_id": message_id},
        )
        await db.commit()
        return ChatResponse(
            thread_id=payload.thread_id,
            message_id=message_id,
            assistant=assistant_payload,
            usage=usage,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        await db.rollback()
        logger.exception(
            "AI chat failed",
            extra={
                "thread_id": payload.thread_id,
                "user_id": user_id,
                "error": str(e),
            },
        )
        raise HTTPException(status_code=500, detail="AI chat failed")


@router.post("/chat/stream")
async def chat_stream(payload: ChatRequest, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    user_id = getattr(user, "id", None)

    # Keep status code semantics consistent with non-stream route.
    thread_q = await db.execute(select(AIThread).where(AIThread.id == payload.thread_id, AIThread.user_id == user_id))
    if not thread_q.scalars().first():
        raise HTTPException(status_code=404, detail="Thread not found")

    async def event_gen():
        try:
            async for event in stream_chat_events(db, user_id=user_id, payload=payload):
                yield _serialize_sse_event(event.get("event", "message"), event.get("data", {}))
            await db.commit()
        except ValueError as e:
            await db.rollback()
            yield _serialize_sse_event("error", {"detail": str(e)})
        except Exception as e:
            await db.rollback()
            logger.exception(
                "AI chat stream failed",
                extra={"thread_id": payload.thread_id, "user_id": user_id, "error": str(e)},
            )
            yield _serialize_sse_event("error", {"detail": "AI chat stream failed"})
        finally:
            yield _serialize_sse_event("end", {})

    return StreamingResponse(
        event_gen(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )


@router.get("/prompts")
async def prompts(role: str | None = None):
    return list_prompts(role)


@router.get("/threads/{thread_id}/messages", response_model=ThreadMessagesResponse)
async def get_messages(thread_id: str, limit: int = 50, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    limit = max(1, min(limit, 200))
    # Verify ownership
    q = await db.execute(select(AIThread).where(AIThread.id == thread_id, AIThread.user_id == user.id))
    if not q.scalars().first():
        raise HTTPException(status_code=404, detail="Thread not found")

    bind_getter = getattr(db, "get_bind", None)
    bind = bind_getter() if callable(bind_getter) else getattr(db, "bind", None)
    dialect_name = getattr(getattr(bind, "dialect", None), "name", "")

    if dialect_name == "sqlite":
        # Existing SQLite rows may share identical created_at values.
        # Use rowid to preserve true insert order for latest-window fetches.
        latest_q = await db.execute(
            select(AIMessage)
            .where(AIMessage.thread_id == thread_id)
            .order_by(desc(literal_column("ai_messages.rowid")))
            .limit(limit)
        )
        latest_msgs = list(reversed(latest_q.scalars().all()))
    else:
        latest_q = await db.execute(
            select(AIMessage)
            .where(AIMessage.thread_id == thread_id)
            .order_by(desc(AIMessage.created_at))
            .limit(limit)
        )
        latest_msgs = list(reversed(latest_q.scalars().all()))

    out = _to_user_facing_messages(latest_msgs)
    return {"thread_id": thread_id, "messages": out}


@router.post("/feedback")
async def feedback(payload: FeedbackRequest, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    thread, msg = await _validate_feedback_target(
        db,
        user_id=user.id,
        thread_id=payload.thread_id,
        message_id=payload.message_id,
    )

    if msg.role != "assistant":
        raise HTTPException(status_code=400, detail="Feedback can only target assistant messages")

    fb = AIFeedback(
        user_id=user.id,
        thread_id=thread.id,
        message_id=msg.id,
        rating=payload.rating,
        tags=payload.tags,
        comment=payload.comment,
        created_at=datetime.now(timezone.utc),
    )
    db.add(fb)
    await db.commit()
    return {"status": "ok"}
