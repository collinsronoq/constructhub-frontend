from __future__ import annotations

from math import ceil

from app.estimation.geometry.building_geometry_resolver import ResolvedGeometry
from app.estimation.phases.superstructure.schemas import (
    SuperstructureInput,
    SuperstructurePhaseGeometry,
)


def _safe_ceil(value: float) -> int:
    return max(1, ceil(value))

def derive_superstructure_geometry(
    data: SuperstructureInput,
    geometry: ResolvedGeometry,
) -> SuperstructurePhaseGeometry:
    total_floor_area_sqm = max(float(geometry.total_floor_area_sqm or 0), 1.0)
    storeys = max(1, int(geometry.storeys or 1))
    footprint_area_sqm = max(float(geometry.footprint_area_sqm or 0), 1.0)

    wall_height_m = 2.5
    wall_thickness_m = 0.15

    external_perimeter_m = max(float(geometry.equivalent_square_perimeter_m or 0), 1.0)
    external_wall_area = external_perimeter_m * wall_height_m * storeys

    base_room_count = (
        data.bedrooms
        + data.master_bedrooms
        + data.bathrooms
        + data.living_rooms
        + data.dining_rooms
        + data.kitchens
    )
    additional_room_count = sum(item.count for item in (data.additional_rooms or {}).values())
    total_room_count = base_room_count + additional_room_count

    internal_wall_ratio = 0.45
    if total_room_count > 10:
        internal_wall_ratio += 0.08
    if data.room_size_preference == "compact":
        internal_wall_ratio += 0.10
    elif data.room_size_preference == "spacious":
        internal_wall_ratio -= 0.05
    if storeys >= 3:
        internal_wall_ratio += 0.05
    internal_wall_ratio = max(0.30, min(internal_wall_ratio, 0.90))

    internal_wall_area = external_wall_area * internal_wall_ratio
    total_wall_area = external_wall_area + internal_wall_area

    door_count = total_room_count + 2
    window_count = (
        data.bedrooms * 2
        + data.master_bedrooms * 2
        + data.bathrooms * 1
        + data.living_rooms * 3
        + data.dining_rooms * 2
        + data.kitchens * 1
        + additional_room_count * 1
    )

    door_area = door_count * 1.89
    window_area = window_count * 1.44
    openings_area = door_area + window_area

    openings_cap = total_wall_area * 0.35
    openings_capped = False
    if openings_area > openings_cap:
        openings_area = openings_cap
        openings_capped = True

    net_wall_area = max(total_wall_area - openings_area, total_wall_area * 0.45)

    grid_spacing_m = {
        "compact": 4.0,
        "standard": 4.5,
        "spacious": 5.0,
    }.get(data.room_size_preference, 4.5)
    column_count_per_floor = max(4, _safe_ceil(footprint_area_sqm / (grid_spacing_m**2)))
    column_count = column_count_per_floor * storeys

    beam_length_m = external_perimeter_m * storeys * 1.35
    lintel_length_m = (door_count * 1.2) + (window_count * 1.5)

    column_size_m = 0.25 if data.finishing_level == "standard" else 0.30
    beam_width_m = 0.23
    beam_depth_m = 0.40 if storeys > 1 else 0.30
    lintel_width_m = 0.20
    lintel_depth_m = 0.15

    suspended_slab_area = footprint_area_sqm * max(0, storeys - 1)
    roof_slab_area = footprint_area_sqm if data.roof_type == "flat" else 0.0
    slab_area = suspended_slab_area + roof_slab_area
    slab_thickness_m = {
        "standard": 0.125,
        "premium": 0.140,
        "luxury": 0.160,
    }.get(data.finishing_level, 0.125)

    return SuperstructurePhaseGeometry(
        total_floor_area_sqm=total_floor_area_sqm,
        storeys=storeys,
        footprint_area_sqm=footprint_area_sqm,
        wall_height_m=wall_height_m,
        wall_thickness_m=wall_thickness_m,
        external_perimeter_m=external_perimeter_m,
        internal_wall_ratio=internal_wall_ratio,
        base_room_count=base_room_count,
        additional_room_count=additional_room_count,
        total_room_count=total_room_count,
        external_wall_area=external_wall_area,
        internal_wall_area=internal_wall_area,
        total_wall_area=total_wall_area,
        door_count=door_count,
        window_count=window_count,
        door_area=door_area,
        window_area=window_area,
        openings_area=openings_area,
        openings_capped=openings_capped,
        net_wall_area=net_wall_area,
        grid_spacing_m=grid_spacing_m,
        column_count_per_floor=column_count_per_floor,
        column_count=column_count,
        beam_length_m=beam_length_m,
        lintel_length_m=lintel_length_m,
        column_size_m=column_size_m,
        beam_width_m=beam_width_m,
        beam_depth_m=beam_depth_m,
        lintel_width_m=lintel_width_m,
        lintel_depth_m=lintel_depth_m,
        suspended_slab_area=suspended_slab_area,
        roof_slab_area=roof_slab_area,
        slab_area=slab_area,
        slab_thickness_m=slab_thickness_m,
    )
