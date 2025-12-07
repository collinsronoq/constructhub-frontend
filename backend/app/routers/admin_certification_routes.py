from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.technician_certification import TechnicianCertification
from app.schemas.technician_certification_schema import (
    TechnicianCertificationAdminAction,
    TechnicianCertificationResponse,
)
from app.auth.dependencies import role_required
from app.core.logging import setup_logger
from datetime import datetime

router = APIRouter(prefix="/admin/certifications", tags=["admin-certifications"])
logger = setup_logger("admin.certifications")



# List PENDING certifications

@router.get("/pending", response_model=list[TechnicianCertificationResponse])
async def list_pending_certifications(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(role_required("admin"))
):
    q = await db.execute(
        select(TechnicianCertification)
        .where(TechnicianCertification.verified == False)
        .where(TechnicianCertification.rejected == False)
    )
    return q.scalars().all()



# Approve / Reject

@router.post("/{cert_id}", response_model=TechnicianCertificationResponse)
async def admin_review_certification(
    cert_id: int,
    payload: TechnicianCertificationAdminAction,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(role_required("admin"))
):
    q = await db.execute(
        select(TechnicianCertification).where(TechnicianCertification.id == cert_id)
    )
    cert = q.scalars().first()

    if not cert:
        raise HTTPException(status_code=404, detail="Certification not found")

    if payload.approve:
        cert.verified = True
        cert.rejected = False
        cert.verified_at = datetime.now()
        cert.admin_comment = payload.admin_comment
    else:
        cert.verified = False
        cert.rejected = True
        cert.admin_comment = payload.admin_comment

    await db.commit()
    await db.refresh(cert)

    logger.info(f"Certification {cert_id} review by admin (approve={payload.approve})")

    return cert
