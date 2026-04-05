from __future__ import annotations

from dataclasses import dataclass
from math import sqrt
from typing import Dict, List

from app.estimation.base_materials.loader import load_base_rooms


DEFAULT_ROOM_SIZES = {
    "bedroom": 12.0,
    "master_bedroom": 18.0,
    "bathroom": 4.0,
    "kitchen": 10.0,
    "dining": 10.0,
    "living_room": 18.0,
    "store": 4.0,
    "pantry": 3.0,
    "laundry": 4.0,
    "study": 8.0,
}

DEFAULT_SIZE_TIERS = {
    "compact": 0.9,
    "standard": 1.0,
    "spacious": 1.15,
}

DEFAULT_CIRCULATION_RATIO = 0.12
DEFAULT_WALL_THICKNESS_M = 0.15
DEFAULT_INTERNAL_PARTITION_FACTOR = 0.9


def _load_room_catalog() -> tuple[Dict[str, float], Dict[str, float], float, float, float]:
    base = load_base_rooms() or {}
    rooms = base.get("rooms", {}) if isinstance(base, dict) else {}
    tiers = base.get("room_size_tiers", {}) if isinstance(base, dict) else {}
    planning = base.get("planning_assumptions", {}) if isinstance(base, dict) else {}

    room_sizes: Dict[str, float] = {}
    for key, value in rooms.items():
        if not isinstance(value, dict):
            continue
        size = value.get("average_size_sqm") or value.get("min_size_sqm")
        if isinstance(size, (int, float)) and size > 0:
            room_sizes[key] = float(size)

    merged_sizes = DEFAULT_ROOM_SIZES.copy()
    merged_sizes.update(room_sizes)

    merged_tiers = DEFAULT_SIZE_TIERS.copy()
    if isinstance(tiers, dict):
        for key, value in tiers.items():
            if isinstance(value, (int, float)) and value > 0:
                merged_tiers[key] = float(value)

    circulation_ratio = planning.get("circulation_factor", DEFAULT_CIRCULATION_RATIO)
    if not isinstance(circulation_ratio, (int, float)) or circulation_ratio <= 0:
        circulation_ratio = DEFAULT_CIRCULATION_RATIO

    wall_thickness_m = planning.get("wall_thickness_m", DEFAULT_WALL_THICKNESS_M)
    if not isinstance(wall_thickness_m, (int, float)) or wall_thickness_m <= 0:
        wall_thickness_m = DEFAULT_WALL_THICKNESS_M

    internal_partition_factor = planning.get(
        "internal_partition_factor",
        DEFAULT_INTERNAL_PARTITION_FACTOR,
    )
    if (
        not isinstance(internal_partition_factor, (int, float))
        or internal_partition_factor <= 0
    ):
        internal_partition_factor = DEFAULT_INTERNAL_PARTITION_FACTOR

    return (
        merged_sizes,
        merged_tiers,
        float(circulation_ratio),
        float(wall_thickness_m),
        float(internal_partition_factor),
    )


@dataclass(frozen=True)
class ResolvedRoom:
    name: str
    quantity: int
    base_size_sqm: float
    adjusted_size_sqm: float
    total_area_sqm: float


@dataclass(frozen=True)
class FloorAreaResolution:
    rooms: List[ResolvedRoom]
    base_room_area_sqm: float
    circulation_area_sqm: float
    external_wall_area_sqm: float
    internal_partition_area_sqm: float
    total_wall_area_sqm: float
    equivalent_external_perimeter_m: float
    internal_partition_length_m: float
    wall_thickness_m: float
    internal_partition_factor: float
    total_floor_area_sqm: float
    scale_factor: float
    fits_land_constraints: bool


