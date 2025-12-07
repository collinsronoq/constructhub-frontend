from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.technician import TechnicianProfile
from app.models.technician_certification import TechnicianCertification
from app.schemas.technician_certification_schema import (
    TechnicianCertificationCreate,
    TechnicianCertificationResponse,
)
from app.auth.dependencies import role_required, get_current_user
from app.models.user import User
from app.core.logging import setup_logger

router = APIRouter(prefix="/technicians/certifications", tags=["technician-certifications"])
logger = setup_logger("technician.certifications")



# Technician Upload Certification

@router.post("/", response_model=TechnicianCertificationResponse)
async def upload_certification(
    payload: TechnicianCertificationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(role_required("technician"))
):
    # get technician profile
    q = await db.execute(
        select(TechnicianProfile).where(TechnicianProfile.user_id == current_user.id)
    )
    profile = q.scalars().first()

    if not profile:
        raise HTTPException(status_code=404, detail="Technician profile not found")

    cert = TechnicianCertification(
        technician_id=profile.id,
        title=payload.title,
        issuer=payload.issuer,
        file_url=payload.file_url,
    )

    db.add(cert)
    await db.commit()
    await db.refresh(cert)

    logger.info(f"Certification uploaded by {current_user.email}: {payload.title}")
    return cert



# Technician View Their Certifications

@router.get("/", response_model=list[TechnicianCertificationResponse])
async def get_my_certifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(role_required("technician"))
):
    q = await db.execute(
        select(TechnicianCertification)
        .join(TechnicianProfile)
        .where(TechnicianProfile.user_id == current_user.id)
    )
    certifications = q.scalars().all()
    return certifications
