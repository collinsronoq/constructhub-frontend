from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.auth.dependencies import role_required, get_current_user
from app.models.user import User
from app.models.technician import TechnicianProfile
from app.core.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.utils.file_upload import save_certification_file, save_image_file
from app.core.logging import setup_logger

router = APIRouter(prefix="/upload", tags=["file-upload"])
logger = setup_logger("file.upload")


@router.post("/certification-file")
async def upload_certification_file(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(role_required("technician"))
):
    # Ensure technician profile exists
    q = await db.execute(
        select(TechnicianProfile).where(TechnicianProfile.user_id == current_user.id)
    )
    profile = q.scalars().first()

    if not profile:
        raise HTTPException(status_code=404, detail="Technician profile not found")

    file_url = await save_certification_file(profile.id, file)

    logger.info(f"Technician {current_user.email} uploaded a file: {file.filename}")

    return {"file_url": file_url, "message": "File uploaded successfully"}


@router.post("/image")
async def upload_image(
    entity_type: str,                # technicians | vendors | materials
    entity_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    valid_types = {"technicians", "vendors", "materials"}

    if entity_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid entity type. Allowed: {valid_types}")

    file_url = await save_image_file(entity_type, entity_id, file)

    logger.info(f"Image uploaded for {entity_type} {entity_id}")

    return {"file_url": file_url, "message": "Image uploaded successfully"}
