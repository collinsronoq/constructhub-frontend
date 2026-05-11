from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.technician import TechnicianProfile
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


async def _sync_profile_verification_from_certs(db: AsyncSession, technician_profile_id: int) -> None:
    """
    Authoritative rule:
    Technician profile is verified when at least one certification is approved
    (verified=True and rejected=False). Otherwise, profile is unverified.
    """
    approved = await db.execute(
        select(TechnicianCertification.id)
        .where(TechnicianCertification.technician_id == technician_profile_id)
        .where(TechnicianCertification.verified.is_(True))
        .where(TechnicianCertification.rejected.is_(False))
        .limit(1)
    )
    has_approved_cert = approved.first() is not None

    profile_q = await db.execute(
        select(TechnicianProfile).where(TechnicianProfile.id == technician_profile_id)
    )
    profile = profile_q.scalars().first()
    if profile:
        profile.verified = has_approved_cert



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
        cert.verified_at = None
        cert.admin_comment = payload.admin_comment

    await db.flush()
    await _sync_profile_verification_from_certs(db, cert.technician_id)
    await db.commit()
    await db.refresh(cert)

    logger.info(f"Certification {cert_id} review by admin (approve={payload.approve})")

    return cert
