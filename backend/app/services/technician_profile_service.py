from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.technician import TechnicianProfile
from fastapi import HTTPException, status


class TechnicianProfileService:
    @staticmethod
    async def get_by_user_id(user_id: int, db: AsyncSession) -> TechnicianProfile | None:
        q = await db.execute(select(TechnicianProfile).where(TechnicianProfile.user_id == user_id))
        return q.scalars().first()

    @staticmethod
    async def get_by_profile_id(profile_id: int, db: AsyncSession) -> TechnicianProfile | None:
        q = await db.execute(select(TechnicianProfile).where(TechnicianProfile.id == profile_id))
        return q.scalars().first()
