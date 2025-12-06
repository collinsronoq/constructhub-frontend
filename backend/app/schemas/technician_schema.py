# app/schemas/technician_schema.py
from pydantic import BaseModel
from typing import List, Optional

class TechnicianCreate(BaseModel):
    name: str
    skill: str
    categories: List[str] = []
    location: Optional[str] = None
    contact: Optional[dict] = None
    years_experience: Optional[int] = None
    short_description: Optional[str] = None

class TechnicianResponse(BaseModel):
    id: int
    user_id: int
    name: str
    skill: str
    categories: List[str] = []
    location: Optional[str] = None
    contact: Optional[dict] = None
    verified: bool = False
    banner_url: Optional[str] = None
    logo_url: Optional[str] = None
    average_rating: float = 0.0
    availability: Optional[str] = None
    years_experience: Optional[int] = None
    short_description: Optional[str] = None

    class Config:
        from_attributes = True
