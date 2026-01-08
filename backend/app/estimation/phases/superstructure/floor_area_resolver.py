from dataclasses import dataclass
from typing import Dict, List

from app.estimation.base_materials.loader import load_base_rooms


# Reference room sizes (sqm)
DEFAULT_ROOM_SIZES = {
    "bedroom": 12,
    "master_bedroom": 18,
    "bathroom": 4,
    "kitchen": 10,
    "dining": 10,
    "living_room": 18,
    "store": 4,
    "pantry": 3,
    "laundry": 4,
    "study": 8,
}

DEFAULT_SIZE_TIERS = {
    "compact": 0.9,
    "standard": 1.0,
    "spacious": 1.15,
}

DEFAULT_CIRCULATION_RATIO = 0.12


def _load_room_catalog() -> tuple[Dict[str, float], Dict[str, float], float]:
    base = load_base_rooms() or {}
    rooms = base.get("rooms", {}) if isinstance(base, dict) else {}
    tiers = base.get("room_size_tiers", {}) if isinstance(base, dict) else {}
    planning = base.get("planning_assumptions", {}) if isinstance(base, dict) else {}

    room_sizes: Dict[str, float] = {}
    for key, value in rooms.items():
        if not isinstance(value, dict):
            continue
        size = value.get("average_size_sqm") or value.get("min_size_sqm")
        if size:
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

    return merged_sizes, merged_tiers, float(circulation_ratio)


@dataclass
class ResolvedRoom:
    name: str
    quantity: int
    base_size_sqm: float
    adjusted_size_sqm: float
    total_area_sqm: float


@dataclass
class FloorAreaResolution:
    rooms: List[ResolvedRoom]
    base_room_area_sqm: float
    circulation_area_sqm: float
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
    """
    Derives floor area automatically from room selections and land constraints.
    """

    resolved_rooms: List[ResolvedRoom] = []
    base_area = 0.0

    room_sizes, size_tiers, default_circulation = _load_room_catalog()
    size_multiplier = size_tiers.get(size_tier, size_tiers["standard"])
    circulation_ratio = default_circulation if circulation_ratio is None else circulation_ratio

    # Step 1: calculate base room area
    for room, qty in room_quantities.items():
        if room not in room_sizes or qty <= 0:
            continue

        room_size = room_sizes[room] * size_multiplier
        room_total = room_size * qty
        base_area += room_total

        resolved_rooms.append(
            ResolvedRoom(
                name=room,
                quantity=qty,
                base_size_sqm=room_size,
                adjusted_size_sqm=room_size,
                total_area_sqm=room_total,
            )
        )

    if base_area <= 0:
        return FloorAreaResolution(
            rooms=[],
            base_room_area_sqm=0,
            circulation_area_sqm=0,
            total_floor_area_sqm=0,
            scale_factor=1.0,
            fits_land_constraints=True,
        )

    # Step 2: add circulation
    circulation_area = base_area * circulation_ratio
    gross_area = base_area + circulation_area

    # Step 3: compute scale factor
    scale_factor = max_allowable_floor_area_sqm / gross_area

    scale_factor = max(min(scale_factor, max_scale), min_scale)

    # Step 4: apply scaling
    adjusted_total = 0.0
    for room in resolved_rooms:
        room.adjusted_size_sqm = round(room.base_size_sqm * scale_factor, 2)
        room.total_area_sqm = round(room.adjusted_size_sqm * room.quantity, 2)
        adjusted_total += room.total_area_sqm

    circulation_area = round(adjusted_total * circulation_ratio, 2)
    final_total = round(adjusted_total + circulation_area, 2)

    fits = final_total <= max_allowable_floor_area_sqm

    print(f'''floor area details: \n
          rooms: {resolved_rooms}   \n
          base room area: {base_area}   \n
          circulation area: {circulation_area} \n
          total floor area: {final_total} \n 
          land constraints: {fits}  \n 
          scale factor: {scale_factor}
          
        ''')

    return FloorAreaResolution(
        rooms=resolved_rooms,
        base_room_area_sqm=round(base_area, 2),
        circulation_area_sqm=circulation_area,
        total_floor_area_sqm=final_total,
        scale_factor=round(scale_factor, 2),
        fits_land_constraints=fits,
    )
