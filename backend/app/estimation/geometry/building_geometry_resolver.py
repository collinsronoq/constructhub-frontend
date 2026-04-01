from __future__ import annotations

from math import sqrt
from typing import Any

from pydantic import BaseModel, Field

from app.estimation.phases.superstructure.floor_area_resolver import (
    FloorAreaResolution,
    resolve_floor_area_from_rooms,
)
from app.estimation.phases.superstructure.land_feasibility import (
    LandFeasibilityResult,
    resolve_land_feasibility,
)
from app.estimation.schemas.aggregate import EstimationRequest


class ResolvedGeometry(BaseModel):
    plot_area_sqm: float
    land_area_sqm: float
    structure_type: str
    storeys: int
    area_source: str

    declared_floor_area_sqm: float | None = None
    room_program_floor_area_sqm: float | None = None
    fallback_floor_area_sqm: float | None = None
    pre_cap_total_floor_area_sqm: float

    total_floor_area_sqm: float
    footprint_area_sqm: float
    resolved_foundation_area_sqm: float
    upper_floor_area_sqm: float
    equivalent_square_perimeter_m: float

    buildable_max_footprint_sqm: float
    buildable_max_total_floor_area_sqm: float
    circulation_area_sqm: float
    fits_plot_constraints: bool
    caps_applied: list[str] = Field(default_factory=list)

    room_program_summary: dict[str, Any] = Field(default_factory=dict)
    assumptions: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


def _to_positive_float(value: Any) -> float | None:
    try:
        resolved = float(value)
    except (TypeError, ValueError):
        return None
    return resolved if resolved > 0 else None


def _first_positive(candidates: list[tuple[str, Any]]) -> tuple[str | None, float | None]:
    for source, value in candidates:
        resolved = _to_positive_float(value)
        if resolved is not None:
            return source, resolved
    return None, None


def _room_program_quantities(payload: EstimationRequest) -> dict[str, int]:
    data = payload.superstructure
    room_quantities: dict[str, int] = {
        "bedroom": max(0, int(data.bedrooms)),
        "master_bedroom": max(0, int(data.master_bedrooms)),
        "bathroom": max(0, int(data.bathrooms)),
        "kitchen": max(0, int(data.kitchens)),
        "dining": max(0, int(data.dining_rooms)),
        "living_room": max(0, int(data.living_rooms)),
    }

    for room_name, room in (data.additional_rooms or {}).items():
        room_quantities[room_name] = max(0, int(room.count))

    return room_quantities


def _resolve_floor_area_source(
    payload: EstimationRequest,
    floor_resolution: FloorAreaResolution,
) -> tuple[str, float, float | None, float | None, float | None, list[str]]:
    warnings: list[str] = []
    declared_floor_area = _to_positive_float(payload.superstructure.declared_floor_area_sqm)
    room_program_area = _to_positive_float(floor_resolution.total_floor_area_sqm)

    fallback_source, fallback_area = _first_positive(
        [
            ("foundation_floor_area_sqm", payload.foundation.floor_area_sqm),
            ("finishes_floor_area_sqm", payload.finishes.floor_area_sqm),
            ("services_second_fix_floor_area_sqm", payload.services_second_fix.floor_area_sqm),
            ("services_first_fix_floor_area_sqm", payload.services_first_fix.floor_area_sqm),
            (
                "plot_area_ratio_0_40",
                (_to_positive_float(payload.site_survey.plot_size_sqm) or 1.0) * 0.40,
            ),
        ]
    )

    if declared_floor_area is not None:
        return (
            "declared_floor_area_sqm",
            declared_floor_area,
            declared_floor_area,
            room_program_area,
            fallback_area,
            warnings,
        )

    if room_program_area is not None:
        return (
            "room_program_derived",
            room_program_area,
            declared_floor_area,
            room_program_area,
            fallback_area,
            warnings,
        )

    selected_fallback = fallback_area or 1.0
    fallback_label = fallback_source or "fallback_floor_area_sqm"
    warnings.append(
        "Room-program area could not be resolved; geometry floor area fell back to normalized phase input defaults."
    )
    return (
        fallback_label,
        selected_fallback,
        declared_floor_area,
        room_program_area,
        selected_fallback,
        warnings,
    )


def _room_program_summary(
    payload: EstimationRequest,
    floor_resolution: FloorAreaResolution,
    room_quantities: dict[str, int],
) -> dict[str, Any]:
    active_room_counts = {name: count for name, count in room_quantities.items() if count > 0}
    return {
        "size_tier": payload.superstructure.room_size_preference,
        "total_rooms": int(sum(active_room_counts.values())),
        "room_counts": active_room_counts,
        "base_room_area_sqm": round(float(floor_resolution.base_room_area_sqm or 0), 2),
        "derived_circulation_area_sqm": round(float(floor_resolution.circulation_area_sqm or 0), 2),
        "scale_factor": round(float(floor_resolution.scale_factor or 1.0), 2),
        "fits_land_constraints": bool(floor_resolution.fits_land_constraints),
    }


