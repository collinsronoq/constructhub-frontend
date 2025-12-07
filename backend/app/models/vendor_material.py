# backend/app/models/vendor_material.py
from sqlalchemy import Integer, ForeignKey, Float, String, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class VendorItem(Base):
    __tablename__ = "vendor_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    vendor_id: Mapped[int] = mapped_column(ForeignKey("vendor_profiles.id", ondelete="CASCADE"))

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(255), index=True)
    sub_category: Mapped[str] = mapped_column(String(255), nullable=True)
    unit: Mapped[str] = mapped_column(String(50), nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    available: Mapped[bool] = mapped_column(Boolean, default=True)
    short_description: Mapped[str] = mapped_column(Text, nullable=True)

    image_url: Mapped[str] = mapped_column(String(1024), nullable=True)

    vendor = relationship("VendorProfile", back_populates="vendor_items")

