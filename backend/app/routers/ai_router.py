# app/ai/router.py
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.ai.schemas.schemas import (
    ThreadCreateRequest, ThreadResponse,
    ChatRequest, ChatResponse,
    ThreadMessagesResponse, FeedbackRequest
)
from app.models.ai import AIThread, AIMessage, AIFeedback
from app.ai.service.service_ollama import handle_chat
from app.ai.prompts import list_prompts
from app.core.database import get_db  # adapt to your project
from app.auth.dependencies import get_current_user
from app.core.logging import setup_logger

router = APIRouter(prefix="/ai", tags=["AI"])
logger = setup_logger("ai.router")


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
        logger.info(f"chat information: {payload} \n chat response: {assistant_payload}")
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


@router.get("/prompts")
async def prompts(role: str | None = None):
    return list_prompts(role)


@router.get("/threads/{thread_id}/messages", response_model=ThreadMessagesResponse)
async def get_messages(thread_id: str, limit: int = 50, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    # Verify ownership
    q = await db.execute(select(AIThread).where(AIThread.id == thread_id, AIThread.user_id == user.id))
    if not q.scalars().first():
        raise HTTPException(status_code=404, detail="Thread not found")

    q2 = await db.execute(
        select(AIMessage)
        .where(AIMessage.thread_id == thread_id)
        .order_by(AIMessage.created_at.asc())
        .limit(limit)
    )
    msgs = q2.scalars().all()

    # cards are stored in structured_json if you use structured outputs later
    out = []
    for m in msgs:
        out.append({
            "id": m.id,
            "role": m.role,
            "text": m.text,
            "created_at": m.created_at.isoformat(),
            "cards": (m.structured_json or {}).get("cards", []) if m.structured_json else [],
        })

    return {"thread_id": thread_id, "messages": out}


@router.post("/feedback")
async def feedback(payload: FeedbackRequest, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    fb = AIFeedback(
        user_id=user.id,
        thread_id=payload.thread_id,
        message_id=payload.message_id,
        rating=payload.rating,
        tags=payload.tags,
        comment=payload.comment,
        created_at=datetime.now(timezone.utc),
    )
    db.add(fb)
    await db.commit()
    return {"status": "ok"}
