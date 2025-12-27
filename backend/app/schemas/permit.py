from typing import Optional
from pydantic import BaseModel


class Permit(BaseModel):
    id: str
    name: str
    cost: Optional[float] = None
    where: Optional[str] = None
    significance: Optional[str] = None
    duration_days: Optional[int] = None
    status: Optional[str] = None
