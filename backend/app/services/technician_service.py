from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.technician import TechnicianProfile

async def get_technician_directory(db: AsyncSession):
    """
    Return lightweight technician objects for directory cards.
    """
    stmt = select(
        TechnicianProfile.id,
        TechnicianProfile.name,
        TechnicianProfile.specialization,
        TechnicianProfile.skills,
        TechnicianProfile.location,
        TechnicianProfile.verified,
        TechnicianProfile.average_rating,
        TechnicianProfile.profile_image_url   # use as profile_image_url
    ).order_by(TechnicianProfile.name.asc())

    result = await db.execute(stmt)
    rows = result.all()

    technicians = [
        {
            "id": r.id,
            "name": r.name,
            "specialization": r.specialization,
            "skills": r.skills,
            "location": r.location,
            "verified": r.verified,
            "rating": r.average_rating or 0.0,
            "profile_image_url": r.profile_image_url,
        }
        for r in rows
    ]

    return technicians
