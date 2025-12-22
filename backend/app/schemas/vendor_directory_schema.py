# app/schemas/vendor_directory_schema.py

from pydantic import BaseModel
from typing import Optional

class VendorDirectoryOut(BaseModel):
    id: int
    name: str
    category: str       # single category used for filtering
    location: Optional[str]
    contact: Optional[str]
    supplierType: Optional[str]
    rating: float
    imageUrl: Optional[str]
    verified: bool

    class Config:
        from_attributes = True
