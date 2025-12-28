from app.estimation.common_schemas import MaterialCost, PhaseEstimate, PhaseTotals
from app.estimation.base_materials.loader import load_base_materials
from app.estimation.logic.price_resolver import resolve_material_price
from app.estimation.schemas.finishes import FinishesInput, FinishesQuantities


QUALITY_FACTOR = {
    "standard": 1.0,
    "premium": 1.12,
    "luxury": 1.25,
}

JOINERY_FACTOR = {
    "standard": 1.0,
    "premium": 1.15,
}


def price_finishes_materials(
    data: FinishesInput,
    quantities: FinishesQuantities,
    vendor_prices: dict | None = None,
) -> PhaseEstimate:
    """
    Price finishes materials using base or vendor overrides.
    """

    base_dict = load_base_materials()
    finishes_prices = base_dict.get("finishes_materials", {})
    vendor_block = (vendor_prices or {}).get("finishes_materials", {})

    quality_factor = QUALITY_FACTOR.get(data.quality_level, 1.0)
    joinery_factor = JOINERY_FACTOR.get(data.joinery_level, 1.0)

    materials: list[MaterialCost] = []

    def add_item(key: str, name: str, quantity: float, unit: str, apply_quality: bool = True, apply_joinery: bool = False):
        if quantity <= 0:
            return
        unit_cost = resolve_material_price(
            material_key=key,
            variant=None,
            base_prices=finishes_prices,
            vendor_price=vendor_block.get(key),
        )
        if apply_quality:
            unit_cost *= quality_factor
        if apply_joinery:
            unit_cost *= joinery_factor

        materials.append(
            MaterialCost(
                name=name,
                quantity=quantity,
                unit=unit,
                unit_cost=unit_cost,
                total=round(quantity * unit_cost),
            )
        )

    # Floor finishes
    main_finish_key = {
        "tile": "floor_tile_main",
        "laminate": "laminate_floor",
        "parquet": "parquet_floor",
        "polished_screed": "polished_screed",
    }[data.main_floor_finish]
    add_item(main_finish_key, "Main Floor Finish", quantities.main_floor_area_sqm, "sqm")

    wet_finish_key = {
        "ceramic_tile": "floor_tile_wet_ceramic",
        "porcelain_tile": "floor_tile_wet_porcelain",
    }[data.wet_floor_finish]
    add_item(wet_finish_key, "Wet Area Floor Finish", quantities.wet_floor_area_sqm, "sqm")

    if quantities.stairs_area_sqm > 0:
        add_item(main_finish_key, "Stair Finish", quantities.stairs_area_sqm, "sqm")

    # Wall tiling
    add_item("wall_tile", "Wall Tiles", quantities.wall_tile_area_sqm, "sqm")

    # Plaster / skim
    add_item("plaster_mortar", "Plaster/Skim Coat", quantities.plaster_area_sqm, "sqm")

    # Ceilings
    if data.ceiling_type != "exposed":
        ceiling_key = {
            "gypsum_board": "gypsum_board",
            "acoustic_board": "acoustic_board",
            "tng": "tng_board",
        }.get(data.ceiling_type, "gypsum_board")
        add_item(ceiling_key, "Ceiling Boards", quantities.ceiling_area_sqm, "sqm")
        add_item("ceiling_frame", "Ceiling Framing", quantities.ceiling_area_sqm, "sqm")

    # Trims
    add_item("skirting", "Skirting", quantities.skirting_m, "m")
    add_item("cornice", "Cornice", quantities.cornice_m, "m")

    # Joinery
    add_item("door_internal_set", "Internal Doors (set)", quantities.internal_doors, "pcs", apply_joinery=True)
    add_item("wardrobe_per_m", "Wardrobes", quantities.wardrobes_m, "m", apply_joinery=True)
    add_item("kitchen_cabinet_per_m", "Kitchen Cabinets", quantities.kitchen_cabinets_m, "m", apply_joinery=True)
    add_item("countertop_per_m", "Countertops", quantities.countertops_m, "m", apply_joinery=True)

    # Tile consumables
    add_item("tile_adhesive_bag", "Tile Adhesive", quantities.tile_adhesive_bags, "bag")
    add_item("tile_grout_bag", "Tile Grout", quantities.tile_grout_bags, "bag")

    # Paint & primer
    add_item("primer", "Primer/Undercoat", quantities.primer_liters, "litre")
    add_item("paint_interior", "Interior Paint", quantities.paint_liters_interior, "litre")
    add_item("paint_ceiling", "Ceiling Paint", quantities.paint_liters_ceiling, "litre")
    add_item("paint_exterior", "Exterior Paint", quantities.paint_liters_exterior, "litre")

    material_total = sum(m.total for m in materials)

    totals = PhaseTotals(
        materials=material_total,
        labour=0,
        other=0,
        phase_total=material_total,
    )

    return PhaseEstimate(
        phase="finishes",
        materials=materials,
        labour=[],
        other_costs=[],
        totals=totals,
    )
