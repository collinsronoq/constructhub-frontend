from datetime import date
from sqlalchemy import String, Integer, Text, Boolean, Date
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base
from sqlalchemy import JSON

class Article(Base):
    __tablename__ = "articles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(400), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(120), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)  # plain text
    author: Mapped[str] = mapped_column(String(200), nullable=False)
    publish_date: Mapped[date] = mapped_column(Date, default=date.today)
    read_time: Mapped[str] = mapped_column(String(50), nullable=True)
    tags: Mapped[dict] = mapped_column(JSON, nullable=True)  # list stored as JSON
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    views: Mapped[int] = mapped_column(Integer, default=0)
