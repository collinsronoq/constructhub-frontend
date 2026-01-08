from typing import Dict, Optional, Literal
from pydantic import BaseModel, Field, field_validator


StructureType = Literal[
    "bungalow",
    "two_storey",
    "three_storey",
    "multi_storey"
]

BlockworkType = Literal[
    "burnt_bricks",
    "concrete_blocks",
    "machine_cut_blocks"
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
        description="Optional rooms such as pantry, study, laundry"
    )

    # Quality / planning
    room_size_preference: Literal[
        "compact",
        "standard",
        "spacious"
    ] = "standard"
    finishing_level: Literal["standard", "premium", "luxury"] = "standard"

    @field_validator("declared_floor_area_sqm")
    def validate_declared_floor_area(cls, value, info):
        if value:
            land_size = info.data.get("land_size_sqm") if hasattr(info, "data") else None
            if land_size and value > land_size:
                raise ValueError("Declared floor area cannot exceed land size")
        return value
