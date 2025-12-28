from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.logging import setup_logger
from app.core.database import get_db
from app.schemas.technician_directory import (
    TechnicianDirectoryResponse,
)
from app.services.technician_service import get_technician_directory

router = APIRouter(prefix="/technicians", tags=["Technicians"])
logger = setup_logger("technician_directory")


@router.get("/directory", response_model=TechnicianDirectoryResponse)
async def technician_directory(db: AsyncSession = Depends(get_db)):
    try:
        technicians = await get_technician_directory(db)
        return {"technicians": technicians}

    except HTTPException:
        raise

    except Exception as exc:
        logger.exception("Failed to fetch technicians")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error incurred",
        ) from exc
