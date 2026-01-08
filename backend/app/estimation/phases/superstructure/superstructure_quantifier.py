# from dataclasses import dataclass
# from typing import Dict

# # maybe adjust the wall height , 3m nayo ni mob
# WALL_HEIGHT_M = 2.5
# OPENINGS_RATIO = 0.15


# BLOCKWORK_RATES = {
#     "burnt_bricks": 60,          # per sqm
#     "concrete_blocks": 12.5,
#     "machine_cut_blocks": 10,
# }


# @dataclass
# class SuperstructureQuantities:
#     wall_area_sqm: float
#     net_wall_area_sqm: float
#     block_units: int
#     mortar_volume_m3: float

#     column_count: int
#     beam_length_m: float

#     slab_area_sqm: float
#     slab_concrete_volume_m3: float

#     cement_bags: float
#     sand_tonnes: float
#     ballast_tonnes: float
#     reinforcement_kg: float


# def quantify_superstructure(
#     total_floor_area_sqm: float,
#     number_of_storeys: int,
#     blockwork_type: str,
# ) -> SuperstructureQuantities:
#     """
#     Quantifies superstructure materials based on resolved floor area.
#     """

#     #  WALLS 
#     # Approximate perimeter from area (assume near-rectangular footprint)
#     footprint_area = total_floor_area_sqm / number_of_storeys
#     perimeter_m = (footprint_area ** 0.5) * 4

#     wall_area = perimeter_m * WALL_HEIGHT_M * number_of_storeys
#     net_wall_area = wall_area * (1 - OPENINGS_RATIO)

#     blocks_per_sqm = BLOCKWORK_RATES.get(blockwork_type, 12.5)
#     block_units = int(net_wall_area * blocks_per_sqm)

#     # Mortar estimation (rule of thumb)
#     mortar_volume = round(block_units * 0.002, 2)  # m³ per block

#     #  STRUCTURE 
#     column_count = max(4, int(total_floor_area_sqm / 25))
#     beam_length = round(total_floor_area_sqm / 10, 2)

#     #  SLABS adjust pia thickness ya slab to maybe 20-30 cm
#     slab_area = total_floor_area_sqm
#     slab_volume = round(slab_area * 0.2, 2)  # 20cm slab

#     # Concrete mix heuristics (reuse foundation ratios)
#     cement_bags_per_m3 = 6.5
#     sand_tons_per_m3 = 0.5
#     ballast_tons_per_m3 = 0.8

#     cement_bags = round((mortar_volume * cement_bags_per_m3) + (slab_volume * cement_bags_per_m3), 1)
#     sand_tonnes = round((mortar_volume * 1.6) + (slab_volume * sand_tons_per_m3), 2)
#     ballast_tonnes = round(slab_volume * ballast_tons_per_m3, 2)

#     reinforcement_kg = round((slab_volume * 80) + (beam_length * 10), 2)

#     return SuperstructureQuantities(
#         wall_area_sqm=round(wall_area, 2),
#         net_wall_area_sqm=round(net_wall_area, 2),
#         block_units=block_units,
#         mortar_volume_m3=mortar_volume,
#         column_count=column_count,
#         beam_length_m=beam_length,
#         slab_area_sqm=slab_area,
#         slab_concrete_volume_m3=slab_volume,
#         cement_bags=cement_bags,
#         sand_tonnes=sand_tonnes,
#         ballast_tonnes=ballast_tonnes,
#         reinforcement_kg=reinforcement_kg,
#     )

from dataclasses import dataclass
from math import ceil
from typing import Dict

from app.estimation.base_materials.loader import load_base_rooms

WALL_HEIGHT_M = 2.5

BLOCKS_PER_SQM = {
    "burnt_bricks": 60.0,
    "concrete_blocks": 12.5,
    "machine_cut_blocks": 10.0,
}

DEFAULT_ROOM_SIZES = {
    "bedroom": 12,
    "master_bedroom": 16,
    "bathroom": 4,
    "living_room": 18,
    "dining": 10,
    "kitchen": 10,
}

DEFAULT_SIZE_TIERS = {
    "compact": 0.9,
    "standard": 1.0,
    "spacious": 1.15,
}

DEFAULT_PLANNING = {
    "circulation_factor": 0.20,
    "floor_to_floor_height_m": WALL_HEIGHT_M,
}


