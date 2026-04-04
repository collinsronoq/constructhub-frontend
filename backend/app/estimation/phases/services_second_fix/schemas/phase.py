from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class ServicesSecondFixInput(BaseModel):
    """
    Input for services second fix (fixtures and final fittings).
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


class ServicesSecondFixResolvedInputs(BaseModel):
    effective_floor_area_sqm: float
    effective_storeys: int
    used_geometry_floor_area: bool
    used_geometry_storeys: bool
    geometry_area_source: str | None = None
    geometry_room_program_total_rooms: int = 0
    geometry_caps_applied: list[str] = Field(default_factory=list)
    geometry_fits_plot_constraints: bool | None = None


class ServicesSecondFixQuantityModel(BaseModel):
    habitable_rooms_count: int
    storey_factor: float

    total_light_points: int
    total_socket_points: int

    switches_count: int
    sockets_count: int
    light_fittings_count: int

    toilet_sets_count: int
    basins_count: int
    kitchen_sinks_count: int
    shower_mixers_count: int
    instant_showers_count: int


__all__ = [
    "ServicesSecondFixInput",
    "ServicesSecondFixResolvedInputs",
    "ServicesSecondFixQuantityModel",
]

