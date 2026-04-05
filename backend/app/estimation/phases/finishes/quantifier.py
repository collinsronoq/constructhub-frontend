from __future__ import annotations

from math import ceil, sqrt

from app.estimation.common_schemas import QuantityItem
from app.estimation.phases.finishes.geometry import derive_finishes_geometry
from app.estimation.phases.finishes.schemas import (
    FinishesGeometryModel,
    FinishesInput,
    FinishesQuantityModel,
    FinishesResolvedInputs,
)


PLASTER_THICKNESS_M = 0.015
DRY_VOLUME_FACTOR = 1.33
PLASTER_CEMENT_RATIO = 1
PLASTER_SAND_RATIO = 4
CEMENT_BAG_VOLUME_M3 = 0.035
SAND_DENSITY_TONNE_PER_M3 = 1.6

SKIM_COAT_COVERAGE_SQM_PER_BAG = 22.0

TILE_ADHESIVE_COVERAGE_SQM_PER_BAG = 4.5
GROUT_COVERAGE_SQM_PER_BAG = 8.0

PAINT_WASTE_FACTOR = 1.05
PRIMER_COVERAGE_SQM_PER_LITRE = 10.0
INTERIOR_PAINT_COVERAGE_SQM_PER_LITRE = 11.0
CEILING_PAINT_COVERAGE_SQM_PER_LITRE = 12.0
EXTERIOR_PAINT_COVERAGE_SQM_PER_LITRE = 9.0


