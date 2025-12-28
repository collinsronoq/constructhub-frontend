# app/routes/vendor_directory.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.vendor import VendorProfile
from app.schemas.vendor_directory_schema import VendorDirectoryOut
from app.core.logging import setup_logger

router = APIRouter(prefix="/vendors", tags=["vendor-directory"])
logger = setup_logger("vendor.directory")


@router.get("/directory", response_model=list[VendorDirectoryOut])
async def get_vendor_directory(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(VendorProfile))
        vendors = result.scalars().all()

        output = []

        for v in vendors:
            category = v.categories[0] if v.categories else "Misc"
            contact = v.contact.get("phone") if v.contact else None

            output.append(
                VendorDirectoryOut(
                    id=v.id,
                    name=v.name,
                    category=category,
                    location=v.location,
                    contact=contact,
                    supplierType=v.supplier_type,
                    rating=v.average_rating,
                    imageUrl=v.logo_url,
                    verified=v.verified,
                )
            )

        return output
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to fetch vendor directory")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error incurred",
        ) from exc
