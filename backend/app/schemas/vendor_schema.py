# app/schemas/vendor_schema.py
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict
from datetime import datetime

class VendorContact(BaseModel):
    phone: Optional[str] = None
    email: Optional[EmailStr] = None

class VendorCreate(BaseModel):
    name: str
    categories: List[str] = []
    location: Optional[str] = None
    contact: Optional[VendorContact] = None
    short_description: Optional[str] = None

class VendorResponse(BaseModel):
    id: int
    user_id: int
    name: str
    categories: List[str] = []
    location: Optional[str] = None
    contact: Optional[VendorContact] = None
    verified: bool = False
    banner_url: Optional[str] = None
    logo_url: Optional[str] = None
    average_rating: float = 0.0
    availability: Optional[str] = None
    short_description: Optional[str] = None

    class Config:
        from_attributes = True
