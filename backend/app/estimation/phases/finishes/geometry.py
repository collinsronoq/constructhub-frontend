from __future__ import annotations

from app.estimation.phases.finishes.schemas import (
    FinishesGeometryModel,
    FinishesInput,
    FinishesResolvedInputs,
)


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(value, high))


def _resolve_master_bedrooms(data: FinishesInput) -> int:
    if data.master_bedrooms > 0:
        return min(data.master_bedrooms, data.bedrooms)
    if data.bedrooms >= 3:
        return 1
    return 0


def derive_finishes_geometry(
    data: FinishesInput,
    resolved_inputs: FinishesResolvedInputs,
) -> FinishesGeometryModel:
    """
    Derive finish-specific geometry from shared geometry context + room program.
    """

    floor_area_sqm = max(resolved_inputs.effective_floor_area_sqm, 1.0)
    storeys = max(resolved_inputs.effective_storeys, 1)
    perimeter_m = max(resolved_inputs.effective_plan_perimeter_m, 4.0)
    wall_height_m = max(data.wall_height_m, 2.4)

    room_count = max(
        4,
        data.bedrooms
        + data.bathrooms
        + data.kitchens
        + data.living_rooms
        + data.dining_rooms
        + data.other_rooms
        + data.stores,
    )
    wet_rooms = data.bathrooms + data.kitchens
    non_wet_rooms = max(room_count - wet_rooms, 1)

    # surface area was already calculated in the global geometry

    # Shared perimeter and storeys anchor wall-area calculations.
    external_wall_gross_area = perimeter_m * wall_height_m * storeys
    external_openings_deduction = max(external_wall_gross_area * 0.16, room_count * 1.8)
    external_wall_finish_area = max(external_wall_gross_area - external_openings_deduction, 0.0)

    # Partition density remains heuristic but is room-program aware and explicit.
    partition_length_per_floor_m = (perimeter_m * 0.58) + (max(room_count - 2, 0) * 3.6)
    internal_wall_gross_area = partition_length_per_floor_m * wall_height_m * 2 * storeys
    internal_openings_deduction = max(room_count - 1, 1) * 1.95 * storeys
    internal_wall_finish_area = max(internal_wall_gross_area - internal_openings_deduction, 0.0)

    interior_wall_finish_area = internal_wall_finish_area + external_wall_finish_area
    total_openings_deduction = external_openings_deduction + internal_openings_deduction

    # Wet area uses room-driven demand with practical limits to avoid extreme ratios.
    # Wet finish demand is room-driven but clamped so unusual room mixes do not
    # collapse or dominate total floor finishes unrealistically.
    wet_area_raw = (data.bathrooms * 5.5) + (data.kitchens * 6.5) + (data.stores * 1.5)
    wet_floor_finish_area = _clamp(wet_area_raw, floor_area_sqm * 0.14, floor_area_sqm * 0.32)
    stair_finish_area = (floor_area_sqm * 0.035) if storeys > 1 else 0.0
    main_floor_finish_area = max(floor_area_sqm - wet_floor_finish_area - stair_finish_area, floor_area_sqm * 0.55)

    wall_tile_area = 0.0
    if data.wet_wall_tiling:
        bathroom_wall_tile_area = data.bathrooms * max(13.5, wall_height_m * 6.2)
        kitchen_splashback_area = data.kitchens * 5.5
        wall_tile_area = (bathroom_wall_tile_area + kitchen_splashback_area) * 1.07
        wall_tile_area = min(wall_tile_area, interior_wall_finish_area * 0.42)

    non_tiled_interior_area = max(interior_wall_finish_area - wall_tile_area, 0.0)
    plaster_render_area = (non_tiled_interior_area * 0.55) + (external_wall_finish_area * 0.90)
    skimming_area = non_tiled_interior_area * 0.95

    ceiling_area = 0.0
    if data.ceiling_type != "exposed":
        ceiling_area = floor_area_sqm * 1.03

    interior_wall_paint_area = skimming_area * 0.98
    ceiling_paint_area = ceiling_area
    exterior_wall_paint_area = external_wall_finish_area * 0.95

    skirting_run_m = (perimeter_m * storeys * 1.02) if data.include_skirting else 0.0
    cornice_run_m = (perimeter_m * storeys * 1.02) if data.include_cornices else 0.0

    internal_doors_count = max(
        1,
        data.bedrooms
        + data.bathrooms
        + data.kitchens
        + data.living_rooms
        + data.dining_rooms
        + data.other_rooms
        + data.stores,
    )

    master_bedrooms = _resolve_master_bedrooms(data)
    standard_bedrooms = max(data.bedrooms - master_bedrooms, 0)

    # Joinery design quantities (run-length layer) are converted to board/material
    # quantities later in quantifier/materials.
    wardrobe_run_m = 0.0
    if data.include_wardrobes:
        wardrobe_run_m = (
            (master_bedrooms * 3.2)
            + (standard_bedrooms * 2.4)
            + (max(data.other_rooms - data.stores, 0) * 1.2)
        ) * 1.05

    kitchen_base_cabinet_run_m = 0.0
    kitchen_wall_cabinet_run_m = 0.0
    countertop_run_m = 0.0
    if data.include_kitchen_cabinets and data.kitchens > 0:
        base_run_per_kitchen = _clamp(3.8 + (floor_area_sqm / 180.0) * 1.4, 4.2, 5.8)
        kitchen_base_cabinet_run_m = data.kitchens * base_run_per_kitchen
        kitchen_wall_cabinet_run_m = kitchen_base_cabinet_run_m * 0.75
        countertop_run_m = kitchen_base_cabinet_run_m * 0.95

    bathroom_cabinet_run_m = 0.0
    if data.include_bathroom_cabinetry and data.bathrooms > 0:
        bathroom_cabinet_run_m = data.bathrooms * 1.1

    store_cabinet_or_shelving_run_m = 0.0
    if data.include_store_cabinetry and data.stores > 0:
        store_cabinet_or_shelving_run_m = data.stores * 2.0

    total_cabinetry_run_m = (
        wardrobe_run_m
        + kitchen_base_cabinet_run_m
        + kitchen_wall_cabinet_run_m
        + bathroom_cabinet_run_m
        + store_cabinet_or_shelving_run_m
    )

    return FinishesGeometryModel(
        room_count=room_count,
        wet_rooms_count=wet_rooms,
        non_wet_rooms_count=non_wet_rooms,
        external_wall_finish_area_sqm=round(external_wall_finish_area, 1),
        interior_wall_finish_area_sqm=round(interior_wall_finish_area, 1),
        openings_deduction_area_sqm=round(total_openings_deduction, 1),
        main_floor_finish_area_sqm=round(main_floor_finish_area, 1),
        wet_floor_finish_area_sqm=round(wet_floor_finish_area, 1),
        stair_finish_area_sqm=round(stair_finish_area, 1),
        wall_tile_area_sqm=round(wall_tile_area, 1),
        plaster_render_area_sqm=round(plaster_render_area, 1),
        skimming_area_sqm=round(skimming_area, 1),
        ceiling_area_sqm=round(ceiling_area, 1),
        interior_wall_paint_area_sqm=round(interior_wall_paint_area, 1),
        ceiling_paint_area_sqm=round(ceiling_paint_area, 1),
        exterior_wall_paint_area_sqm=round(exterior_wall_paint_area, 1),
        skirting_run_m=round(skirting_run_m, 1),
        cornice_run_m=round(cornice_run_m, 1),
        internal_doors_count=internal_doors_count,
        wardrobe_run_m=round(wardrobe_run_m, 1),
        kitchen_base_cabinet_run_m=round(kitchen_base_cabinet_run_m, 1),
        kitchen_wall_cabinet_run_m=round(kitchen_wall_cabinet_run_m, 1),
        bathroom_cabinet_run_m=round(bathroom_cabinet_run_m, 1),
        store_cabinet_or_shelving_run_m=round(store_cabinet_or_shelving_run_m, 1),
        countertop_run_m=round(countertop_run_m, 1),
        total_cabinetry_run_m=round(total_cabinetry_run_m, 1),
    )
