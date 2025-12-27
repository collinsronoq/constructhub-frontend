from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import setup_logger
from app.models.vendor import VendorProfile
from app.models.technician import TechnicianProfile

logger = setup_logger("services.recommendation")


async def get_vendor_recommendations(
    db: AsyncSession,
    location: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 5,
) -> List[dict]:
    """
    Fetch vendors filtered by location/category, ordered by rating.
    """
    try:
        stmt = select(VendorProfile)
        if location:
            stmt = stmt.where(VendorProfile.location.ilike(f"%{location}%"))
        if category:
            stmt = stmt.where(VendorProfile.categories.contains([category]))

        stmt = stmt.order_by(VendorProfile.average_rating.desc()).limit(limit)
        result = await db.execute(stmt)
        vendors = result.scalars().all()

        output: List[dict] = []
        for v in vendors:
            cat = v.categories[0] if v.categories else "General"
            contact = v.contact.get("phone") if v.contact else None
            output.append(
                {
                    "id": str(v.id),
                    "name": v.name,
                    "category": cat,
                    "location": v.location,
                    "supplierType": v.supplier_type,
                    "rating": v.average_rating or 0.0,
                    "verified": v.verified,
                    "imageUrl": v.logo_url,
                    "contact": contact,
                }
            )

        return output

    except Exception as exc:
        logger.exception("Failed to fetch vendor recommendations")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch vendor recommendations",
        ) from exc


async def get_technician_recommendations(
    db: AsyncSession,
    location: Optional[str] = None,
    specialization: Optional[str] = None,
    limit: int = 5,
) -> List[dict]:
    """
    Fetch technicians filtered by location/specialization, ordered by rating.
    """
    try:
        stmt = select(TechnicianProfile)
        if location:
            stmt = stmt.where(TechnicianProfile.location.ilike(f"%{location}%"))
        if specialization:
            stmt = stmt.where(TechnicianProfile.specialization.ilike(f"%{specialization}%"))

        stmt = stmt.order_by(TechnicianProfile.average_rating.desc()).limit(limit)
        result = await db.execute(stmt)
        technicians = result.scalars().all()

        output: List[dict] = []
        for t in technicians:
            contact = t.contact.get("phone") if t.contact else None
            output.append(
                {
                    "id": str(t.id),
                    "name": t.name,
                    "specialization": t.specialization,
                    "location": t.location,
                    "rating": t.average_rating or 0.0,
                    "verified": t.verified,
                    "imageUrl": t.profile_image_url,
                    "contact": contact,
                }
            )

        return output

    except Exception as exc:
        logger.exception("Failed to fetch technician recommendations")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch technician recommendations",
        ) from exc


async def get_recommendations(
    db: AsyncSession,
    location: Optional[str] = None,
    vendor_category: Optional[str] = None,
    technician_specialization: Optional[str] = None,
    limit: int = 5,
) -> dict:
    """
    Fetch both vendor and technician recommendations.
    """
    vendors = await get_vendor_recommendations(
        db=db,
        location=location,
        category=vendor_category,
        limit=limit,
    )
    technicians = await get_technician_recommendations(
        db=db,
        location=location,
        specialization=technician_specialization,
        limit=limit,
    )

    return {
        "vendors": vendors,
        "technicians": technicians,
    }
