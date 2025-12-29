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

@router.get("/{vendor_id}/items", response_model=list[VendorItemResponse])
async def get_vendor_items(vendor_id: int, db: AsyncSession = Depends(get_db)):
    try:
        q = await db.execute(select(VendorItem).where(VendorItem.vendor_id == vendor_id))
        items = q.scalars().all()
        return items
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected error") from exc


@router.post("/{vendor_id}/items", response_model=VendorItemResponse)
async def create_vendor_item(
    vendor_id: int,
    data: VendorItemCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(role_required("vendor"))
):
    try:
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
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected error") from exc

@router.put("/{vendor_id}/items/{item_id}", response_model=VendorItemResponse)
async def update_vendor_item(
    vendor_id: int,
    item_id: int,
    data: VendorItemUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(role_required("vendor"))
):
    try:
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

        for field, value in data.dict(exclude_unset=True).items():
            setattr(item, field, value)

        await db.commit()
        await db.refresh(item)

        return item
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected error") from exc

@router.delete("/{vendor_id}/items/{item_id}", status_code=204)
async def delete_vendor_item(
    vendor_id: int,
    item_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(role_required("vendor"))
):
    try:
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
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected error") from exc

# upload image route - ties image directly to item
@router.post("/{vendor_id}/items/{item_id}/upload-image")
async def upload_item_image(
    vendor_id: int,
    item_id: int,
    file: UploadFile = File(...),
    user: User = Depends(role_required("vendor")),
    db: AsyncSession = Depends(get_db)
):
    try:
        # Ensure item exists and belongs to vendor
        q_item = await db.execute(
            select(VendorItem).where(
                VendorItem.id == item_id,
                VendorItem.vendor_id == vendor_id,
            )
        )
        item = q_item.scalars().first()
        if not item:
            raise HTTPException(404, "Item not found")

        # Auth check against vendor ownership
        q_vendor = await db.execute(select(VendorProfile).where(VendorProfile.id == vendor_id))
        vendor = q_vendor.scalars().first()
        if not vendor:
            raise HTTPException(404, "Vendor not found")
        if user.role != "admin" and vendor.user_id != user.id:
            raise HTTPException(403, "Not authorized")

        file_url = await save_vendor_item_image(vendor_id, item_id, file)

        # Persist the image URL on the item (assuming `image_url` exists)
        if hasattr(item, "image_url"):
            item.image_url = file_url
            await db.commit()
            await db.refresh(item)

        return {"file_url": file_url, "item_id": item_id}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected error") from exc
