from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, ForeignKey, DateTime, Boolean, Text
from datetime import datetime
from app.core.database import Base


class TechnicianCertification(Base):
    __tablename__ = "technician_certifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    technician_id: Mapped[int] = mapped_column(
        ForeignKey("technician_profiles.id", ondelete="CASCADE"), nullable=False
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    issuer: Mapped[str] = mapped_column(String(255), nullable=True)
    file_url: Mapped[str] = mapped_column(String(1024), nullable=False)

    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    rejected: Mapped[bool] = mapped_column(Boolean, default=False)
    admin_comment: Mapped[str] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    verified_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    technician_profile = relationship("TechnicianProfile", back_populates="certifications")
