from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Literal, Optional

from pydantic import BaseModel, Field, field_validator


StructureType = Literal[
    "bungalow",
    "two_storey",
    "three_storey",
    "multi_storey",
]

BlockworkType = Literal[
    "burnt_bricks",
    "concrete_blocks",
    "machine_cut_blocks",
]


class RoomSelection(BaseModel):
    count: int = Field(..., ge=0)


class SuperstructureInput(BaseModel):
    # Land & structure
    land_size_sqm: float = Field(..., gt=0)
    structure_type: StructureType
    blockwork_type: BlockworkType
    roof_type: Literal["gable", "hip", "flat", "mono_pitch"]

    # Optional manual override
    declared_floor_area_sqm: Optional[float] = Field(None, gt=0)

    # Room configuration
    bedrooms: int = Field(..., ge=1)
    bathrooms: int = Field(..., ge=1)
    master_bedrooms: int = Field(0, ge=0)
    living_rooms: int = Field(1, ge=0)
    dining_rooms: int = Field(1, ge=0)
    kitchens: int = Field(1, ge=0)

    additional_rooms: Dict[str, RoomSelection] = Field(
        default_factory=dict,
        description="Optional rooms such as pantry, study, laundry",
    )

    # Quality / planning
    room_size_preference: Literal[
        "compact",
        "standard",
        "spacious",
    ] = "standard"
    finishing_level: Literal["standard", "premium", "luxury"] = "standard"

    @field_validator("declared_floor_area_sqm")
    def validate_declared_floor_area(cls, value, info):
        if value:
            land_size = info.data.get("land_size_sqm") if hasattr(info, "data") else None
            if land_size and value > land_size:
                raise ValueError("Declared floor area cannot exceed land size")
        return value


@dataclass(frozen=True)
class SuperstructurePhaseGeometry:
    total_floor_area_sqm: float
    storeys: int
    footprint_area_sqm: float

    wall_height_m: float
    wall_thickness_m: float
    external_perimeter_m: float
    internal_wall_ratio: float

    base_room_count: int
    additional_room_count: int
    total_room_count: int

    external_wall_area: float
    internal_wall_area: float
    total_wall_area: float

    door_count: int
    window_count: int
    door_area: float
    window_area: float
    openings_area: float
    openings_capped: bool
    net_wall_area: float

    grid_spacing_m: float
    column_count_per_floor: int
    column_count: int

    beam_length_m: float
    lintel_length_m: float

    column_size_m: float
    beam_width_m: float
    beam_depth_m: float
    lintel_width_m: float
    lintel_depth_m: float

    suspended_slab_area: float
    roof_slab_area: float
    slab_area: float
    slab_thickness_m: float


@dataclass(frozen=True)
class SuperstructureQuantityModel:
    blocks_per_sqm: float
    block_count: int

    mortar_consumption_per_sqm: float
    mortar_volume_m3: float
    mortar_mix_cement: float
    mortar_mix_sand: float
    mortar_parts: float
    dry_volume_factor: float
    mortar_dry_volume_m3: float
    mortar_cement_volume_m3: float
    mortar_sand_volume_m3: float
    mortar_cement_bags: float
    mortar_sand_tons: float

    beam_concrete_volume: float
    column_concrete_volume: float
    slab_concrete_volume: float
    concrete_volume_total: float
    concrete_cement_bags: float
    concrete_sand_tons: float
    concrete_ballast_tons: float

    beam_rebar_kg: float
    column_rebar_kg: float
    slab_rebar_kg: float
    rebar_weight_kg: float


@dataclass(frozen=True)
class SuperstructureLabourModel:
    finishing_complexity: float
    storey_complexity: float
    complexity_factor: float

    block_laying_days: int
    concrete_casting_days: int
    formwork_days: int
    steel_fixing_days: int
    support_days: int
    foreman_days: int

    beam_formwork_area: float
    column_formwork_area: float
    slab_formwork_area: float
    formwork_area_total: float


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


__all__ = [
    "BlockworkType",
    "RoomSelection",
    "StructureType",
    "SuperstructureInput",
    "SuperstructureLabourModel",
    "SuperstructurePhaseGeometry",
    "SuperstructureQuantities",
    "SuperstructureQuantityModel",
]