def derive_finishes_quantities(
    data: FinishesInput,
    geometry: FinishesGeometryModel,
    resolved_inputs: FinishesResolvedInputs,
) -> FinishesQuantityModel:
    total_tiled_area_sqm = (
        geometry.main_floor_finish_area_sqm
        + geometry.wet_floor_finish_area_sqm
        + geometry.stair_finish_area_sqm
        + geometry.wall_tile_area_sqm
    )
    tile_adhesive_bags = ceil(total_tiled_area_sqm / TILE_ADHESIVE_COVERAGE_SQM_PER_BAG)
    grout_bags = ceil(total_tiled_area_sqm / GROUT_COVERAGE_SQM_PER_BAG)

    # Plaster/render is materialized from area into mortar volume so users can see
    # explicit cement/sand demand instead of an opaque area-only cost line.
    plaster_mortar_volume_m3 = (
        geometry.plaster_render_area_sqm
        * PLASTER_THICKNESS_M
        * DRY_VOLUME_FACTOR
    )
    mix_total = PLASTER_CEMENT_RATIO + PLASTER_SAND_RATIO
    cement_volume_m3 = plaster_mortar_volume_m3 * (PLASTER_CEMENT_RATIO / mix_total)
    sand_volume_m3 = plaster_mortar_volume_m3 * (PLASTER_SAND_RATIO / mix_total)
    plaster_cement_bags = ceil(cement_volume_m3 / CEMENT_BAG_VOLUME_M3)
    plaster_sand_tonnes = sand_volume_m3 * SAND_DENSITY_TONNE_PER_M3

    skim_coat_bags = ceil(geometry.skimming_area_sqm / SKIM_COAT_COVERAGE_SQM_PER_BAG)

    wall_and_ceiling_primer_area = (
        geometry.interior_wall_paint_area_sqm
        + geometry.ceiling_paint_area_sqm
    )
    primer_litres = (wall_and_ceiling_primer_area / PRIMER_COVERAGE_SQM_PER_LITRE) * PAINT_WASTE_FACTOR

    coats_wall = 2 if data.paint_system == "standard_2_coat" else 3
    coats_ceiling = 2 if data.paint_system == "standard_2_coat" else 3
    coats_exterior = 2 if data.paint_system == "standard_2_coat" else 3

    interior_paint_litres = (
        (geometry.interior_wall_paint_area_sqm / INTERIOR_PAINT_COVERAGE_SQM_PER_LITRE)
        * coats_wall
        * PAINT_WASTE_FACTOR
    )
    ceiling_paint_litres = (
        (geometry.ceiling_paint_area_sqm / CEILING_PAINT_COVERAGE_SQM_PER_LITRE)
        * coats_ceiling
        * PAINT_WASTE_FACTOR
    )
    exterior_paint_litres = (
        (geometry.exterior_wall_paint_area_sqm / EXTERIOR_PAINT_COVERAGE_SQM_PER_LITRE)
        * coats_exterior
        * PAINT_WASTE_FACTOR
    )

    # Two-layer joinery model:
    # 1) design demand in run-length from geometry.py
    # 2) market-facing board-equivalent conversion for pricing
    board_factor = 2.20 if data.joinery_level == "standard" else 2.45
    board_equivalent_count = ceil(geometry.total_cabinetry_run_m * board_factor)
    joinery_fittings_sets = ceil(geometry.total_cabinetry_run_m / 2.5) if geometry.total_cabinetry_run_m > 0 else 0

    storey_factor = 1 + 0.10 * max(0, resolved_inputs.effective_storeys - 1)

    return FinishesQuantityModel(
        main_floor_finish_area_sqm=geometry.main_floor_finish_area_sqm,
        wet_floor_finish_area_sqm=geometry.wet_floor_finish_area_sqm,
        stair_finish_area_sqm=geometry.stair_finish_area_sqm,
        wall_tile_area_sqm=geometry.wall_tile_area_sqm,
        plaster_render_area_sqm=geometry.plaster_render_area_sqm,
        skimming_area_sqm=geometry.skimming_area_sqm,
        ceiling_area_sqm=geometry.ceiling_area_sqm,
        interior_wall_paint_area_sqm=geometry.interior_wall_paint_area_sqm,
        ceiling_paint_area_sqm=geometry.ceiling_paint_area_sqm,
        exterior_wall_paint_area_sqm=geometry.exterior_wall_paint_area_sqm,
        tile_adhesive_bags=tile_adhesive_bags,
        grout_bags=grout_bags,
        plaster_cement_bags=plaster_cement_bags,
        plaster_sand_tonnes=round(plaster_sand_tonnes, 2),
        skim_coat_bags=skim_coat_bags,
        primer_litres=round(primer_litres, 1),
        interior_paint_litres=round(interior_paint_litres, 1),
        ceiling_paint_litres=round(ceiling_paint_litres, 1),
        exterior_paint_litres=round(exterior_paint_litres, 1),
        internal_doors_count=geometry.internal_doors_count,
        skirting_run_m=geometry.skirting_run_m,
        cornice_run_m=geometry.cornice_run_m,
        wardrobe_run_m=geometry.wardrobe_run_m,
        kitchen_base_cabinet_run_m=geometry.kitchen_base_cabinet_run_m,
        kitchen_wall_cabinet_run_m=geometry.kitchen_wall_cabinet_run_m,
        bathroom_cabinet_run_m=geometry.bathroom_cabinet_run_m,
        store_cabinet_or_shelving_run_m=geometry.store_cabinet_or_shelving_run_m,
        countertop_run_m=geometry.countertop_run_m,
        board_equivalent_count=board_equivalent_count,
        joinery_fittings_sets=joinery_fittings_sets,
        room_count=geometry.room_count,
        wet_rooms_count=geometry.wet_rooms_count,
        storey_factor=round(storey_factor, 3),
    )