def _load_room_catalog() -> tuple[Dict[str, float], Dict[str, float], Dict[str, float]]:
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

    merged_planning = DEFAULT_PLANNING.copy()
    if isinstance(planning, dict):
        for key, value in planning.items():
            if isinstance(value, (int, float)) and value > 0:
                merged_planning[key] = float(value)

    return merged_sizes, merged_tiers, merged_planning

@dataclass
class SuperstructureQuantities:
    wall_area_sqm: float
    net_wall_area_sqm: float
    block_units: int
    mortar_volume_m3: float

    column_count: int
    beam_length_m: float

    slab_area_sqm: float
    slab_concrete_volume_m3: float

    cement_bags: float
    sand_tonnes: float
    ballast_tonnes: float
    reinforcement_kg: float

def storeys_from_structure_type(structure_type: str) -> int:
    return {
        "bungalow": 1,
        "two_storey": 2,
        "three_storey": 3,
        "multi_storey": 4,  # estimation baseline; consider adding an explicit storeys field later
    }.get(structure_type, 1)

# type of structure to go with
def resolve_structural_system(storeys: int, roof_type: str) -> str:
    
    if storeys >= 3 or roof_type == "flat":
        return "rc_frame"
    return "load_bearing"

def estimate_total_floor_area_sqm(data) -> float:
    """
    If declared floor area is provided, trust it.
    Otherwise estimate from rooms and room size preference (simple heuristic).
    """
    if data.declared_floor_area_sqm:
        return float(data.declared_floor_area_sqm)

    room_sizes, size_tiers, planning = _load_room_catalog()
    size_mult = size_tiers.get(data.room_size_preference, size_tiers["standard"])

    area = 0.0
    area += data.bedrooms * (room_sizes["bedroom"] * size_mult)
    area += data.master_bedrooms * (room_sizes["master_bedroom"] * size_mult)
    area += data.bathrooms * (room_sizes["bathroom"] * size_mult)
    area += data.living_rooms * (room_sizes["living_room"] * size_mult)
    area += data.dining_rooms * (room_sizes.get("dining", 10) * size_mult)
    area += data.kitchens * (room_sizes["kitchen"] * size_mult)

    # Additional rooms: assume 8 sqm each unless you want per-type mapping
    for room_name, sel in (data.additional_rooms or {}).items():
        room_size = room_sizes.get(room_name, 8)
        area += sel.count * (room_size * size_mult)

    # Circulation / walls allowance
    circulation_factor = planning.get("circulation_factor", DEFAULT_PLANNING["circulation_factor"])
    area *= 1 + circulation_factor

    # Cap: cannot exceed land size per your validation approach (conservative)
    return min(area, data.land_size_sqm)

