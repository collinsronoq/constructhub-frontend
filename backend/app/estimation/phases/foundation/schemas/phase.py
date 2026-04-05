from typing import Literal

from pydantic import BaseModel, Field


class FoundationInput(BaseModel):
    foundation_type: Literal["strip", "raft"]
    # Compatibility-only field. Shared resolved geometry is the authoritative area source.
    floor_area_sqm: float | None = Field(None, gt=0)
    soil_type: Literal["soft", "medium", "rocky"] = "medium"
    quality_level: Literal["standard", "premium"] = "standard"

    include_formwork: bool = True


__all__ = ["FoundationInput"]
