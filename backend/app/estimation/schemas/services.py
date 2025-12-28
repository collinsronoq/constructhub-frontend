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


class ServicesSecondFixInput(BaseModel):
    """
    Input for services second fix (fixtures & fittings).
    """

    floor_area_sqm: float = Field(..., gt=0)
    storeys: int = Field(1, ge=1)

    bedrooms: int = Field(3, ge=0)
    bathrooms: int = Field(1, ge=0)
    kitchens: int = Field(1, ge=0)
    living_rooms: int = Field(1, ge=0)
    dining_rooms: int = Field(1, ge=0)

    sockets_per_room: int = Field(4, ge=0)
    light_points_per_room: int = Field(2, ge=0)

    include_shower_mixers: bool = True
    include_instant_showers: bool = True
    quality_level: Literal["standard", "premium"] = "standard"


class ServicesSecondFixQuantities(BaseModel):
    """
    Quantified fixtures for second-fix services.
    """

    switches: int
    sockets: int
    light_fittings: int

    toilet_sets: int
    basins: int
    kitchen_sinks: int
    shower_mixers: int
    instant_showers: int
