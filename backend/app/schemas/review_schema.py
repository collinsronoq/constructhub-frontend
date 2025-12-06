# app/schemas/review_schema.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReviewCreate(BaseModel):
    reviewee_id: int
    rating: float
    review: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    reviewer_id: Optional[int]
    reviewee_id: int
    rating: float
    review: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
