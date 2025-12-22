# app/routes/vendor_profile.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import role_required
from app.core.database import get_db
from app.schemas.vendor_schema import VendorCreate, VendorUpdate, VendorResponse
from app.services.vendor_service import VendorService

router = APIRouter(prefix="/vendors", tags=["vendors"])


@router.post("/profile", response_model=VendorResponse)
async def create_profile(
    payload: VendorCreate,
    current_user = Depends(role_required("vendor")),
    db: AsyncSession = Depends(get_db)
):
    vendor = await VendorService.create_vendor_profile(current_user, payload, db)
    return VendorResponse.model_validate(vendor)


@router.put("/profile", response_model=VendorResponse)
async def update_profile(
    payload: VendorUpdate,
    current_user = Depends(role_required("vendor")),
    db: AsyncSession = Depends(get_db)
):
    vendor = await VendorService.update_vendor_profile(current_user, payload, db)
    return VendorResponse.model_validate(vendor)


@router.get("/profile/{user_id}", response_model=VendorResponse)
async def get_profile(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    vendor = await VendorService.get_vendor_profile(user_id, db)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return VendorResponse.model_validate(vendor)
