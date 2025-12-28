# app/routes/technician_uploads.py

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.models.technician import TechnicianProfile
from app.models.user import User
from app.schemas.media_schema import ImageUploadResponse
from app.schemas.media_schema import CertificationUploadResponse

from app.utils.file_upload import (
    save_technician_profile_image,
    save_certification_file,
)

from app.core.logging import setup_logger

router = APIRouter(prefix="/technicians", tags=["tech-media"])
logger = setup_logger("technician.uploads")


@router.post("/{user_id}/upload/profile-image", response_model=ImageUploadResponse)
async def upload_profile_image(
    user_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload technician profile image.
    Only the technician owner or an admin can upload.
    """
    try:
        # Ownership / admin check
        if current_user.role != "admin" and current_user.id != user_id:
            logger.warning(f"Unauthorized profile image upload attempt by user={current_user.id} for tech={user_id}")
            raise HTTPException(status_code=403, detail="Not authorized")

        # Ensure technician profile exists
        q = await db.execute(select(TechnicianProfile).where(TechnicianProfile.user_id == user_id))
        profile = q.scalars().first()

        if not profile:
            raise HTTPException(status_code=404, detail="Technician profile not found")

        # Save file
        file_url = await save_technician_profile_image(user_id, file)

        # Update DB
        profile.profile_image_url = file_url
        await db.commit()
        await db.refresh(profile)

        logger.info(f"Updated profile image for technician user_id={user_id}")

        return ImageUploadResponse(file_url=file_url)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to upload technician profile image", extra={"user_id": user_id})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error incurred",
        ) from exc

@router.post("/{user_id}/certifications/upload", response_model=CertificationUploadResponse)
async def upload_certification(
    user_id: int,
    cert_name:str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a certification PDF for a technician.
    Only technician owner or admin may upload.
    """
    try:
        # Ownership check
        if current_user.role != "admin" and current_user.id != user_id:
            logger.warning(f"Unauthorized cert upload attempt by user={current_user.id} for tech={user_id}")
            raise HTTPException(status_code=403, detail="Not authorized")

        # Ensure technician profile exists
        q = await db.execute(select(TechnicianProfile).where(TechnicianProfile.user_id == user_id))
        profile = q.scalars().first()

        if not profile:
            raise HTTPException(status_code=404, detail="Technician profile not found")

        # Save the file
        file_url = await save_certification_file(user_id, file)

        # Create certification entry in DB
        from app.models.technician_certification import TechnicianCertification

        cert = TechnicianCertification(
            technician_id=profile.id,
            title=cert_name,
            file_url=file_url,
            name=file.filename
        )

        db.add(cert)
        await db.commit()
        await db.refresh(cert)

        logger.info(f"Certification uploaded for technician user_id={user_id} -> {file_url}")

        return CertificationUploadResponse(
            file_url=file_url,
            certification_id=cert.id,
            message="Certification uploaded successfully",
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to upload technician certification", extra={"user_id": user_id})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error incurred",
        ) from exc
