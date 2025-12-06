from datetime import datetime
from sqlalchemy import Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base
from sqlalchemy import JSON

class Estimation(Base):
    __tablename__ = "estimations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    project_title: Mapped[str] = mapped_column(String(255), nullable=True)
    floor_area: Mapped[float] = mapped_column(Float, nullable=True)
    quality: Mapped[str] = mapped_column(String(50), nullable=True)
    total_cost: Mapped[float] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    breakdown: Mapped[dict] = mapped_column(JSON, nullable=True)  # store full breakdown JSON here

    user = relationship("User", backref="estimations")