def resolve_building_geometry(payload: EstimationRequest) -> ResolvedGeometry:
    plot_area_sqm = _to_positive_float(payload.site_survey.plot_size_sqm) or 1.0
    land_area_sqm = _to_positive_float(payload.superstructure.land_size_sqm) or plot_area_sqm

    land_result: LandFeasibilityResult = resolve_land_feasibility(
        land_size_sqm=land_area_sqm,
        structure_type=payload.superstructure.structure_type,
    )
    storeys = max(1, int(land_result.floors))

    room_quantities = _room_program_quantities(payload)
    floor_resolution = resolve_floor_area_from_rooms(
        room_quantities=room_quantities,
        max_allowable_floor_area_sqm=max(float(land_result.total_allowable_floor_area_sqm or 0), 1.0),
        size_tier=payload.superstructure.room_size_preference,
    )

    (
        area_source,
        pre_cap_total_floor_area,
        declared_floor_area_sqm,
        room_program_floor_area_sqm,
        fallback_floor_area_sqm,
        area_warnings,
    ) = _resolve_floor_area_source(payload=payload, floor_resolution=floor_resolution)

    buildable_max_footprint_sqm = max(float(land_result.buildable_footprint_sqm or 0), 1.0)
    buildable_max_total_floor_area_sqm = max(float(land_result.total_allowable_floor_area_sqm or 0), 1.0)

    caps_applied: list[str] = []
    warnings: list[str] = list(area_warnings)

    fits_plot_constraints = pre_cap_total_floor_area <= buildable_max_total_floor_area_sqm
    total_floor_area_sqm = pre_cap_total_floor_area
    if total_floor_area_sqm > buildable_max_total_floor_area_sqm:
        total_floor_area_sqm = buildable_max_total_floor_area_sqm
        caps_applied.append("total_floor_area_capped_to_buildable_max")
        warnings.append(
            "Resolved floor area exceeded buildability maximum and was capped to allowable floor area."
        )

    footprint_area_sqm = max(total_floor_area_sqm / storeys, 1.0)
    if footprint_area_sqm > buildable_max_footprint_sqm:
        footprint_area_sqm = buildable_max_footprint_sqm
        caps_applied.append("footprint_area_capped_to_buildable_max")
        total_floor_area_sqm = min(total_floor_area_sqm, footprint_area_sqm * storeys)

    resolved_foundation_area_sqm = footprint_area_sqm
    upper_floor_area_sqm = max(total_floor_area_sqm - footprint_area_sqm, 0.0)
    equivalent_square_perimeter_m = 4 * sqrt(max(footprint_area_sqm, 1.0))

    assumptions = [
        "Area source priority: declared_floor_area_sqm -> room_program_derived -> normalized fallback.",
        "Land feasibility applies 60% site coverage and 15% circulation/setback loss before allowable floor area checks.",
        "Footprint is resolved as total_floor_area_sqm / storeys using structure-type-derived storey count.",
        "Equivalent-square perimeter is used as the shared baseline perimeter for structural takeoff.",
    ]
    if not floor_resolution.fits_land_constraints:
        warnings.append("Room-program area remains above allowable limit after bounded scaling and required capping.")

    room_summary = _room_program_summary(
        payload=payload,
        floor_resolution=floor_resolution,
        room_quantities=room_quantities,
    )

    return ResolvedGeometry(
        plot_area_sqm=round(plot_area_sqm, 2),
        land_area_sqm=round(land_area_sqm, 2),
        structure_type=payload.superstructure.structure_type,
        storeys=storeys,
        area_source=area_source,
        declared_floor_area_sqm=declared_floor_area_sqm,
        room_program_floor_area_sqm=room_program_floor_area_sqm,
        fallback_floor_area_sqm=fallback_floor_area_sqm,
        pre_cap_total_floor_area_sqm=round(pre_cap_total_floor_area, 2),
        total_floor_area_sqm=round(total_floor_area_sqm, 2),
        footprint_area_sqm=round(footprint_area_sqm, 2),
        resolved_foundation_area_sqm=round(resolved_foundation_area_sqm, 2),
        upper_floor_area_sqm=round(upper_floor_area_sqm, 2),
        equivalent_square_perimeter_m=round(equivalent_square_perimeter_m, 2),
        buildable_max_footprint_sqm=round(buildable_max_footprint_sqm, 2),
        buildable_max_total_floor_area_sqm=round(buildable_max_total_floor_area_sqm, 2),
        circulation_area_sqm=round(float(floor_resolution.circulation_area_sqm or 0), 2),
        fits_plot_constraints=fits_plot_constraints,
        caps_applied=caps_applied,
        room_program_summary=room_summary,
        assumptions=assumptions,
        warnings=warnings,
    )
