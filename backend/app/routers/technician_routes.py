from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.technician import TechnicianProfile
from app.schemas.technician_schema import (
    TechnicianProfileCreate,
    TechnicianProfileUpdate,
    TechnicianProfileResponse,
    TechnicianProfilePublic,
    TechnicianVerificationRequest,
)
from app.auth.dependencies import get_current_user, role_required
from app.models.user import User
from app.core.logging import setup_logger

router = APIRouter(prefix="/technicians", tags=["technicians"])
logger = setup_logger("technician.routes")



# CREATE TECHNICIAN PROFILE

@router.post("/profile", response_model=TechnicianProfileResponse)
async def create_profile(
    payload: TechnicianProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(role_required("technician"))
):
    # check if exists
    q = await db.execute(select(TechnicianProfile).where(TechnicianProfile.user_id == current_user.id))
    existing = q.scalars().first()

    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists")

    profile = TechnicianProfile(
        user_id=current_user.id,
        name=payload.name,
        location=payload.location,
        skill=payload.skill,
        skills=payload.skills,
        years_experience=payload.years_experience,
        bio=payload.bio,
        short_description=payload.short_description,
        contact=payload.contact,
        availability="Available"
    )

    db.add(profile)
    await db.commit()
    await db.refresh(profile)

    logger.info(f"Technician profile created for user {current_user.email}")
    return profile



# UPDATE TECHNICIAN PROFILE

@router.patch("/profile/edit", response_model=TechnicianProfileResponse)
async def update_profile(
    payload: TechnicianProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(role_required("technician"))
):
    q = await db.execute(select(TechnicianProfile).where(TechnicianProfile.user_id == current_user.id))
    profile = q.scalars().first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)

    return profile



# ME - TECHNICIAN PROFILE

@router.get("/me", response_model=TechnicianProfileResponse)
async def my_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(role_required("technician"))
):
    q = await db.execute(select(TechnicianProfile).where(TechnicianProfile.user_id == current_user.id))
    profile = q.scalars().first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return profile



# PUBLIC TECHNICIAN PROFILE

@router.get("/{user_id}", response_model=TechnicianProfilePublic)
async def get_public_profile(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    q = await db.execute(select(TechnicianProfile).where(TechnicianProfile.user_id == user_id))
    profile = q.scalars().first()

    if not profile:
        raise HTTPException(status_code=404, detail="Technician not found")

    return profile



# TECHNICIAN VERIFICATION SUBMISSION

@router.post("/verify")
async def submit_verification(
    payload: TechnicianVerificationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(role_required("technician"))
):
    q = await db.execute(select(TechnicianProfile).where(TechnicianProfile.user_id == current_user.id))
    profile = q.scalars().first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # In your v1 — we simply store as a JSON field, admin will process later
    profile.certifications = payload.certifications  # You must add this field in model if you want it

    await db.commit()

    return {"message": "Verification documents submitted. Await admin approval."}
