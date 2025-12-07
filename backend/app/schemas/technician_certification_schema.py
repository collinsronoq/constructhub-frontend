from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime



# Technician Upload

class TechnicianCertificationCreate(BaseModel):
    title: str = Field(..., description="Certification name e.g. Solar Technician Certificate")
    issuer: Optional[str] = Field(None, description="Issued by e.g. NITA")
    file_url: str = Field(..., description="URL to uploaded document")



# Certification Response

class TechnicianCertificationResponse(BaseModel):
    id: int
    title: str
    issuer: Optional[str]
    file_url: str
    verified: bool
    rejected: bool
    admin_comment: Optional[str]
    created_at: datetime
    verified_at: Optional[datetime]

    class Config:
        from_attributes = True



# Admin Approval or Rejection

class TechnicianCertificationAdminAction(BaseModel):
    approve: bool = Field(..., description="True = approve, False = reject")
    admin_comment: Optional[str] = Field(None, description="Reason for approval or rejection")
