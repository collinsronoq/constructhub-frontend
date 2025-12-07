from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict
from datetime import datetime


# CREATE PROFILE

class TechnicianProfileCreate(BaseModel):
    name: str
    location: Optional[str] = None
    skill: Optional[str] = None                # primary specialization
    skills: Optional[List[str]] = None         # secondary skills
    years_experience: Optional[int] = None
    bio: Optional[str] = None
    short_description: Optional[str] = None
    contact: Optional[Dict[str, str]] = None   # {"phone": "...", "email": "..."}


# UPDATE PROFILE

class TechnicianProfileUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    skill: Optional[str] = None
    skills: Optional[List[str]] = None
    years_experience: Optional[int] = None
    bio: Optional[str] = None
    short_description: Optional[str] = None
    availability: Optional[str] = None
    contact: Optional[Dict[str, str]] = None
    profile_image_url: Optional[str] = None


# PUBLIC PROFILE RESPONSE

class TechnicianProfilePublic(BaseModel):
    id: int
    name: str
    skill: Optional[str]
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
    skill: Optional[str]
    skills: Optional[List[str]]
    years_experience: Optional[int]
    bio: Optional[str]
    short_description: Optional[str]
    profile_image_url: Optional[str]
    contact: Optional[Dict[str, str]]
    verified: bool
    availability: Optional[str]
    average_rating: float

    class Config:
        from_attributes = True


# VERIFY TECHNICIAN CERTIFICATIONS

class TechnicianVerificationRequest(BaseModel):
    certifications: List[str] = Field(..., description="List of uploaded certification URLs or IDs")
