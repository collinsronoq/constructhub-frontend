from pydantic import BaseModel, Field
from typing import Literal


class FoundationInput(BaseModel):
    foundation_type: Literal["strip", "raft"]
    floor_area_sqm: float = Field(..., gt=0)
    soil_type: Literal["soft", "medium", "rocky"] = "medium"
    quality_level: Literal["standard", "premium"] = "standard"

    include_formwork: bool = True
