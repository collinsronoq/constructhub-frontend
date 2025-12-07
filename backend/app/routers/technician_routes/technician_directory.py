from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.technician_directory import (
    TechnicianDirectoryResponse,
)
from app.services.technician_service import get_technician_directory

router = APIRouter(prefix="/technicians", tags=["Technicians"])


@router.get("/directory", response_model=TechnicianDirectoryResponse)
async def technician_directory(db: AsyncSession = Depends(get_db)):
    technicians = await get_technician_directory(db)
    return {"technicians": technicians}
