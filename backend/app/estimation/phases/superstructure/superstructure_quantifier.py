from dataclasses import dataclass
from typing import Dict

# maybe adjust the wall height , 3m nayo ni mob
WALL_HEIGHT_M = 3.0
OPENINGS_RATIO = 0.15


BLOCKWORK_RATES = {
    "burnt_bricks": 60,          # per sqm
    "concrete_blocks": 12.5,
    "machine_cut_blocks": 10,
}


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


def quantify_superstructure(
    total_floor_area_sqm: float,
    number_of_storeys: int,
    blockwork_type: str,
) -> SuperstructureQuantities:
    """
    Quantifies superstructure materials based on resolved floor area.
    """

    #  WALLS 
    # Approximate perimeter from area (assume near-rectangular footprint)
    footprint_area = total_floor_area_sqm / number_of_storeys
    perimeter_m = (footprint_area ** 0.5) * 4

    wall_area = perimeter_m * WALL_HEIGHT_M * number_of_storeys
    net_wall_area = wall_area * (1 - OPENINGS_RATIO)

    blocks_per_sqm = BLOCKWORK_RATES.get(blockwork_type, 12.5)
    block_units = int(net_wall_area * blocks_per_sqm)

    # Mortar estimation (rule of thumb)
    mortar_volume = round(block_units * 0.002, 2)  # m³ per block

    #  STRUCTURE 
    column_count = max(4, int(total_floor_area_sqm / 25))
    beam_length = round(total_floor_area_sqm / 10, 2)

    #  SLABS adjust pia thickness ya slab to maybe 20-30 cm
    slab_area = total_floor_area_sqm
    slab_volume = round(slab_area * 0.125, 2)  # 125mm slab

    # Concrete mix heuristics (reuse foundation ratios)
    cement_bags_per_m3 = 6.5
    sand_tons_per_m3 = 0.5
    ballast_tons_per_m3 = 0.8

    cement_bags = round((mortar_volume * cement_bags_per_m3) + (slab_volume * cement_bags_per_m3), 1)
    sand_tonnes = round((mortar_volume * 1.6) + (slab_volume * sand_tons_per_m3), 2)
    ballast_tonnes = round(slab_volume * ballast_tons_per_m3, 2)

    reinforcement_kg = round((slab_volume * 80) + (beam_length * 10), 2)

    return SuperstructureQuantities(
        wall_area_sqm=round(wall_area, 2),
        net_wall_area_sqm=round(net_wall_area, 2),
        block_units=block_units,
        mortar_volume_m3=mortar_volume,
        column_count=column_count,
        beam_length_m=beam_length,
        slab_area_sqm=slab_area,
        slab_concrete_volume_m3=slab_volume,
        cement_bags=cement_bags,
        sand_tonnes=sand_tonnes,
        ballast_tonnes=ballast_tonnes,
        reinforcement_kg=reinforcement_kg,
    )
