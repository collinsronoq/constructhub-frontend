# app/estimation/phases/roofing/roofing_geometry.py

import math
from dataclasses import dataclass
from app.estimation.schemas.roofing import RoofingInput


@dataclass
class RoofGeometry:
    footprint_area: float
    roof_area_sqm: float
    ridge_length_m: float | None = None
    is_flat: bool = False


def derive_roof_geometry(data: RoofingInput) -> RoofGeometry:
    """
    Derive physically accurate roof geometry.
    This is the single source of truth for roof surface area.
    """

    footprint = data.building_footprint_sqm

    # --- FLAT ROOF (RC SLAB) ---
    if data.roof_type == "flat":
        return RoofGeometry(
            footprint_area=footprint,
            roof_area_sqm=round(footprint, 2),
            ridge_length_m=None,
            is_flat=True,
        )

    # --- PITCHED ROOFS ---
    pitch_map = {
        "low": 20,
        "medium": 30,
        "steep": 40,
    }
    pitch_deg = pitch_map[data.roof_pitch]

    slope_factor = 1 / math.cos(math.radians(pitch_deg))

    # overhang allowance
    overhang_factor = 1.12 if data.include_overhangs else 1.0

    roof_area = footprint * slope_factor * overhang_factor

    ridge_length = math.sqrt(footprint) if data.roof_type in {"gable", "hip"} else None

    return RoofGeometry(
        footprint_area=footprint,
        roof_area_sqm=round(roof_area, 2),
        ridge_length_m=round(ridge_length, 2) if ridge_length else None,
        is_flat=False,
    )
