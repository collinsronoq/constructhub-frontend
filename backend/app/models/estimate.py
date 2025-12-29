from datetime import datetime
from sqlalchemy import Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base
from sqlalchemy import JSON


class Estimation(Base):
    __tablename__ = "estimations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # External/public identifier (matches JSON file name/id)
    estimate_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    project_title: Mapped[str] = mapped_column(String(255), nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)

    floor_area: Mapped[float | None] = mapped_column(Float, nullable=True)
    quality: Mapped[str | None] = mapped_column(String(50), nullable=True)
    total_cost: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Optional reference to the JSON blob persisted on disk/object storage
    blob_path: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Optional lightweight JSON for quick inspection (avoid full breakdown)
    summary_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="estimations")
