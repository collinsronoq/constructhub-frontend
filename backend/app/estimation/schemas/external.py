from typing import Literal, Optional
from pydantic import BaseModel, Field


class ExternalWorksInput(BaseModel):
    """
    Inputs for external works, including optional perimeter wall and sewerage.
    """

    land_size_sqm: float = Field(..., gt=0)
    floor_area_sqm: float = Field(..., gt=0)

    # Perimeter wall
    perimeter_wall_enabled: bool = True
    perimeter_wall_type: Literal["block_wall", "precast", "chain_link", "none"] = "block_wall"
    perimeter_wall_length_m: Optional[float] = Field(None, gt=0)
    perimeter_wall_height_m: float = Field(2.4, gt=0)
    gate_count: int = Field(1, ge=0)
    gate_width_m: float = Field(3.0, gt=0)
    razor_wire: bool = False

    # External surfaces
    paving_area_sqm: Optional[float] = Field(None, gt=0)
    drainage_length_m: Optional[float] = Field(None, gt=0)
    landscaping_area_sqm: Optional[float] = Field(None, gt=0)

    # Sewerage / waste
    sewerage_system: Literal["septic_tank", "biodigester", "sewer_connection"] = "septic_tank"
    sewer_connection_length_m: float = Field(10, gt=0)
    biodigester_capacity_users: int = Field(8, gt=0)

    quality_level: Literal["standard", "premium"] = "standard"


class ExternalWorksQuantities(BaseModel):
    """
    Quantified materials and scopes for external works.
    """

    paving_area_sqm: float
    drainage_length_m: float
    landscaping_area_sqm: float

    # Perimeter wall (if enabled)
    wall_length_m: float = 0
    wall_area_sqm: float = 0
    wall_blocks: int = 0
    wall_mortar_m3: float = 0
    footing_concrete_m3: float = 0
    column_concrete_m3: float = 0
    column_reinf_kg: float = 0
    plaster_area_sqm: float = 0
    razor_wire_m: float = 0
    chain_link_mesh_m: float = 0
    chain_link_post_concrete_m3: float = 0
    precast_length_m: float = 0
    gate_count: int = 0

    # Sewerage / waste
    septic_concrete_m3: float = 0
    septic_reinf_kg: float = 0
    sewer_pipe_m: float = 0
    manhole_count: int = 0
    biodigester_units: int = 0
