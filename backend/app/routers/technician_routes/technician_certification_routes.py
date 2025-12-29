# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy import select
# from app.core.database import get_db
# from app.models.technician import TechnicianProfile
# from app.models.technician_certification import TechnicianCertification
# from app.schemas.technician_certification_schema import (
#     TechnicianCertificationCreate,
#     TechnicianCertificationResponse,
# )
# from app.schemas.technician_schema import TechnicianCertificationUpdate
# from app.auth.dependencies import role_required, get_current_user
# from app.models.user import User
# from app.core.logging import setup_logger

# router = APIRouter(prefix="/technicians/certifications", tags=["technician-certifications"])
# logger = setup_logger("technician.certifications")



# # Technician Upload Certification

# @router.post("/", response_model=TechnicianCertificationResponse)
# async def upload_certification(
#     payload: TechnicianCertificationCreate,
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(role_required("technician"))
# ):  
#     try:
#         # get technician profile
#         q = await db.execute(
#             select(TechnicianProfile).where(TechnicianProfile.user_id == current_user.id)
#         )
#         profile = q.scalars().first()

#         if not profile:
#             raise HTTPException(status_code=404, detail="Technician profile not found")

#         cert = TechnicianCertification(
#             technician_id=profile.id,
#             title=payload.title,
#             issuer=payload.issuer,
#             file_url=payload.file_url,
#         )

#         db.add(cert)
#         await db.commit()
#         await db.refresh(cert)

#         logger.info(f"Certification uploaded by {current_user.email}: {payload.title}")
#         return cert

#     except HTTPException:
#         raise

#     except Exception as exc:
#         logger.exception("Failed to upload technician certification")
#         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpeted error incurred") from exc


# # Technician View Their Certifications

# @router.get("/", response_model=list[TechnicianCertificationResponse])
# async def get_my_certifications(
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(role_required("technician"))
# ):
#     try:
#         q = await db.execute(
#             select(TechnicianCertification)
#             .join(TechnicianProfile)
#             .where(TechnicianProfile.user_id == current_user.id)
#         )
#         certifications = q.scalars().all()
#         return certifications

    
#     except HTTPException:
#         raise

#     except Exception as exc:
#         logger.exception("Failed to load technician certifications")
#         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpeted error incurred") from exc


# @router.patch("/{cert_id}", response_model=TechnicianCertificationResponse)
# async def update_certification(
#     cert_id: int,
#     payload: TechnicianCertificationUpdate,
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(role_required("technician")),
# ):
#     """
#     Update title/issuer of an unverified certification.
#     """
#     try:
#         q = await db.execute(select(TechnicianCertification).where(TechnicianCertification.id == cert_id))
#         cert = q.scalars().first()
#         if not cert:
#             raise HTTPException(status_code=404, detail="Certification not found")

#         # Ownership check
#         tech_profile = cert.technician_profile
#         if current_user.role != "admin" and tech_profile.user_id != current_user.id:
#             raise HTTPException(status_code=403, detail="Not authorized")

#         if cert.verified:
#             raise HTTPException(status_code=400, detail="Cannot edit a verified certification")

#         for field, value in payload.model_dump(exclude_unset=True).items():
#             setattr(cert, field, value)

#         await db.commit()
#         await db.refresh(cert)
#         return cert
#     except HTTPException:
#         raise
#     except Exception as exc:
#         logger.exception("Failed to update technician certification", extra={"cert_id": cert_id})
#         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected error") from exc


# @router.delete("/{cert_id}", status_code=204)
# async def delete_certification(
#     cert_id: int,
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(role_required("technician")),
# ):
#     """
#     Delete an unverified certification.
#     """
#     try:
#         q = await db.execute(select(TechnicianCertification).where(TechnicianCertification.id == cert_id))
#         cert = q.scalars().first()
#         if not cert:
#             raise HTTPException(status_code=404, detail="Certification not found")

#         tech_profile = cert.technician_profile
#         if current_user.role != "admin" and tech_profile.user_id != current_user.id:
#             raise HTTPException(status_code=403, detail="Not authorized")

#         if cert.verified:
#             raise HTTPException(status_code=400, detail="Cannot delete a verified certification")

#         await db.delete(cert)
#         await db.commit()
#         return None
#     except HTTPException:
#         raise
#     except Exception as exc:
#         logger.exception("Failed to delete technician certification", extra={"cert_id": cert_id})
#         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected error") from exc
