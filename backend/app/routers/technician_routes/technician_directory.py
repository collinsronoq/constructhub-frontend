from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.logging import setup_logger
from app.core.database import get_db
from app.schemas.technician_directory import TechnicianDirectoryItem
from app.models.technician import TechnicianProfile

router = APIRouter(prefix="/technicians", tags=["Technicians"])
logger = setup_logger("technician_directory")


@router.get("/directory", response_model=list[TechnicianDirectoryItem])
async def technician_directory(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(TechnicianProfile))
        rows = result.scalars().all()

        output: list[TechnicianDirectoryItem] = []
        for t in rows:
            output.append(
                TechnicianDirectoryItem(
                    id=t.id,
                    name=t.name,
                    specialization=t.specialization,
                    skills=t.skills,
                    location=t.location,
                    verified=t.verified,
                    rating=t.average_rating or 0.0,
                    profile_image_url=t.profile_image_url,
                )
            )
        return output

    except HTTPException:
        raise

    except Exception as exc:
        logger.exception("Failed to fetch technicians")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error incurred",
        ) from exc
