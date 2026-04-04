from __future__ import annotations

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


class ServicesFirstFixResolvedInputs(BaseModel):
    effective_floor_area_sqm: float
    effective_storeys: int
    used_geometry_floor_area: bool
    used_geometry_storeys: bool
    geometry_area_source: str | None = None
    geometry_room_program_total_rooms: int = 0
    geometry_caps_applied: list[str] = Field(default_factory=list)
    geometry_fits_plot_constraints: bool | None = None


class ServicesFirstFixQuantityModel(BaseModel):
    wet_rooms_count: int
    habitable_rooms_count: int

    total_light_points: int
    total_socket_points: int
    conduit_length_m: float
    lighting_cable_length_m: float
    power_cable_length_m: float
    junction_boxes_count: int

    cold_water_pipe_length_m: float
    hot_water_pipe_length_m: float
    waste_pipe_length_m: float
    earthing_rods_count: int = 0

    storey_factor: float
    waste_factor: float
    conduit_run_per_point_m: float


__all__ = [
    "ServicesFirstFixInput",
    "ServicesFirstFixQuantityModel",
    "ServicesFirstFixResolvedInputs",
]
