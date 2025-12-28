from typing import Optional, List
from pydantic import BaseModel


class MarketplaceItemOut(BaseModel):
    id: int
    name: str
    category: str
    price: float
    unit: str
    description: Optional[str] = None
    available: bool
    imageUrl: Optional[str] = None
    vendorId: int
    vendorName: str
    vendorLocation: Optional[str] = None
    vendorVerified: bool

    class Config:
        from_attributes = True
