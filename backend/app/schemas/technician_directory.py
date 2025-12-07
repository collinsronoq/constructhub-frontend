from pydantic import BaseModel
from typing import List, Optional

class TechnicianDirectoryItem(BaseModel):
    id: int
    name: str
    specialization: Optional[str] = None
    skills: Optional[List[str]] = None  # if you still want multi-tags
    location: Optional[str] = None
    verified: bool
    rating: float
    profile_image_url: Optional[str] = None

    class Config:
        orm_mode = True


class TechnicianDirectoryResponse(BaseModel):
    technicians: List[TechnicianDirectoryItem]