def resolve_floor_area_from_rooms(
    room_quantities: Dict[str, int],
    max_allowable_floor_area_sqm: float,
    circulation_ratio: float | None = None,
    size_tier: str = "standard",
    min_scale: float = 0.85,
    max_scale: float = 1.15,
) -> FloorAreaResolution:
    resolved_rooms: List[ResolvedRoom] = []
    base_area = 0.0

    (
        room_sizes,
        size_tiers,
        default_circulation,
        wall_thickness_m,
        internal_partition_factor,
    ) = _load_room_catalog()
    size_multiplier = size_tiers.get(size_tier, size_tiers["standard"])
    circulation_ratio = default_circulation if circulation_ratio is None else circulation_ratio
    max_allowable_floor_area_sqm = max(float(max_allowable_floor_area_sqm or 0), 1.0)

    for room, qty in room_quantities.items():
        if room not in room_sizes or qty <= 0:
            continue
        room_size = room_sizes[room] * size_multiplier
        room_total = room_size * qty
        base_area += room_total
        resolved_rooms.append(
            ResolvedRoom(
                name=room,
                quantity=int(qty),
                base_size_sqm=round(room_size, 2),
                adjusted_size_sqm=round(room_size, 2),
                total_area_sqm=round(room_total, 2),
            )
        )

    if base_area <= 0:
        return FloorAreaResolution(
            rooms=[],
            base_room_area_sqm=0.0,
            circulation_area_sqm=0.0,
            external_wall_area_sqm=0.0,
            internal_partition_area_sqm=0.0,
            total_wall_area_sqm=0.0,
            equivalent_external_perimeter_m=0.0,
            internal_partition_length_m=0.0,
            wall_thickness_m=wall_thickness_m,
            internal_partition_factor=internal_partition_factor,
            total_floor_area_sqm=0.0,
            scale_factor=1.0,
            fits_land_constraints=True,
        )

    circulation_area = base_area * circulation_ratio
    gross_area = base_area + circulation_area
    raw_scale = max_allowable_floor_area_sqm / max(gross_area, 1.0)
    scale_factor = max(min(raw_scale, max_scale), min_scale)

    def _compute_scaled_totals(scale: float) -> dict[str, float]:
        adjusted_total_local = 0.0
        room_perimeter_sum = 0.0
        for room in resolved_rooms:
            adjusted_size = room.base_size_sqm * scale
            adjusted_total_local += adjusted_size * room.quantity
            room_perimeter_sum += 4.0 * sqrt(max(adjusted_size, 0.0001)) * room.quantity

        equivalent_external_perimeter = 4.0 * sqrt(max(adjusted_total_local, 1.0))
        raw_internal_partition_length = max(
            (room_perimeter_sum - equivalent_external_perimeter) / 2.0,
            0.0,
        )
        internal_partition_length = raw_internal_partition_length * internal_partition_factor
        external_wall_area = equivalent_external_perimeter * wall_thickness_m
        internal_partition_area = internal_partition_length * wall_thickness_m
        total_wall_area = external_wall_area + internal_partition_area
        circulation_local = adjusted_total_local * circulation_ratio
        total_floor_local = adjusted_total_local + circulation_local + total_wall_area

        return {
            "adjusted_total": adjusted_total_local,
            "circulation_area": circulation_local,
            "external_wall_area": external_wall_area,
            "internal_partition_area": internal_partition_area,
            "total_wall_area": total_wall_area,
            "equivalent_external_perimeter": equivalent_external_perimeter,
            "internal_partition_length": internal_partition_length,
            "total_floor": total_floor_local,
        }

    metrics = _compute_scaled_totals(scale_factor)
    for _ in range(6):
        if metrics["total_floor"] <= max_allowable_floor_area_sqm or scale_factor <= min_scale:
            break
        correction = max_allowable_floor_area_sqm / max(metrics["total_floor"], 1.0)
        scale_factor = max(min_scale, scale_factor * correction)
        metrics = _compute_scaled_totals(scale_factor)

    adjusted_total = metrics["adjusted_total"]
    adjusted_rooms: List[ResolvedRoom] = []
    for room in resolved_rooms:
        adjusted_size = round(room.base_size_sqm * scale_factor, 2)
        room_total = round(adjusted_size * room.quantity, 2)
        adjusted_rooms.append(
            ResolvedRoom(
                name=room.name,
                quantity=room.quantity,
                base_size_sqm=room.base_size_sqm,
                adjusted_size_sqm=adjusted_size,
                total_area_sqm=room_total,
            )
        )

    circulation_area = round(metrics["circulation_area"], 2)
    external_wall_area = round(metrics["external_wall_area"], 2)
    internal_partition_area = round(metrics["internal_partition_area"], 2)
    total_wall_area = round(metrics["total_wall_area"], 2)
    equivalent_external_perimeter = round(metrics["equivalent_external_perimeter"], 2)
    internal_partition_length = round(metrics["internal_partition_length"], 2)
    final_total = round(metrics["total_floor"], 2)
    fits = final_total <= max_allowable_floor_area_sqm

    return FloorAreaResolution(
        rooms=adjusted_rooms,
        base_room_area_sqm=round(base_area, 2),
        circulation_area_sqm=circulation_area,
        external_wall_area_sqm=external_wall_area,
        internal_partition_area_sqm=internal_partition_area,
        total_wall_area_sqm=total_wall_area,
        equivalent_external_perimeter_m=equivalent_external_perimeter,
        internal_partition_length_m=internal_partition_length,
        wall_thickness_m=round(wall_thickness_m, 3),
        internal_partition_factor=round(internal_partition_factor, 3),
        total_floor_area_sqm=final_total,
        scale_factor=round(scale_factor, 2),
        fits_land_constraints=fits,
    )


__all__ = [
    "FloorAreaResolution",
    "ResolvedRoom",
    "resolve_floor_area_from_rooms",
]
