    
# create enum to represent the diff types of users
# app/models/user.py
from datetime import datetime
from sqlalchemy import String, Integer, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base
from app.schemas.enums import UserRole




class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(String(50), nullable=False, default=UserRole.builder)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    # Optional one-to-one relationships
    vendor_profile = relationship("VendorProfile", back_populates="user", uselist=False)
    technician_profile = relationship("TechnicianProfile", back_populates="user", uselist=False)

    # reviews written by this user
    reviews_written = relationship("Review", back_populates="reviewer", foreign_keys="[Review.reviewer_id]")
    # reviews about this user
    reviews_received = relationship("Review", back_populates="reviewee", foreign_keys="[Review.reviewee_id]")
