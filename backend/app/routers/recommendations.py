from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.logging import setup_logger
from app.auth.dependencies import get_current_user
from app.services.recommendation_service import (
    get_vendor_recommendations,
    get_technician_recommendations,
    get_recommendations,
)

router = APIRouter(
    prefix="/recommendations",
    tags=["recommendations"],
)

logger = setup_logger("recommendations.router")


@router.get("/vendors", summary="Recommended vendors")
async def vendor_recommendations(
    location: str | None = None,
    category: str | None = None,
    limit: int = 5,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        return await get_vendor_recommendations(
            db=db,
            location=location,
            category=category,
            limit=limit,
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to load vendor recommendations")
        raise HTTPException(status_code=500, detail="Unable to load vendor recommendations") from exc


@router.get("/technicians", summary="Recommended technicians")
async def technician_recommendations(
    location: str | None = None,
    specialization: str | None = None,
    limit: int = 5,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        return await get_technician_recommendations(
            db=db,
            location=location,
            specialization=specialization,
            limit=limit,
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to load technician recommendations")
        raise HTTPException(status_code=500, detail="Unable to load technician recommendations") from exc


@router.get("/", summary="Combined vendor + technician recommendations")
async def combined_recommendations(
    location: str | None = None,
    vendor_category: str | None = None,
    technician_specialization: str | None = None,
    limit: int = 5,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        return await get_recommendations(
            db=db,
            location=location,
            vendor_category=vendor_category,
            technician_specialization=technician_specialization,
            limit=limit,
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to load recommendations")
        raise HTTPException(status_code=500, detail="Unable to load recommendations") from exc
