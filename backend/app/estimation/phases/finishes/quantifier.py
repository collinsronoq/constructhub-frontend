from math import ceil, sqrt

from app.estimation.schemas.finishes import FinishesInput, FinishesQuantities


def _estimate_room_count(data: FinishesInput) -> int:
    return max(
        4,
        data.bedrooms
        + data.bathrooms
        + data.kitchens
        + data.living_rooms
        + data.dining_rooms
        + data.other_rooms,
    )


def quantify_finishes(data: FinishesInput) -> FinishesQuantities:
    """
    Convert finishes selections and areas into material quantities.
    """

    # Basic derived geometry
    storeys = max(data.storeys, 1)
    footprint_per_storey = max(data.floor_area_sqm / storeys, 1)
    perimeter_m = 4 * sqrt(footprint_per_storey)
    room_count = _estimate_room_count(data)

    external_wall_area = perimeter_m * data.wall_height_m * storeys
    external_openings_area = max(external_wall_area * 0.18, room_count * 1.6)

    # Use room count plus building perimeter to approximate partition density.
    internal_partition_length_per_floor = (perimeter_m * 0.45) + (room_count * 3.0)
    internal_wall_area = internal_partition_length_per_floor * data.wall_height_m * 2 * storeys
    internal_door_openings_area = max(room_count - 1, 1) * 1.89 * storeys

    interior_wall_area = max(external_wall_area - external_openings_area, 0) + max(
        internal_wall_area - internal_door_openings_area,
        0,
    )
    
    # Floor areas
    main_floor_area = data.floor_area_sqm * 0.8
    wet_floor_area = data.floor_area_sqm * 0.2
    stairs_area = 0.04 * data.floor_area_sqm if data.storeys > 1 else 0

    main_floor_area *= 1.05  # waste
    wet_floor_area *= 1.08   # higher waste for cuts
    stairs_area *= 1.05

    # Wall tiling in wet areas
    wall_tile_area = 0
    if data.wet_wall_tiling:
        bathroom_wall_tile_area = data.bathrooms * max(10.0, data.wall_height_m * 5.5)
        kitchen_wall_tile_area = data.kitchens * 6.0
        wall_tile_area = (bathroom_wall_tile_area + kitchen_wall_tile_area) * 1.08
        wall_tile_area = min(wall_tile_area, interior_wall_area * 0.35)

    # Plaster / skim (non-tiled wall areas)
    plaster_area = max(interior_wall_area - wall_tile_area, 0) * 1.05

    # Ceilings
    ceiling_area = data.floor_area_sqm
    if data.ceiling_type != "exposed":
        ceiling_area *= 1.05
    else:
        ceiling_area = 0

    # Painting areas
    paint_wall_area = plaster_area
    paint_ceiling_area = ceiling_area
    paint_exterior_area = max(external_wall_area - external_openings_area, 0) * 1.05

    # Joinery and trims
    internal_doors = max(
        1,
        data.bedrooms
        + data.bathrooms
        + data.kitchens
        + data.living_rooms
        + data.dining_rooms
        + data.other_rooms,
    )

    skirting_m = perimeter_m * data.storeys if data.include_skirting else 0
    cornice_m = perimeter_m * data.storeys if data.include_cornices else 0

    wardrobes_m = data.bedrooms * 1.5 if data.include_wardrobes else 0
    kitchen_cabinets_m = data.kitchens * 6 if data.include_kitchen_cabinets else 0
    countertops_m = kitchen_cabinets_m

    # Consumables
    total_tiled_area = main_floor_area + wet_floor_area + stairs_area + wall_tile_area
    tile_adhesive_bags = ceil(total_tiled_area / 4.5)
    tile_grout_bags = ceil(total_tiled_area / 8)

    coats_wall = 2 if data.paint_system == "standard_2_coat" else 3
    coats_ceiling = 2 if data.paint_system == "standard_2_coat" else 3
    coats_exterior = 2

    primer_liters = (paint_wall_area + paint_ceiling_area) / 12
    paint_liters_interior = (paint_wall_area / 11) * coats_wall
    paint_liters_ceiling = (paint_ceiling_area / 12) * coats_ceiling
    paint_liters_exterior = (paint_exterior_area / 9) * coats_exterior

    return FinishesQuantities(
        main_floor_area_sqm=round(main_floor_area, 1),
        wet_floor_area_sqm=round(wet_floor_area, 1),
        stairs_area_sqm=round(stairs_area, 1),
        wall_tile_area_sqm=round(wall_tile_area, 1),
        plaster_area_sqm=round(plaster_area, 1),
        ceiling_area_sqm=round(ceiling_area, 1),
        paint_wall_area_sqm=round(paint_wall_area, 1),
        paint_ceiling_area_sqm=round(paint_ceiling_area, 1),
        paint_exterior_area_sqm=round(paint_exterior_area, 1),
        skirting_m=round(skirting_m, 1),
        cornice_m=round(cornice_m, 1),
        internal_doors=internal_doors,
        wardrobes_m=round(wardrobes_m, 1),
        kitchen_cabinets_m=round(kitchen_cabinets_m, 1),
        countertops_m=round(countertops_m, 1),
        tile_adhesive_bags=tile_adhesive_bags,
        tile_grout_bags=tile_grout_bags,
        primer_liters=round(primer_liters, 1),
        paint_liters_interior=round(paint_liters_interior, 1),
        paint_liters_ceiling=round(paint_liters_ceiling, 1),
        paint_liters_exterior=round(paint_liters_exterior, 1),
    )
