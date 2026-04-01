from sqlalchemy import String, Integer, Float, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base






class Material(Base):
    __tablename__ = "materials"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(120), nullable=False)
    unit: Mapped[str] = mapped_column(String(60), nullable=True)  # e.g., m, pcs, bag
    unit_cost: Mapped[float] = mapped_column(Float, nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)

    vendor_links = relationship("VendorMaterial", back_populates="material", cascade="all, delete-orphan")