def build_finishes_quantity_items(
    data: FinishesInput,
    geometry: FinishesGeometryModel,
    quantities: FinishesQuantityModel,
    resolved_inputs: FinishesResolvedInputs,
) -> list[QuantityItem]:
    return [
        QuantityItem(name="main_floor_finish_area_sqm", value=quantities.main_floor_finish_area_sqm, unit="sqm", formula="effective_floor_area_sqm - wet_floor_finish_area_sqm - stair_finish_area_sqm"),
        QuantityItem(name="wet_floor_finish_area_sqm", value=quantities.wet_floor_finish_area_sqm, unit="sqm", formula="clamp((bathrooms*5.5 + kitchens*6.5 + stores*1.5), 14%-32% of effective_floor_area_sqm)"),
        QuantityItem(name="stair_finish_area_sqm", value=quantities.stair_finish_area_sqm, unit="sqm", formula="effective_floor_area_sqm * 0.035 if effective_storeys > 1 else 0"),
        QuantityItem(name="wall_tile_area_sqm", value=quantities.wall_tile_area_sqm, unit="sqm", formula="wet_wall_tiling ? min(((bathrooms*max(13.5, wall_height_m*6.2) + kitchens*5.5)*1.07), interior_wall_finish_area_sqm*0.42) : 0"),
        QuantityItem(name="plaster_render_area_sqm", value=quantities.plaster_render_area_sqm, unit="sqm", formula="(non_tiled_interior_area*0.55) + (external_wall_finish_area_sqm*0.90)"),
        QuantityItem(name="skimming_area_sqm", value=quantities.skimming_area_sqm, unit="sqm", formula="non_tiled_interior_area * 0.95"),
        QuantityItem(name="ceiling_area_sqm", value=quantities.ceiling_area_sqm, unit="sqm", formula="ceiling_type != exposed ? effective_floor_area_sqm*1.03 : 0"),
        QuantityItem(name="interior_wall_paint_area_sqm", value=quantities.interior_wall_paint_area_sqm, unit="sqm", formula="skimming_area_sqm * 0.98"),
        QuantityItem(name="ceiling_paint_area_sqm", value=quantities.ceiling_paint_area_sqm, unit="sqm", formula="ceiling_area_sqm"),
        QuantityItem(name="exterior_wall_paint_area_sqm", value=quantities.exterior_wall_paint_area_sqm, unit="sqm", formula="external_wall_finish_area_sqm * 0.95"),
        QuantityItem(name="tile_adhesive_bags", value=float(quantities.tile_adhesive_bags), unit="bag", formula="ceil(total_tiled_area_sqm / 4.5)"),
        QuantityItem(name="grout_bags", value=float(quantities.grout_bags), unit="bag", formula="ceil(total_tiled_area_sqm / 8.0)"),
        QuantityItem(name="plaster_cement_bags", value=float(quantities.plaster_cement_bags), unit="bag", formula="ceil(((plaster_render_area_sqm*0.015*1.33)*(1/5)) / 0.035)"),
        QuantityItem(name="plaster_sand_tonnes", value=quantities.plaster_sand_tonnes, unit="tonne", formula="(plaster_render_area_sqm*0.015*1.33)*(4/5)*1.6"),
        QuantityItem(name="skim_coat_bags", value=float(quantities.skim_coat_bags), unit="bag", formula="ceil(skimming_area_sqm / 22.0)"),
        QuantityItem(name="primer_litres", value=quantities.primer_litres, unit="litre", formula="((interior_wall_paint_area_sqm + ceiling_paint_area_sqm) / 10.0) * 1.05"),
        QuantityItem(name="interior_paint_litres", value=quantities.interior_paint_litres, unit="litre", formula=f"(interior_wall_paint_area_sqm / 11.0) * ({2 if data.paint_system == 'standard_2_coat' else 3}) * 1.05"),
        QuantityItem(name="ceiling_paint_litres", value=quantities.ceiling_paint_litres, unit="litre", formula=f"(ceiling_paint_area_sqm / 12.0) * ({2 if data.paint_system == 'standard_2_coat' else 3}) * 1.05"),
        QuantityItem(name="exterior_paint_litres", value=quantities.exterior_paint_litres, unit="litre", formula=f"(exterior_wall_paint_area_sqm / 9.0) * ({2 if data.paint_system == 'standard_2_coat' else 3}) * 1.05"),
        QuantityItem(name="internal_doors_count", value=float(quantities.internal_doors_count), unit="count", formula="max(1, bedrooms + bathrooms + kitchens + living_rooms + dining_rooms + stores + other_rooms)"),
        QuantityItem(name="wardrobe_run_m", value=quantities.wardrobe_run_m, unit="m", formula="include_wardrobes ? ((master_bedrooms*3.2 + standard_bedrooms*2.4 + extra_room_storage*1.2) * 1.05) : 0"),
        QuantityItem(name="kitchen_base_cabinet_run_m", value=quantities.kitchen_base_cabinet_run_m, unit="m", formula="include_kitchen_cabinets ? kitchens * clamp(3.8 + effective_floor_area_sqm/180*1.4, 4.2, 5.8) : 0"),
        QuantityItem(name="kitchen_wall_cabinet_run_m", value=quantities.kitchen_wall_cabinet_run_m, unit="m", formula="kitchen_base_cabinet_run_m * 0.75"),
        QuantityItem(name="bathroom_cabinet_run_m", value=quantities.bathroom_cabinet_run_m, unit="m", formula="include_bathroom_cabinetry ? bathrooms * 1.1 : 0"),
        QuantityItem(name="store_cabinet_or_shelving_run_m", value=quantities.store_cabinet_or_shelving_run_m, unit="m", formula="include_store_cabinetry ? stores * 2.0 : 0"),
        QuantityItem(name="countertop_run_m", value=quantities.countertop_run_m, unit="m", formula="kitchen_base_cabinet_run_m * 0.95"),
        QuantityItem(name="board_equivalent_count", value=float(quantities.board_equivalent_count), unit="sheet", formula=f"ceil(total_cabinetry_run_m * ({2.20 if data.joinery_level == 'standard' else 2.45}))"),
        QuantityItem(name="joinery_fittings_sets", value=float(quantities.joinery_fittings_sets), unit="set", formula="ceil(total_cabinetry_run_m / 2.5)"),
        QuantityItem(name="effective_floor_area_sqm", value=resolved_inputs.effective_floor_area_sqm, unit="sqm", formula="shared_geometry.total_floor_area_sqm if available else finishes.floor_area_sqm"),
        QuantityItem(name="effective_storeys", value=float(resolved_inputs.effective_storeys), unit="count", formula="shared_geometry.storeys if available else finishes.storeys"),
        QuantityItem(name="effective_plan_perimeter_m", value=resolved_inputs.effective_plan_perimeter_m, unit="m", formula="shared_geometry.equivalent_plan_perimeter_m if available else equivalent square perimeter from floor area"),
        QuantityItem(name="room_count", value=float(quantities.room_count), unit="count", formula="bedrooms + bathrooms + kitchens + living_rooms + dining_rooms + stores + other_rooms, min 4"),
        QuantityItem(name="wet_rooms_count", value=float(quantities.wet_rooms_count), unit="count", formula="bathrooms + kitchens"),
        QuantityItem(name="storey_factor", value=quantities.storey_factor, unit="ratio", formula="1 + 0.10 * max(0, effective_storeys - 1)"),
        QuantityItem(name="openings_deduction_area_sqm", value=geometry.openings_deduction_area_sqm, unit="sqm", formula="external_openings_deduction + internal_openings_deduction"),
    ]


def quantify_finishes(
    data: FinishesInput,
    geometry: FinishesGeometryModel | None = None,
    resolved_inputs: FinishesResolvedInputs | None = None,
) -> FinishesQuantityModel:
    if resolved_inputs is None:
        fallback_storeys = max(1, int(data.storeys or 1))
        fallback_floor_area = max(float(data.floor_area_sqm or 1.0), 1.0)
        fallback_footprint = max(fallback_floor_area / fallback_storeys, 1.0)
        resolved_inputs = FinishesResolvedInputs(
            effective_floor_area_sqm=fallback_floor_area,
            effective_storeys=fallback_storeys,
            effective_plan_perimeter_m=4 * sqrt(fallback_footprint),
            used_geometry_floor_area=False,
            used_geometry_storeys=False,
            used_geometry_perimeter=False,
        )

    if geometry is None:
        geometry = derive_finishes_geometry(
            data=data,
            resolved_inputs=resolved_inputs,
        )

    return derive_finishes_quantities(
        data=data,
        geometry=geometry,
        resolved_inputs=resolved_inputs,
    )
