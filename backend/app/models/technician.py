from sqlalchemy import String, Integer, Float, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class Technician(Base):
    __tablename__ = "technicians"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    skill: Mapped[str] = mapped_column(String(120), nullable=False)  # single skill per your decision
    location: Mapped[str] = mapped_column(String(120), nullable=True)
    rating: Mapped[float] = mapped_column(Float, default=0.0)
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    short_description: Mapped[str] = mapped_column(Text, nullable=True)

    user = relationship("User", back_populates="technician")



# app/models/technician_profile.py


class TechnicianProfile(Base):
    __tablename__ = "technician_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )

    # Identity
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    location: Mapped[str] = mapped_column(String(255), nullable=True)
    contact: Mapped[dict] = mapped_column(JSON, nullable=True)  
    # example:
    # {"phone": "...", "email": "..."}

    # Professional info
    specialization: Mapped[str] = mapped_column(String(120), nullable=True)            # primary specialization
    skills: Mapped[list] = mapped_column(JSON, nullable=True)                # secondary skills
    years_experience: Mapped[int] = mapped_column(Integer, nullable=True)
    bio: Mapped[str] = mapped_column(Text, nullable=True)
    short_description: Mapped[str] = mapped_column(Text, nullable=True)

    # Media
    profile_image_url: Mapped[str] = mapped_column(String(1024), nullable=True)

    # Verification & status
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    availability: Mapped[str] = mapped_column(String(50), nullable=True)
    average_rating: Mapped[float] = mapped_column(Float, default=0.0)

    certifications = relationship("TechnicianCertification", back_populates="technician_profile", cascade="all, delete-orphan"
)

    user = relationship("User", back_populates="technician_profile")
    reviews = relationship("Review", back_populates="technician_profile", cascade="all, delete-orphan")
