# backend/app/models/vendor_material.py
from sqlalchemy import Integer, ForeignKey, Float, String, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base



class VendorItem(Base):
    __tablename__ = "vendor_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    vendor_id: Mapped[int] = mapped_column(ForeignKey("vendor_profiles.id", ondelete="CASCADE"))
    
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(255), nullable=False)
    subcategory: Mapped[str] = mapped_column(String(255), nullable=True)
    
    unit: Mapped[str] = mapped_column(String(50), nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)

    description: Mapped[str] = mapped_column(Text, nullable=True)
    available: Mapped[bool] = mapped_column(Boolean, default=True)

    image_url: Mapped[str] = mapped_column(String(1024), nullable=True)

    # relationship
    vendor = relationship("VendorProfile", back_populates="items")
