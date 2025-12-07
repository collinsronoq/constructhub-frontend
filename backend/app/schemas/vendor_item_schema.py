from pydantic import BaseModel
from typing import List, Optional, Dict


class VendorItem(BaseModel):
    name: str
    category: str
    sub_category: Optional[str]
    unit: str
    price: float
    available: bool
    short_description: Optional[str] = None
    image_url: Optional[str] = None


