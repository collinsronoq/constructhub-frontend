from pydantic import BaseModel, Field
from typing import Literal, Optional


class RoofingInput(BaseModel):
    """
    Normalized roofing input from frontend and upstream phases.
    """

    # From frontend
    roof_type: Literal["gable", "hip", "flat", "mono_pitch"]
    roof_covering: Literal[
        "corrugated_mabati",
        "box_profile_mabati",
        "stone_coated_tiles",
        "clay_tiles",
    ]

    roof_pitch: Literal["low", "medium", "steep"] = "medium"

    # From superstructure phase
    building_footprint_sqm: float = Field(..., gt=0)
    storeys: int = Field(1, ge=1)

    # Optional overrides
    include_overhangs: bool = True

class RoofingQuantities(BaseModel):
    roof_area_sqm: float

    # Pitched roof materials
    roofing_sheets_sqm: float = 0
    timber_cubic_m: float = 0
    nails_kg: float = 0
    ridge_length_m: float = 0

    # Flat roof materials
    concrete_volume_m3: float = 0
    reinforcement_kg: float = 0
    formwork_sqm: float = 0
    waterproofing_sqm: float = 0