from dataclasses import dataclass
from typing import Dict, List


# Reference room sizes (sqm)
ROOM_SIZE_REFERENCE = {
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
    circulation_ratio: float = 0.12,
    min_scale: float = 0.85,
    max_scale: float = 1.15,
) -> FloorAreaResolution:
    """
    Derives floor area automatically from room selections and land constraints.
    """

    resolved_rooms: List[ResolvedRoom] = []
    base_area = 0.0

    # Step 1: calculate base room area
    for room, qty in room_quantities.items():
        if room not in ROOM_SIZE_REFERENCE or qty <= 0:
            continue

        room_size = ROOM_SIZE_REFERENCE[room]
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

    return FloorAreaResolution(
        rooms=resolved_rooms,
        base_room_area_sqm=round(base_area, 2),
        circulation_area_sqm=circulation_area,
        total_floor_area_sqm=final_total,
        scale_factor=round(scale_factor, 2),
        fits_land_constraints=fits,
    )
