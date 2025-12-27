from typing import Literal, Optional
from pydantic import BaseModel, Field


class FinishesInput(BaseModel):
    """
    Input for finishes stage (internal finishes and joinery).
    """

    floor_area_sqm: float = Field(..., gt=0)
    storeys: int = Field(1, ge=1)
    wall_height_m: float = Field(3.0, gt=0)

    bedrooms: int = Field(3, ge=0)
    bathrooms: int = Field(1, ge=0)
    kitchens: int = Field(1, ge=0)
    living_rooms: int = Field(1, ge=0)
    dining_rooms: int = Field(1, ge=0)
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

    joinery_level: Literal["standard", "premium"] = "standard"
    quality_level: Literal["standard", "premium", "luxury"] = "standard"


class FinishesQuantities(BaseModel):
    """
    Quantified finishes materials.
    """

    main_floor_area_sqm: float
    wet_floor_area_sqm: float
    stairs_area_sqm: float

    wall_tile_area_sqm: float
    plaster_area_sqm: float

    ceiling_area_sqm: float

    paint_wall_area_sqm: float
    paint_ceiling_area_sqm: float
    paint_exterior_area_sqm: float

    skirting_m: float
    cornice_m: float

    internal_doors: int
    wardrobes_m: float
    kitchen_cabinets_m: float
    countertops_m: float

    tile_adhesive_bags: int
    tile_grout_bags: int
    primer_liters: float
    paint_liters_interior: float
    paint_liters_ceiling: float
    paint_liters_exterior: float
