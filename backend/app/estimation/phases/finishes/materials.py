from __future__ import annotations

from app.estimation.base_materials.loader import load_base_materials
from app.estimation.common_schemas import CostItem
from app.estimation.logic.price_resolver import resolve_material_price
from app.estimation.phases.finishes.schemas import FinishesInput, FinishesQuantityModel


QUALITY_FACTOR = {
    "standard": 1.0,
    "premium": 1.12,
    "luxury": 1.25,
}

JOINERY_FACTOR = {
    "standard": 1.0,
    "premium": 1.15,
}


def build_finishes_material_items(
    data: FinishesInput,
    quantities: FinishesQuantityModel,
    vendor_prices: dict | None = None,
) -> list[CostItem]:
    base_dict = load_base_materials()
    finishes_prices = base_dict.get("finishes_materials", {})
    superstructure_prices = base_dict.get("superstructure_materials", {})
    vendor_block = (vendor_prices or {}).get("finishes_materials", {})

    quality_factor = QUALITY_FACTOR.get(data.quality_level, 1.0)
    joinery_factor = JOINERY_FACTOR.get(data.joinery_level, 1.0)

    items: list[CostItem] = []

    def resolve_rate(key: str, fallback_price: float | None = None) -> tuple[float, str]:
        # Rate precedence: vendor override -> finishes rate table -> shared fallback table.
        if vendor_block.get(key) is not None:
            return float(vendor_block[key]), "vendor"

        if key in finishes_prices:
            return float(
                resolve_material_price(
                    material_key=key,
                    variant=None,
                    base_prices=finishes_prices,
                    vendor_price=None,
                )
            ), "rate_table"

        if key in superstructure_prices:
            return float(
                resolve_material_price(
                    material_key=key,
                    variant=None,
                    base_prices=superstructure_prices,
                    vendor_price=None,
                )
            ), "rate_table"

        if fallback_price is None:
            raise ValueError(f"Material rate for '{key}' is missing from finishes/superstructure base rates.")
        return float(fallback_price), "assumed"

    def add_item(
        key: str,
        item_code: str,
        description: str,
        quantity: float,
        unit: str,
        apply_quality: bool = True,
        apply_joinery: bool = False,
        fallback_price: float | None = None,
    ) -> None:
        if quantity <= 0:
            return

        unit_rate, source = resolve_rate(key=key, fallback_price=fallback_price)

        if apply_quality:
            unit_rate *= quality_factor
        if apply_joinery:
            unit_rate *= joinery_factor

        items.append(
            CostItem(
                item_code=item_code,
                description=description,
                unit=unit,
                quantity=float(quantity),
                unit_rate=round(unit_rate, 2),
                total=round(quantity * unit_rate),
                category="material",
                source=source,  # type: ignore[arg-type]
                confidence="medium",
            )
        )

    main_finish_key = {
        "tile": "floor_tile_main",
        "laminate": "laminate_floor",
        "parquet": "parquet_floor",
        "polished_screed": "polished_screed",
    }[data.main_floor_finish]
    add_item(main_finish_key, "main_floor_finish", "Main Floor Finish", quantities.main_floor_finish_area_sqm, "sqm")

    wet_finish_key = {
        "ceramic_tile": "floor_tile_wet_ceramic",
        "porcelain_tile": "floor_tile_wet_porcelain",
    }[data.wet_floor_finish]
    add_item(wet_finish_key, "wet_floor_finish", "Wet Area Floor Finish", quantities.wet_floor_finish_area_sqm, "sqm")

    if quantities.stair_finish_area_sqm > 0:
        add_item(main_finish_key, "stair_finish", "Stair Finish", quantities.stair_finish_area_sqm, "sqm")

    add_item("wall_tile", "wet_wall_tiles", "Wet-Area Wall Tiles", quantities.wall_tile_area_sqm, "sqm")
    add_item("tile_adhesive_bag", "tile_adhesive", "Tile Adhesive", float(quantities.tile_adhesive_bags), "bag")
    add_item("tile_grout_bag", "tile_grout", "Tile Grout", float(quantities.grout_bags), "bag")

    add_item("cement_bag", "plaster_cement_bags", "Cement for Plaster/Render", float(quantities.plaster_cement_bags), "bag", apply_quality=False)
    add_item("sand_tonne", "plaster_sand_tonnes", "Sand for Plaster/Render", quantities.plaster_sand_tonnes, "tonne", apply_quality=False)
    add_item("skim_coat_bag", "skim_coat_bags", "Skim Coat Bags", float(quantities.skim_coat_bags), "bag")

    if data.ceiling_type != "exposed":
        ceiling_key = {
            "gypsum_board": "gypsum_board",
            "acoustic_board": "acoustic_board",
            "tng": "tng_board",
        }.get(data.ceiling_type, "gypsum_board")
        add_item(ceiling_key, "ceiling_boards", "Ceiling Boards", quantities.ceiling_area_sqm, "sqm")
        add_item("ceiling_frame", "ceiling_framing", "Ceiling Framing", quantities.ceiling_area_sqm, "sqm")

    add_item("primer", "paint_primer", "Primer/Undercoat", quantities.primer_litres, "litre")
    add_item("paint_interior", "interior_wall_paint", "Interior Wall Paint", quantities.interior_paint_litres, "litre")
    add_item("paint_ceiling", "ceiling_paint", "Ceiling Paint", quantities.ceiling_paint_litres, "litre")
    add_item("paint_exterior", "exterior_paint", "Exterior Wall Paint", quantities.exterior_paint_litres, "litre")

    add_item("skirting", "skirting_run", "Skirting", quantities.skirting_run_m, "m", apply_quality=False)
    add_item("cornice", "cornice_run", "Cornice", quantities.cornice_run_m, "m")
    add_item("door_internal_set", "internal_doors", "Internal Doors (Set)", float(quantities.internal_doors_count), "pcs", apply_joinery=True)

    add_item("joinery_board_sheet", "joinery_board_sheets", "Joinery Board Sheet Equivalent", float(quantities.board_equivalent_count), "sheet", apply_joinery=True)
    add_item("joinery_fittings_set", "joinery_fittings", "Joinery Fittings Allowance", float(quantities.joinery_fittings_sets), "set", apply_joinery=True)
    add_item("countertop_per_m", "countertop_run", "Countertops", quantities.countertop_run_m, "m", apply_joinery=True)

    return items
