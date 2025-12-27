from typing import Literal
from pydantic import BaseModel, Field


class ServicesFirstFixInput(BaseModel):
    """
    Input for services first fix (electrical + plumbing rough-in).
    """

    floor_area_sqm: float = Field(..., gt=0)
    storeys: int = Field(1, ge=1)

    bathrooms: int = Field(1, ge=0)
    kitchens: int = Field(1, ge=0)
    laundry_rooms: int = Field(0, ge=0)

    sockets_per_room: int = Field(4, ge=0)
    light_points_per_room: int = Field(2, ge=0)

    quality_level: Literal["standard", "premium"] = "standard"
    include_hot_water: bool = True
    include_earthing: bool = True


class ServicesFirstFixQuantities(BaseModel):
    """
    Quantified materials for first-fix services.
    """

    total_light_points: int
    total_socket_points: int
    conduit_m: float
    lighting_cable_m: float
    power_cable_m: float
    junction_boxes: int

    cold_water_pipe_m: float
    hot_water_pipe_m: float
    waste_pipe_m: float
    earthing_rods: int = 0
