from datetime import date
from typing import List, Optional
from pydantic import BaseModel, Field


class ArticleBase(BaseModel):
    title: str
    category: str
    content: str
    author: str
    publish_date: date = Field(default_factory=date.today)
    read_time: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    is_featured: bool = False
    thumbnail: Optional[str] = None


class ArticleCreate(ArticleBase):
    pass


class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    content: Optional[str] = None
    author: Optional[str] = None
    publish_date: Optional[date] = None
    read_time: Optional[str] = None
    tags: Optional[List[str]] = None
    is_featured: Optional[bool] = None
    thumbnail: Optional[str] = None


class ArticleOut(ArticleBase):
    id: int
    views: int = 0

    class Config:
        from_attributes = True
