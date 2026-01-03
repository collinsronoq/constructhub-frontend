from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.technician import TechnicianProfile
from app.services.technician_profile_service import TechnicianProfileService
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


@router.post("/profile", response_model=TechnicianProfileResponse)
async def create_profile(
    payload: TechnicianProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(role_required("technician"))
):  
    try:
        # check if exists
        q = await db.execute(select(TechnicianProfile).where(TechnicianProfile.user_id == current_user.id))
        existing = q.scalars().first()

        if existing:
            raise HTTPException(status_code=400, detail="Profile already exists")

        profile = TechnicianProfile(
            user_id=current_user.id,
            name=payload.name,
            location=payload.location,
            specialization=payload.specialization,
            skills=payload.skills,
            years_experience=payload.years_experience,
            bio=payload.bio,
            short_description=payload.short_description,
            contact=payload.contact.model_dump() if payload.contact else None,
            profile_image_url=payload.profile_image_url,
            availability="Available"
        )

        db.add(profile)
        await db.commit()
        await db.refresh(profile)

        logger.info(f"Technician profile created for user {current_user.email}")
        return profile
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to create technician profile", extra={"user_id": current_user.id})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error incurred when creating technician profile",
        ) from exc


@router.patch("/profile/edit", response_model=TechnicianProfileResponse)
async def update_profile(
    payload: TechnicianProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(role_required("technician"))
):
    try:
        q = await db.execute(select(TechnicianProfile).where(TechnicianProfile.user_id == current_user.id))
        profile = q.scalars().first()

        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(profile, field, value)

        await db.commit()
        await db.refresh(profile)

        return profile
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to update technician profile", extra={"user_id": current_user.id})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error incurred when trying to update technician profile",
        ) from exc


@router.get("/me", response_model=TechnicianProfileResponse)
async def my_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(role_required("technician"))
):
    try:
        q = await db.execute(select(TechnicianProfile).where(TechnicianProfile.user_id == current_user.id))
        profile = q.scalars().first()

        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        
        return profile
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to load technician profile data", extra={"user_id": current_user.id})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error incurred",
        ) from exc


@router.get("/profile/{user_id}", response_model=TechnicianProfilePublic)
async def get_public_profile(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    try:
        profile = await TechnicianProfileService.get_by_user_id(user_id, db)

        if not profile:
            raise HTTPException(status_code=404, detail="Technician not found")
        logger.info(profile.contact)
        return profile
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to load technician public profile data", extra={"user_id": user_id})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error incurred",
        ) from exc


@router.get("/profile/by-id/{profile_id}", response_model=TechnicianProfilePublic)
async def get_public_profile_by_id(
    profile_id: int,
    db: AsyncSession = Depends(get_db)
):
    try:
        profile = await TechnicianProfileService.get_by_profile_id(profile_id, db)
        if not profile:
            raise HTTPException(status_code=404, detail="Technician not found")
        return profile
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to load technician public profile data", extra={"profile_id": profile_id})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error incurred",
        ) from exc


@router.post("/verify")
async def submit_verification(
    payload: TechnicianVerificationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(role_required("technician"))
):
    try:
        q = await db.execute(select(TechnicianProfile).where(TechnicianProfile.user_id == current_user.id))
        profile = q.scalars().first()

        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        # In your v1 — we simply store as a JSON field, admin will process later
        profile.certifications = payload.certifications  # You must add this field in model if you want it

        await db.commit()

        return {"message": "Verification documents submitted. Await admin approval."}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(
            "Failed to upload technician certifications for verification",
            extra={"user_id": current_user.id},
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error incurred",
        ) from exc
