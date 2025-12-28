from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.logging import setup_logger
from app.models.vendor_item import VendorItem
from app.models.vendor import VendorProfile
from app.schemas.marketplace_schema import MarketplaceItemOut

router = APIRouter(prefix="/marketplace", tags=["marketplace"])
logger = setup_logger("marketplace")


@router.get("/items", response_model=list[MarketplaceItemOut])
async def list_marketplace_items(
    db: AsyncSession = Depends(get_db),
):
    try:
        stmt = (
            select(VendorItem, VendorProfile)
            .join(VendorProfile, VendorProfile.id == VendorItem.vendor_id)
        )
        result = await db.execute(stmt)
        rows = result.all()

        output: list[MarketplaceItemOut] = []
        for item, vendor in rows:
            output.append(
                MarketplaceItemOut(
                    id=item.id,
                    name=item.name,
                    category=item.category,
                    price=item.price,
                    unit=item.unit,
                    description=item.description,
                    available=item.available,
                    imageUrl=item.image_url,
                    vendorId=vendor.id,
                    vendorName=vendor.name,
                    vendorLocation=vendor.location,
                    vendorVerified=vendor.verified,
                )
            )

        return output
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to load marketplace items")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error incurred",
        ) from exc
