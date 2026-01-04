# app/models/review.py
from datetime import datetime, timezone
from sqlalchemy import Integer, String, Text, Float, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    reviewer_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewee_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # reviewee can be vendor or technician (we store the user id); convenience relationships below will map back.
    rating: Mapped[float] = mapped_column(Float, nullable=False)
    review: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc).date())

    # optional denormalized fields for frontend convenience (reviewerName, reviewerRole) can be computed at read-time.
    reviewer = relationship("User", foreign_keys=[reviewer_id], back_populates="reviews_written")
    reviewee = relationship("User", foreign_keys=[reviewee_id], back_populates="reviews_received")

    # convenience convenience backrefs (not required but helpful)
    vendor_profile = relationship(
        "VendorProfile",
        primaryjoin="foreign(Review.reviewee_id)==VendorProfile.user_id",
        viewonly=True,
    )
    technician_profile = relationship(
        "TechnicianProfile",
        primaryjoin="foreign(Review.reviewee_id)==TechnicianProfile.user_id",
        viewonly=True,
    )
