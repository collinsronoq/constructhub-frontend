from sqlalchemy import Integer, ForeignKey, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class VendorMaterial(Base):
    __tablename__ = "vendor_materials"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    vendor_id: Mapped[int] = mapped_column(ForeignKey("vendor_profiles.id", ondelete="CASCADE"))
    material_id: Mapped[int] = mapped_column(ForeignKey("materials.id", ondelete="CASCADE"))

    price: Mapped[float] = mapped_column(Float, nullable=True)

    vendor = relationship("VendorProfile")
    material = relationship("Material", back_populates="vendor_links")
