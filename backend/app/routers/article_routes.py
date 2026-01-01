from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.logging import setup_logger
from app.auth.dependencies import get_current_admin
from app.schemas.article_schema import ArticleCreate, ArticleUpdate, ArticleOut
from app.services.article_service import (
    list_articles,
    get_article,
    create_article,
    update_article,
    delete_article,
)

router = APIRouter(prefix="/articles", tags=["articles"])
logger = setup_logger("articles.router")


@router.get("/", response_model=list[ArticleOut])
async def fetch_articles(
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    try:
        return await list_articles(db=db, limit=limit, offset=offset)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to fetch articles")
        raise HTTPException(status_code=500, detail="Unable to fetch articles") from exc


@router.get("/featured", response_model=list[ArticleOut])
async def fetch_featured_articles(limit: int = 8, offset: int = 0, db: AsyncSession = Depends(get_db)):
    try:
        return await list_articles(db=db, limit=limit, offset=offset, featured_only=True)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to fetch featured articles")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error {exc} encountered while fetching featured articles",
        )


@router.get("/{article_id}", response_model=ArticleOut)
async def fetch_article(
    article_id: int,
    db: AsyncSession = Depends(get_db),
):
    try:
        return await get_article(db=db, article_id=article_id)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to fetch article", extra={"id": article_id})
        raise HTTPException(status_code=500, detail="Unable to fetch article") from exc


@router.post("/", response_model=ArticleOut, status_code=status.HTTP_201_CREATED)
async def create_article_endpoint(
    payload: ArticleCreate,
    db: AsyncSession = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    try:
        return await create_article(db=db, data=payload)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to create article")
        raise HTTPException(status_code=500, detail="Unable to create article") from exc


@router.put("/{article_id}", response_model=ArticleOut)
async def update_article_endpoint(
    article_id: int,
    payload: ArticleUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    try:
        return await update_article(db=db, article_id=article_id, data=payload)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to update article", extra={"id": article_id})
        raise HTTPException(status_code=500, detail="Unable to update article") from exc


@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_article_endpoint(
    article_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    try:
        await delete_article(db=db, article_id=article_id)
        return {"detail": "deleted"}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to delete article", extra={"id": article_id})
        raise HTTPException(status_code=500, detail="Unable to delete article") from exc