def internal_wall_factor_from_rooms(data, storeys: int) -> float:
    # Count rooms that introduce partitions
    rooms = (
        data.bedrooms
        + data.master_bedrooms
        + data.bathrooms
        + data.living_rooms
        + data.dining_rooms
        + data.kitchens
        + sum(sel.count for sel in (data.additional_rooms or {}).values())
    )

    # Baseline internal wall factor
    factor = 0.45

    # More rooms -> more partitions
    # baseline expectation ~8 rooms; add 0.05 per 3 rooms above that
    extra = max(0, rooms - 8)
    factor += 0.05 * (extra // 3)

    # size preference adjustments
    if data.room_size_preference == "compact":
        factor += 0.10
    elif data.room_size_preference == "spacious":
        factor -= 0.05

    # more storeys typically means more partitions overall
    if storeys >= 3:
        factor += 0.05

    # clamp to sensible range
    return max(0.35, min(factor, 0.90))

def quantify_superstructure(
    data,
    total_floor_area_sqm: float | None = None,
    number_of_storeys: int | None = None,
) -> SuperstructureQuantities:
    _, _, planning = _load_room_catalog()
    wall_height_m = planning.get("floor_to_floor_height_m", WALL_HEIGHT_M)

    storeys = number_of_storeys or storeys_from_structure_type(data.structure_type)
    system = resolve_structural_system(storeys, data.roof_type)

    total_floor_area = total_floor_area_sqm or estimate_total_floor_area_sqm(data)
    footprint_area = total_floor_area / storeys

    # Perimeter approximation
    perimeter_m = (footprint_area ** 0.5) * 4

    # External walls
    external_wall_area = perimeter_m * wall_height_m * storeys

    # Add internal partitions
    internal_factor = internal_wall_factor_from_rooms(data, storeys)
    gross_wall_area = external_wall_area * (1 + internal_factor)

    # Openings: apply mainly to external walls; internal partitions have doors but not large windows
    openings_ratio_ext = 0.20  # more realistic than 0.15 for external
    openings_ratio_int = 0.05  # doors only
    net_wall_area = (external_wall_area * (1 - openings_ratio_ext)) + ((gross_wall_area - external_wall_area) * (1 - openings_ratio_int))

    blocks_per_sqm = BLOCKS_PER_SQM.get(data.blockwork_type, 12.5)
    block_units = ceil(net_wall_area * blocks_per_sqm)

    # Mortar estimation by wall area (more stable than per-block)
    mortar_m3_per_m2 = {
        "burnt_bricks": 0.03,
        "concrete_blocks": 0.015,
        "machine_cut_blocks": 0.012,
    }.get(data.blockwork_type, 0.015)
    mortar_volume = round(net_wall_area * mortar_m3_per_m2, 2)

    # Slabs: split on-grade vs suspended
    ground_slab_area = footprint_area
    upper_suspended_area = footprint_area * max(0, storeys - 1)
    roof_slab_area = footprint_area if data.roof_type == "flat" else 0.0

    suspended_slab_area = upper_suspended_area + roof_slab_area
    total_slab_area = ground_slab_area + suspended_slab_area

    # Thickness defaults
    ground_thk = 0.10 if data.room_size_preference == "compact" else 0.125
    suspended_thk = 0.125 if data.finishing_level == "standard" else 0.15

    ground_slab_vol = ground_slab_area * ground_thk
    suspended_slab_vol = suspended_slab_area * suspended_thk
    slab_volume = round(ground_slab_vol + suspended_slab_vol, 2)

    # Reinforcement rates (kg/m2)
    ground_steel = 5 if data.finishing_level == "standard" else 6
    suspended_steel = 12 if data.finishing_level == "standard" else (14 if data.finishing_level == "premium" else 16)

    slab_reinf_kg = (ground_slab_area * ground_steel) + (suspended_slab_area * suspended_steel)

    # Beams/columns
    if system == "rc_frame":
        # Simple grid-based column estimate
        grid_spacing = 4.0
        columns_per_floor = max(4, ceil(footprint_area / (grid_spacing ** 2)))
        column_count = columns_per_floor * storeys

        # Beam length heuristic: perimeter beams + internal beams
        beam_length = round((perimeter_m * storeys) * 1.6, 2)

        beam_steel_kg_per_m = 10  # baseline heuristic
        frame_reinf_kg = beam_length * beam_steel_kg_per_m
    else:
        # Load bearing: ring beam around perimeter (often per floor, but lighter than full frame)
        column_count = 0
        beam_length = round(perimeter_m * storeys, 2)

        ring_beam_steel_kg_per_m = 7
        frame_reinf_kg = beam_length * ring_beam_steel_kg_per_m

    reinforcement_kg = round(slab_reinf_kg + frame_reinf_kg, 2)

    # Concrete mix heuristics (separate mortar vs concrete)
    cement_bags_per_m3_concrete = 6.0
    cement_bags_per_m3_mortar = 7.5

    sand_tons_per_m3_concrete = 0.5
    ballast_tons_per_m3_concrete = 0.8

    # Mortar sand factor can be higher; you used 1.6 (very high) — keep moderate
    sand_tons_per_m3_mortar = 1.4

    cement_bags = round(
        mortar_volume * cement_bags_per_m3_mortar +
        slab_volume * cement_bags_per_m3_concrete,
        1
    )

    sand_tonnes = round(
        mortar_volume * sand_tons_per_m3_mortar +
        slab_volume * sand_tons_per_m3_concrete,
        2
    )
    
    ballast_tonnes = round(slab_volume * ballast_tons_per_m3_concrete, 2)

    return SuperstructureQuantities(
        wall_area_sqm=round(gross_wall_area, 2),
        net_wall_area_sqm=round(net_wall_area, 2),
        block_units=block_units,
        mortar_volume_m3=mortar_volume,
        column_count=column_count,
        beam_length_m=beam_length,
        slab_area_sqm=round(total_slab_area, 2),
        slab_concrete_volume_m3=slab_volume,
        cement_bags=cement_bags,
        sand_tonnes=sand_tonnes,
        ballast_tonnes=ballast_tonnes,
        reinforcement_kg=reinforcement_kg,
    )
