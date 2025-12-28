from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import setup_logger
from app.models.article import Article
from app.schemas.article_schema import ArticleCreate, ArticleUpdate, ArticleOut

logger = setup_logger("services.article")


async def list_articles(db: AsyncSession, limit: int = 50, offset: int = 0) -> List[ArticleOut]:
    stmt = select(Article).order_by(Article.publish_date.desc()).offset(offset).limit(limit)
    result = await db.execute(stmt)
    articles = result.scalars().all()
    return [
        ArticleOut(
            id=a.id,
            title=a.title,
            category=a.category,
            content=a.content,
            author=a.author,
            publish_date=a.publish_date,
            read_time=a.read_time,
            tags=a.tags or [],
            is_featured=a.is_featured,
            thumbnail=getattr(a, "thumbnail", None),
            views=a.views or 0,
        )
        for a in articles
    ]


async def get_article(db: AsyncSession, article_id: int) -> ArticleOut:
    stmt = select(Article).where(Article.id == article_id)
    result = await db.execute(stmt)
    article = result.scalars().first()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    return ArticleOut(
        id=article.id,
        title=article.title,
        category=article.category,
        content=article.content,
        author=article.author,
        publish_date=article.publish_date,
        read_time=article.read_time,
        tags=article.tags or [],
        is_featured=article.is_featured,
        thumbnail=getattr(article, "thumbnail", None),
        views=article.views or 0,
    )


async def create_article(db: AsyncSession, data: ArticleCreate) -> ArticleOut:
    article = Article(
        title=data.title,
        category=data.category,
        content=data.content,
        author=data.author,
        publish_date=data.publish_date,
        read_time=data.read_time,
        tags=data.tags,
        is_featured=data.is_featured,
        views=0,
    )
    # thumbnail may not exist on model; set if present
    if hasattr(article, "thumbnail"):
        setattr(article, "thumbnail", data.thumbnail)

    db.add(article)
    await db.commit()
    await db.refresh(article)
    logger.info("Article created", extra={"id": article.id, "title": article.title})
    return await get_article(db, article.id)


async def update_article(db: AsyncSession, article_id: int, data: ArticleUpdate) -> ArticleOut:
    stmt = select(Article).where(Article.id == article_id)
    result = await db.execute(stmt)
    article = result.scalars().first()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        # model may not have thumbnail column; guard
        if field == "thumbnail" and not hasattr(article, "thumbnail"):
            continue
        setattr(article, field, value)

    await db.commit()
    await db.refresh(article)
    logger.info("Article updated", extra={"id": article.id})
    return await get_article(db, article.id)


async def delete_article(db: AsyncSession, article_id: int) -> None:
    stmt = delete(Article).where(Article.id == article_id)
    result = await db.execute(stmt)
    if result.rowcount == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    await db.commit()
    logger.info("Article deleted", extra={"id": article_id})
