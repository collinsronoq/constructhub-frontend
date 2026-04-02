from __future__ import annotations

import math

from app.estimation.geometry.building_geometry_resolver import ResolvedGeometry
from app.estimation.phases.roofing.schemas import RoofingInput, RoofingPhaseGeometry


def derive_roofing_geometry(
    data: RoofingInput,
    shared_geometry: ResolvedGeometry,
) -> RoofingPhaseGeometry:
    # Shared geometry is the base-plan authority for footprint/perimeter/storeys.
    shared_footprint = max(float(shared_geometry.ground_footprint_area_sqm or 0), 0.0)
    # Perimeter/storeys are kept in phase geometry for traceability and future refinements.
    shared_perimeter = max(float(shared_geometry.equivalent_plan_perimeter_m or 0), 0.0)
    shared_storeys = max(1, int(shared_geometry.storeys or 1))

    input_footprint = float(data.building_footprint_sqm) if data.building_footprint_sqm else None
    # Input footprint is kept only as compatibility fallback when shared geometry is missing.
    used_fallback_footprint = shared_footprint <= 0 and (input_footprint is not None and input_footprint > 0)
    if shared_footprint > 0:
        selected_plan_area_sqm = shared_footprint
    elif used_fallback_footprint:
        selected_plan_area_sqm = input_footprint or 1.0
    else:
        selected_plan_area_sqm = 1.0

    is_flat = data.roof_type == "flat"
    if is_flat:
        slope_degrees = 0.0
        slope_factor = 1.0
        overhang_factor = 1.0
        roof_cover_area_sqm = selected_plan_area_sqm
        ridge_length_m = 0.0
    else:
        pitch_map = {"low": 20.0, "medium": 30.0, "steep": 40.0}
        slope_degrees = pitch_map[data.roof_pitch]
        slope_factor = 1.0 / math.cos(math.radians(slope_degrees))
        # 12% plan-area uplift approximates typical eaves/overhang extension.
        overhang_factor = 1.12 if data.include_overhangs else 1.0
        roof_cover_area_sqm = selected_plan_area_sqm * slope_factor * overhang_factor
        ridge_length_m = math.sqrt(selected_plan_area_sqm) if data.roof_type in {"gable", "hip"} else 0.0

    return RoofingPhaseGeometry(
        roof_type=data.roof_type,
        roof_pitch=data.roof_pitch,
        is_flat=is_flat,
        shared_footprint_area_sqm=round(shared_footprint, 2),
        shared_plan_perimeter_m=round(shared_perimeter, 2),
        shared_storeys=shared_storeys,
        selected_plan_area_sqm=round(selected_plan_area_sqm, 2),
        slope_degrees=round(slope_degrees, 2),
        slope_factor=round(slope_factor, 4),
        overhang_factor=round(overhang_factor, 4),
        roof_cover_area_sqm=round(roof_cover_area_sqm, 2),
        ridge_length_m=round(ridge_length_m, 2),
        used_fallback_footprint=used_fallback_footprint,
        input_footprint_sqm=round(input_footprint, 2) if input_footprint is not None else None,
    )
