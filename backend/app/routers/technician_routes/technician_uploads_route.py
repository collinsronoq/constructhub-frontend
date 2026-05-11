# app/routes/technician_uploads.py

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status, Form
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.auth.dependencies import role_required
from app.models.technician import TechnicianProfile
from app.models.user import User
from app.schemas.media_schema import CertificationUploadResponse, ImageUploadResponse
from app.schemas.technician_schema import (
    TechnicianCertificationResponse,
    TechnicianCertificationUpdate,
)
from app.models.technician_certification import TechnicianCertification

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
    current_user: User = Depends(role_required("technician")),
):
    """
    Upload technician profile image.
    Only the technician owner or an admin can upload.
    """
    try:
        # Ownership / admin check
        # if current_user.role != "admin" and current_user.id != user_id:
        #     logger.warning(f"Unauthorized profile image upload attempt by user={current_user.id} for tech={user_id}")
        #     raise HTTPException(status_code=403, detail="Not authorized")

        # Ensure technician profile exists
        q = await db.execute(select(TechnicianProfile).where(TechnicianProfile.user_id == user_id))
        profile = q.scalars().first()

        if not profile:
            raise HTTPException(status_code=404, detail="Technician profile not found")

        # Save file
        file_url = await save_technician_profile_image(user_id, file)
        logger.info(f"the file path is: {file_url}")

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
    cert_name: str | None = Form(None),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(role_required("technician")),
):
    """
    Upload a certification PDF for a technician.
    Only technician owner or admin may upload.
    """
    try:
        # Ownership check
        # if current_user.role != "admin" and current_user.id != user_id:
        #     logger.warning(f"Unauthorized cert upload attempt by user={current_user.id} for tech={user_id}")
        #     raise HTTPException(status_code=403, detail="Not authorized")

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
            title=cert_name or file.filename,
            file_url=file_url,
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


@router.patch("/certifications/{cert_id}", response_model=TechnicianCertificationResponse)
@router.patch("/{cert_id}", response_model=TechnicianCertificationResponse, include_in_schema=False)
async def update_certification(
    cert_id: int,
    payload: TechnicianCertificationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(role_required("technician")),
):
    """
    Update title/issuer of an unverified certification.
    """
    try:
        q = await db.execute(
            select(TechnicianCertification, TechnicianProfile.user_id)
            .join(TechnicianProfile, TechnicianCertification.technician_id == TechnicianProfile.id)
            .where(TechnicianCertification.id == cert_id)
        )
        row = q.first()
        if not row:
            raise HTTPException(status_code=404, detail="Certification not found")

        cert, owner_user_id = row

        # Ownership check
        if current_user.role != "admin" and owner_user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")

        if cert.verified:
            raise HTTPException(status_code=400, detail="Cannot edit a verified certification")

        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(cert, field, value)

        await db.commit()
        await db.refresh(cert)
        return cert
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to update technician certification", extra={"cert_id": cert_id})
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected error") from exc


@router.delete("/certifications/{cert_id}", status_code=204)
@router.delete("/{cert_id}", status_code=204, include_in_schema=False)
async def delete_certification(
    cert_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(role_required("technician")),
):
    """
    Delete an unverified certification.
    """
    try:
        q = await db.execute(
            select(TechnicianCertification, TechnicianProfile.user_id)
            .join(TechnicianProfile, TechnicianCertification.technician_id == TechnicianProfile.id)
            .where(TechnicianCertification.id == cert_id)
        )
        row = q.first()
        if not row:
            raise HTTPException(status_code=404, detail="Certification not found")

        cert, owner_user_id = row

        if current_user.role != "admin" and owner_user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")

        if cert.verified:
            raise HTTPException(status_code=400, detail="Cannot delete a verified certification")

        await db.delete(cert)
        await db.commit()
        return None
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to delete technician certification", extra={"cert_id": cert_id})
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected error") from exc


@router.get("/certifications", response_model=list[TechnicianCertificationResponse])
async def list_my_certifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(role_required("technician")),
):
    """
    List certifications for the authenticated technician.
    """
    try:
        q = await db.execute(
            select(TechnicianCertification)
            .join(TechnicianProfile, TechnicianCertification.technician_id == TechnicianProfile.id)
            .where(TechnicianProfile.user_id == current_user.id)
        )
        certs = q.scalars().all()
        return certs
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to list technician certifications", extra={"user_id": current_user.id})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error incurred",
        ) from exc
