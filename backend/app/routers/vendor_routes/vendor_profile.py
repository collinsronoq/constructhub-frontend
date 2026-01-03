# app/routes/vendor_profile.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import role_required
from app.core.database import get_db
from app.schemas.vendor_schema import VendorCreate, VendorUpdate, VendorResponse
from app.services.vendor_service import VendorService
from app.core.logging import setup_logger
from sqlalchemy import select
from app.models.vendor import VendorProfile

router = APIRouter(prefix="/vendors", tags=["vendors"])
logger = setup_logger("vendor.profile")


@router.post("/profile", response_model=VendorResponse)
async def create_profile(
    payload: VendorCreate,
    current_user=Depends(role_required("vendor")),
    db: AsyncSession = Depends(get_db),
):
    try:
        vendor = await VendorService.create_vendor_profile(current_user, payload, db)
        return VendorResponse.model_validate(vendor)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to create vendor profile", extra={"user_id": current_user.id})
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected error") from exc


@router.put("/profile", response_model=VendorResponse)
async def update_profile(
    payload: VendorUpdate,
    current_user=Depends(role_required("vendor")),
    db: AsyncSession = Depends(get_db),
):
    try:
        vendor = await VendorService.update_vendor_profile(current_user, payload, db)
        return VendorResponse.model_validate(vendor)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to update vendor profile", extra={"user_id": current_user.id})
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected error") from exc


@router.get("/profile/{user_id}", response_model=VendorResponse)
async def get_profile(
    user_id: int,
    db: AsyncSession = Depends(get_db),
):
    try:
        vendor = await VendorService.get_vendor_profile(user_id, db)
        if not vendor:
            raise HTTPException(status_code=404, detail="Vendor not found")
        return VendorResponse.model_validate(vendor)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to load vendor profile", extra={"user_id": user_id})
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected error") from exc


@router.get("/profile/by-id/{vendor_id}", response_model=VendorResponse)
async def get_profile_by_id(
    vendor_id: int,
    db: AsyncSession = Depends(get_db),
):
    try:
        vendor = await VendorService.get_vendor_profile_by_id(vendor_id, db)
        if not vendor:
            raise HTTPException(status_code=404, detail="Vendor not found")
        return VendorResponse.model_validate(vendor)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to load vendor profile", extra={"vendor_id": vendor_id})
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected error") from exc
