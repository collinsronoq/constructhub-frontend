from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
from datetime import datetime



# CREATE PROFILE

class TechnicianContact(BaseModel):
    phone: Optional[str] = None
    email: Optional[EmailStr] = None


class TechnicianProfileCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str
    location: Optional[str] = None
    specialization: Optional[str] = Field(None, alias="skill")  # accept legacy "skill"
    skills: Optional[List[str]] = None         # secondary skills
    years_experience: Optional[int] = None
    bio: Optional[str] = None
    short_description: Optional[str] = None
    contact: Optional[TechnicianContact] = None   # {"phone": "...", "email": "..."}


# UPDATE PROFILE

class TechnicianProfileUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: Optional[str] = None
    location: Optional[str] = None
    specialization: Optional[str] = Field(None, alias="skill")  # accept legacy "skill"
    skills: Optional[List[str]] = None
    years_experience: Optional[int] = None
    bio: Optional[str] = None
    short_description: Optional[str] = None
    availability: Optional[str] = None
    contact: Optional[TechnicianContact] = None
    profile_image_url: Optional[str] = None


# PUBLIC PROFILE RESPONSE

class TechnicianProfilePublic(BaseModel):
    id: int
    name: str
    specialization: Optional[str]
    skills: Optional[List[str]]
    years_experience: Optional[int]
    location: Optional[str]
    profile_image_url: Optional[str]
    verified: bool
    average_rating: float
    availability: Optional[str]

    class Config:
        from_attributes = True


# FULL TECHNICIAN PROFILE RESPONSE

class TechnicianProfileResponse(BaseModel):
    id: int
    user_id: int
    name: str
    location: Optional[str]
    specialization: Optional[str]
    skills: Optional[List[str]]
    years_experience: Optional[int]
    bio: Optional[str]
    short_description: Optional[str]
    profile_image_url: Optional[str]
    contact: Optional[TechnicianContact] = None
    verified: bool
    availability: Optional[str]
    average_rating: float

    class Config:
        from_attributes = True


# VERIFY TECHNICIAN CERTIFICATIONS

class TechnicianVerificationRequest(BaseModel):
    certifications: List[str] = Field(..., description="List of uploaded certification URLs or IDs")


class TechnicianCertificationUpdate(BaseModel):
    title: Optional[str] = None
    issuer: Optional[str] = None


class TechnicianCertificationResponse(BaseModel):
    id: int
    technician_id: int
    title: Optional[str]
    issuer: Optional[str]
    file_url: str
    verified: bool
    rejected: bool
    admin_comment: Optional[str] = None

    class Config:
        from_attributes = True
