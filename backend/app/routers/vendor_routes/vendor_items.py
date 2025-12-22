from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.auth.dependencies import get_current_user, role_required
from app.models.vendor_item import VendorItem
from app.models.vendor import VendorProfile
from app.models.user import User

from app.schemas.vendor_item_schema import (
    VendorItemCreate,
    VendorItemUpdate,
    VendorItemResponse
)

from app.utils.file_upload import save_vendor_item_image

router = APIRouter(prefix="/vendors", tags=["Vendor Items"])



# Get All Items for a Vendor

@router.get("/{vendor_id}/items", response_model=list[VendorItemResponse])
async def get_vendor_items(vendor_id: int, db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(VendorItem).where(VendorItem.vendor_id == vendor_id))
    items = q.scalars().all()
    return items



# Add Item

@router.post("/{vendor_id}/items", response_model=VendorItemResponse)
async def create_vendor_item(
    vendor_id: int,
    data: VendorItemCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(role_required("vendor"))
):
    # Only vendor owner or admin
    q = await db.execute(select(VendorProfile).where(VendorProfile.id == vendor_id))
    vendor = q.scalars().first()

    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    if user.role != "admin" and vendor.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    new_item = VendorItem(vendor_id=vendor_id, **data.dict())

    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)

    return new_item



# Update Item

@router.put("/{vendor_id}/items/{item_id}", response_model=VendorItemResponse)
async def update_vendor_item(
    vendor_id: int,
    item_id: int,
    data: VendorItemUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(role_required("vendor"))
):
    q = await db.execute(
        select(VendorItem).where(
            VendorItem.id == item_id,
            VendorItem.vendor_id == vendor_id
        )
    )
    item = q.scalars().first()

    if not item:
        raise HTTPException(404, "Item not found")

    # Authorization
    q2 = await db.execute(select(VendorProfile).where(VendorProfile.id == vendor_id))
    vendor = q2.scalars().first()

    if user.role != "admin" and vendor.user_id != user.id:
        raise HTTPException(403, "Not authorized")

    # Apply updates
    for field, value in data.dict(exclude_unset=True).items():
        setattr(item, field, value)

    await db.commit()
    await db.refresh(item)

    return item



# Delete Item

@router.delete("/{vendor_id}/items/{item_id}", status_code=204)
async def delete_vendor_item(
    vendor_id: int,
    item_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(role_required("vendor"))
):
    q = await db.execute(
        select(VendorItem).where(
            VendorItem.id == item_id,
            VendorItem.vendor_id == vendor_id
        )
    )
    item = q.scalars().first()

    if not item:
        raise HTTPException(404, "Item not found")

    q2 = await db.execute(select(VendorProfile).where(VendorProfile.id == vendor_id))
    vendor = q2.scalars().first()

    if user.role != "admin" and vendor.user_id != user.id:
        raise HTTPException(403, "Not authorized")

    await db.delete(item)
    await db.commit()

    return None

# upload image route
@router.post("/{vendor_id}/items/upload-image")
async def upload_item_image(
    vendor_id: int,
    file: UploadFile = File(...),
    user: User = Depends(role_required("vendor")),
    db: AsyncSession = Depends(get_db)
):
    q = await db.execute(select(VendorProfile).where(VendorProfile.id == vendor_id))
    vendor = q.scalars().first()

    if user.role != "admin" and vendor.user_id != user.id:
        raise HTTPException(403, "Not authorized")

    file_url = await save_vendor_item_image(vendor_id, file)
    return {"file_url": file_url}
