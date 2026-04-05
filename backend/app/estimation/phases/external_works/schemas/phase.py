from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class ExternalWorksInput(BaseModel):
    """
    Inputs for external works (hardscape, softscape, boundary, sewerage).
    """

    land_size_sqm: float = Field(..., gt=0)
    # Compatibility-only field. Shared resolved geometry is the authoritative floor-area source.
    floor_area_sqm: float | None = Field(None, gt=0)

    perimeter_wall_enabled: bool = False
    perimeter_wall_type: Literal["block_wall", "precast", "chain_link", "none"] = "block_wall"
    perimeter_wall_length_m: float | None = Field(None, gt=0)
    perimeter_wall_height_m: float = Field(2.4, gt=0)
    gate_count: int = Field(1, ge=0)
    gate_width_m: float = Field(3.0, gt=0)
    razor_wire: bool = False

    paving_area_sqm: float | None = Field(None, gt=0)
    driveway_area_sqm: float | None = Field(None, gt=0)
    drainage_length_m: float | None = Field(None, gt=0)
    landscaping_area_sqm: float | None = Field(None, gt=0)

    sewerage_system: Literal["septic_tank", "biodigester", "sewer_connection"] = "septic_tank"
    sewer_connection_length_m: float = Field(10, gt=0)
    biodigester_capacity_users: int = Field(8, gt=0)

    quality_level: Literal["standard", "premium"] = "standard"


class ExternalWorksResolvedInputs(BaseModel):
    plot_area_sqm: float
    effective_total_floor_area_sqm: float
    effective_building_footprint_sqm: float
    effective_building_plan_perimeter_m: float

    used_geometry_floor_area: bool
    used_geometry_footprint: bool
    used_geometry_plan_perimeter: bool

    geometry_area_source: str | None = None
    geometry_caps_applied: list[str] = Field(default_factory=list)
    geometry_fits_plot_constraints: bool | None = None


class ExternalWorksGeometryModel(BaseModel):
    plot_area_sqm: float
    plot_perimeter_m: float
    building_footprint_area_sqm: float
    building_plan_perimeter_m: float

    open_external_area_sqm: float
    hardscape_candidate_area_sqm: float
    softscape_candidate_area_sqm: float
    open_area_unallocated_sqm: float

    boundary_length_m: float
    boundary_effective_length_m: float
    drainage_candidate_length_m: float
    gate_opening_length_m: float


class ExternalWorksQuantityModel(BaseModel):
    plot_area_sqm: float
    plot_perimeter_m: float
    building_footprint_area_sqm: float
    open_external_area_sqm: float
    hardscape_candidate_area_sqm: float
    softscape_candidate_area_sqm: float
    open_area_unallocated_sqm: float

    paving_area_sqm: float
    driveway_area_sqm: float
    walkway_area_sqm: float
    drainage_length_m: float
    landscaping_area_sqm: float
    kerbstone_length_m: float

    boundary_wall_length_m: float
    boundary_wall_area_sqm: float
    wall_blocks_count: int
    wall_mortar_volume_m3: float
    wall_footing_concrete_volume_m3: float
    column_concrete_volume_m3: float
    column_reinf_kg: float
    post_count: int
    mesh_length_m: float
    precast_length_m: float

    gate_count: int
    gate_width_m: float
    gate_leaf_equivalent_units: float
    razor_wire_length_m: float

    septic_concrete_volume_m3: float
    septic_reinforcement_kg: float
    biodigester_units: int
    biodigester_capacity_basis_users: int
    sewer_connection_length_m: float
    manholes_count: int

    excavation_scope_m: float
    concrete_scope_m3: float
    quality_factor: float


__all__ = [
    "ExternalWorksInput",
    "ExternalWorksResolvedInputs",
    "ExternalWorksGeometryModel",
    "ExternalWorksQuantityModel",
]
