from pydantic import BaseModel
from typing import Optional

class VendorItemBase(BaseModel):
    name: str
    category: str
    subcategory: Optional[str] = None
    unit: str
    price: float
    description: Optional[str] = None
    available: bool = True
    image_url: Optional[str] = None


class VendorItemCreate(VendorItemBase):
    pass


class VendorItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    unit: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    available: Optional[bool] = None
    image_url: Optional[str] = None


class VendorItemResponse(VendorItemBase):
    id: int
    vendor_id: int

    class Config:
        from_attributes = True
