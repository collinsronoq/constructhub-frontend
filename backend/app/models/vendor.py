from typing import List
from sqlalchemy import String, Integer, Float, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class Vendor(Base):
    __tablename__ = "vendors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(120), nullable=False)  # e.g., Roofing, Electrical
    location: Mapped[str] = mapped_column(String(120), nullable=True)
    supplier_type: Mapped[str] = mapped_column(String(50), nullable=True)  # Retail/Wholesale/Distributor
    rating: Mapped[float] = mapped_column(Float, default=0.0)
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    short_description: Mapped[str] = mapped_column(Text, nullable=True)

    user = relationship("User", back_populates="vendor")
    materials = relationship("VendorMaterial", back_populates="vendor", cascade="all, delete-orphan")



# app/models/vendor_profile.py
# 


class VendorProfile(Base):
    __tablename__ = "vendor_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    # core fields
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    categories: Mapped[list] = mapped_column(JSON, nullable=True)
    location: Mapped[str] = mapped_column(String(255), nullable=True)

    contact: Mapped[dict] = mapped_column(JSON, nullable=True)  # {phone, email}
    verified: Mapped[bool] = mapped_column(Boolean, default=False)

    banner_url: Mapped[str] = mapped_column(String(1024), nullable=True)
    logo_url: Mapped[str] = mapped_column(String(1024), nullable=True)

    average_rating: Mapped[float] = mapped_column(Float, default=0.0)
    availability: Mapped[str] = mapped_column(String(50), nullable=True)
    short_description: Mapped[str] = mapped_column(Text, nullable=True)

    # relationships
    user = relationship("User", back_populates="vendor_profile")

    reviews = relationship(
        "Review",
        back_populates="vendor_profile",
        cascade="all, delete-orphan"
    )

    vendor_items = relationship(
        "VendorItem",
        back_populates="vendor",
        cascade="all, delete-orphan"
    )


