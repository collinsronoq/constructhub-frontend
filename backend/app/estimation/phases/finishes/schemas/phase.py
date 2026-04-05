from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class FinishesInput(BaseModel):
    """
    Input for finishes stage (internal and external finishes + joinery).
    """

    # Compatibility-only fields. Shared resolved geometry is the authoritative source.
    floor_area_sqm: float | None = Field(None, gt=0)
    storeys: int | None = Field(None, ge=1)
    wall_height_m: float = Field(3.0, gt=0)

    bedrooms: int = Field(3, ge=0)
    master_bedrooms: int = Field(0, ge=0)
    bathrooms: int = Field(1, ge=0)
    kitchens: int = Field(1, ge=0)
    living_rooms: int = Field(1, ge=0)
    dining_rooms: int = Field(1, ge=0)
    stores: int = Field(0, ge=0)
    other_rooms: int = Field(0, ge=0)

    main_floor_finish: Literal["tile", "laminate", "parquet", "polished_screed"] = "tile"
    wet_floor_finish: Literal["ceramic_tile", "porcelain_tile"] = "ceramic_tile"
    wet_wall_tiling: bool = True
    ceiling_type: Literal["gypsum_board", "acoustic_board", "tng", "exposed"] = "gypsum_board"
    paint_system: Literal["standard_2_coat", "premium_3_coat"] = "standard_2_coat"

    include_cornices: bool = True
    include_skirting: bool = True
    include_wardrobes: bool = True
    include_kitchen_cabinets: bool = True
    include_bathroom_cabinetry: bool = True
    include_store_cabinetry: bool = True

    joinery_level: Literal["standard", "premium"] = "standard"
    quality_level: Literal["standard", "premium", "luxury"] = "standard"


class FinishesResolvedInputs(BaseModel):
    effective_floor_area_sqm: float
    effective_storeys: int
    effective_plan_perimeter_m: float
    used_geometry_floor_area: bool
    used_geometry_storeys: bool
    used_geometry_perimeter: bool
    geometry_area_source: str | None = None
    geometry_room_program_total_rooms: int = 0
    geometry_caps_applied: list[str] = Field(default_factory=list)
    geometry_fits_plot_constraints: bool | None = None


class FinishesGeometryModel(BaseModel):
    room_count: int
    wet_rooms_count: int
    non_wet_rooms_count: int

    external_wall_finish_area_sqm: float
    interior_wall_finish_area_sqm: float
    openings_deduction_area_sqm: float

    main_floor_finish_area_sqm: float
    wet_floor_finish_area_sqm: float
    stair_finish_area_sqm: float

    wall_tile_area_sqm: float
    plaster_render_area_sqm: float
    skimming_area_sqm: float

    ceiling_area_sqm: float
    interior_wall_paint_area_sqm: float
    ceiling_paint_area_sqm: float
    exterior_wall_paint_area_sqm: float

    skirting_run_m: float
    cornice_run_m: float
    internal_doors_count: int

    wardrobe_run_m: float
    kitchen_base_cabinet_run_m: float
    kitchen_wall_cabinet_run_m: float
    bathroom_cabinet_run_m: float
    store_cabinet_or_shelving_run_m: float
    countertop_run_m: float
    total_cabinetry_run_m: float


class FinishesQuantityModel(BaseModel):
    main_floor_finish_area_sqm: float
    wet_floor_finish_area_sqm: float
    stair_finish_area_sqm: float

    wall_tile_area_sqm: float
    plaster_render_area_sqm: float
    skimming_area_sqm: float

    ceiling_area_sqm: float
    interior_wall_paint_area_sqm: float
    ceiling_paint_area_sqm: float
    exterior_wall_paint_area_sqm: float

    tile_adhesive_bags: int
    grout_bags: int

    plaster_cement_bags: int
    plaster_sand_tonnes: float
    skim_coat_bags: int

    primer_litres: float
    interior_paint_litres: float
    ceiling_paint_litres: float
    exterior_paint_litres: float

    internal_doors_count: int
    skirting_run_m: float
    cornice_run_m: float

    wardrobe_run_m: float
    kitchen_base_cabinet_run_m: float
    kitchen_wall_cabinet_run_m: float
    bathroom_cabinet_run_m: float
    store_cabinet_or_shelving_run_m: float
    countertop_run_m: float
    board_equivalent_count: int
    joinery_fittings_sets: int

    room_count: int
    wet_rooms_count: int
    storey_factor: float


__all__ = [
    "FinishesInput",
    "FinishesResolvedInputs",
    "FinishesGeometryModel",
    "FinishesQuantityModel",
]
