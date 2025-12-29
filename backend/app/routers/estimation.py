from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.estimation.schemas.aggregate import EstimationRequest
from app.estimation.service import generate_estimation
from app.core.logging import setup_logger
from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.estimation.storage import load_index, load_estimation_blob
from app.models.estimate import Estimation

router = APIRouter(
    prefix="/estimations",
    tags=["estimations"],
)

logger = setup_logger("estimations")

@router.post("/", summary="Generate a full project estimation")
async def create_estimation(
    request: EstimationRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        result = await generate_estimation(request, db, user_id=current_user.id)
        return result
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/", summary="List estimations for current user")
async def list_estimations(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        result = await db.execute(
            select(Estimation).where(Estimation.user_id == current_user.id)
        )
        rows = result.scalars().all()

        if rows:
            return [
                {
                    "id": row.estimate_id,
                    "project_title": row.project_title,
                    "location": row.location,
                    "floor_area": row.floor_area,
                    "quality": row.quality,
                    "total_cost": row.total_cost,
                    "created_at": row.created_at.isoformat() if row.created_at else None,
                    "blob_path": row.blob_path,
                }
                for row in rows
            ]

        # Fallback to file-based index if DB is empty
        index = load_index(current_user.id)
        return index
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Unable to list estimations") from exc


@router.get("/{estimate_id}", summary="Get estimation details")
async def get_estimation(
    estimate_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    data = load_estimation_blob(current_user.id, estimate_id)
    if not data:
        raise HTTPException(status_code=404, detail="Estimation not found")
    return data
