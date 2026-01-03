# app/services/vendor_service.py

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.models.vendor import VendorProfile
from app.models.user import User
from app.schemas.vendor_schema import VendorCreate, VendorUpdate


class VendorService:

    @staticmethod
    async def create_vendor_profile(user: User, data: VendorCreate, db: AsyncSession):
        if user.role != "vendor":
            raise HTTPException(status_code=403, detail="Only vendors can create profiles")

        # ensure vendor doesn't already have a profile
        q = await db.execute(select(VendorProfile).where(VendorProfile.user_id == user.id))
        existing = q.scalars().first()
        if existing:
            raise HTTPException(status_code=400, detail="Profile already exists")

        vendor = VendorProfile(
            user_id=user.id,
            name=data.name,
            categories=data.categories,
            location=data.location,
            supplier_type=data.supplier_type,
            contact=data.contact.model_dump() if data.contact else None,
            short_description=data.short_description,
            banner_url=data.banner_url,
            logo_url=data.logo_url,
            availability=data.availability,
        )

        db.add(vendor)
        await db.commit()
        await db.refresh(vendor)
        return vendor

    @staticmethod
    async def update_vendor_profile(user: User, data: VendorUpdate, db: AsyncSession):
        q = await db.execute(select(VendorProfile).where(VendorProfile.user_id == user.id))
        vendor = q.scalars().first()

        if not vendor:
            raise HTTPException(status_code=404, detail="No vendor profile found")

        # update fields
        for field, value in data.dict(exclude_unset=True).items():
            if field == "contact" and value is not None:
                setattr(vendor, field, value.dict())
            else:
                setattr(vendor, field, value)

        await db.commit()
        await db.refresh(vendor)
        return vendor

    @staticmethod
    async def get_vendor_profile(user_id: int, db: AsyncSession):
        q = await db.execute(select(VendorProfile).where(VendorProfile.user_id == user_id))
        vendor = q.scalars().first()
        return vendor

    @staticmethod
    async def get_vendor_profile_by_id(vendor_id: int, db: AsyncSession):
        q = await db.execute(select(VendorProfile).where(VendorProfile.id == vendor_id))
        vendor = q.scalars().first()
        return vendor
