# app/routes/vendor_uploads.py

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.auth.dependencies import role_required
from app.models.vendor import VendorProfile
from app.utils.file_upload import save_vendor_banner, save_vendor_logo
from app.schemas.media_schema import ImageUploadResponse


router = APIRouter(prefix="/vendors", tags=["vendor-media"])


@router.post("/{user_id}/upload/banner", response_model=ImageUploadResponse)
async def upload_banner(user_id: int, file: UploadFile = File(...), db: AsyncSession = Depends(get_db), current_user=Depends(role_required("vendor"))):

    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    q = await db.execute(select(VendorProfile).where(VendorProfile.user_id == user_id))
    vendor = q.scalars().first()
    if not vendor:
        raise HTTPException(404, "Vendor profile not found")

    url = await save_vendor_banner(user_id, file)
    vendor.banner_url = url

    await db.commit()
    return ImageUploadResponse(file_url=url)



@router.post("/{user_id}/upload/logo", response_model=ImageUploadResponse)
async def upload_logo(user_id: int, file: UploadFile = File(...), db: AsyncSession = Depends(get_db), current_user=Depends(role_required("vendor"))):

    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    q = await db.execute(select(VendorProfile).where(VendorProfile.user_id == user_id))
    vendor = q.scalars().first()

    if not vendor:
        raise HTTPException(404, "Vendor profile not found")

    url = await save_vendor_logo(user_id, file)
    vendor.logo_url = url

    await db.commit()
    return ImageUploadResponse(file_url=url)
