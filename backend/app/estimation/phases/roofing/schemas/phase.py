from __future__ import annotations

from dataclasses import dataclass
from typing import Literal, Optional

from pydantic import BaseModel, Field


class RoofingInput(BaseModel):
    """
    Roofing request payload.
    `building_footprint_sqm` and `storeys` are retained for compatibility and fallback only;
    shared resolved geometry is the primary authority during estimation.
    """

    roof_type: Literal["gable", "hip", "flat", "mono_pitch"]
    roof_covering: Literal[
        "corrugated_mabati",
        "box_profile_mabati",
        "stone_coated_tiles",
        "clay_tiles",
    ]
    roof_pitch: Literal["low", "medium", "steep"] = "medium"

    building_footprint_sqm: Optional[float] = Field(None, gt=0)
    # Compatibility-only field. Shared resolved geometry remains the authoritative storey source.
    storeys: int | None = Field(None, ge=1)
    include_overhangs: bool = True


@dataclass(frozen=True)
class RoofingPhaseGeometry:
    roof_type: str
    roof_pitch: str
    is_flat: bool

    shared_footprint_area_sqm: float
    shared_plan_perimeter_m: float
    shared_storeys: int

    selected_plan_area_sqm: float
    slope_degrees: float
    slope_factor: float
    overhang_factor: float
    roof_cover_area_sqm: float
    ridge_length_m: float

    used_fallback_footprint: bool
    input_footprint_sqm: float | None


@dataclass(frozen=True)
class RoofingQuantityModel:
    roof_covering_area_sqm: float
    timber_factor_m3_per_sqm: float
    timber_cubic_m: float
    nails_kg: float
    ridge_length_m: float

    concrete_volume_m3: float
    reinforcement_kg: float
    formwork_sqm: float
    waterproofing_sqm: float


__all__ = [
    "RoofingInput",
    "RoofingPhaseGeometry",
    "RoofingQuantityModel",
]
