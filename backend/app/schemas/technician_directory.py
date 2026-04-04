from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class TechnicianDirectoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    specialization: Optional[str] = None
    skills: Optional[List[str]] = None  # if you still want multi-tags
    location: Optional[str] = None
    verified: bool
    rating: float
    profile_image_url: Optional[str] = None


class TechnicianDirectoryResponse(BaseModel):
    technicians: List[TechnicianDirectoryItem]
