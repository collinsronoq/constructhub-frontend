from __future__ import annotations

from app.estimation.base_materials.loader import load_base_materials
from app.estimation.common_schemas import CostItem
from app.estimation.logic.price_resolver import resolve_material_price
from app.estimation.phases.roofing.schemas import RoofingInput, RoofingQuantityModel


def build_roofing_material_items(
    data: RoofingInput,
    quantities: RoofingQuantityModel,
    vendor_prices: dict | None = None,
) -> list[CostItem]:
    # Base rates come from static estimator tables; vendor prices can override per key.
    base_prices = load_base_materials().get("roofing_materials", {})
    vendor_prices = vendor_prices or {}

    materials: list[CostItem] = []

    sheet_variant_map = {
        "corrugated_mabati": "mabati",
        "box_profile_mabati": "mabati",
        "stone_coated_tiles": "tile",
        "clay_tiles": "tile",
    }

    if data.roof_type == "flat":
        concrete_price = resolve_material_price(
            "concrete_m3",
            None,
            base_prices,
            vendor_prices.get("concrete_m3"),
        )
        steel_price = resolve_material_price(
            "reinforcement",
            None,
            base_prices,
            vendor_prices.get("reinforcement"),
        )
        formwork_price = resolve_material_price(
            "formwork",
            None,
            base_prices,
            vendor_prices.get("formwork"),
        )
        waterproof_price = resolve_material_price(
            "waterproofing",
            None,
            base_prices,
            vendor_prices.get("waterproofing"),
        )

        materials.extend(
            [
                CostItem(
                    item_code="roof_slab_concrete",
                    description="Roof slab concrete",
                    unit="m3",
                    quantity=quantities.concrete_volume_m3,
                    unit_rate=concrete_price,
                    total=round(quantities.concrete_volume_m3 * concrete_price),
                    category="material",
                    source="vendor" if vendor_prices.get("concrete_m3") else "rate_table",
                    confidence="medium",
                ),
                CostItem(
                    item_code="roof_slab_reinforcement",
                    description="Roof slab reinforcement steel",
                    unit="kg",
                    quantity=quantities.reinforcement_kg,
                    unit_rate=steel_price,
                    total=round(quantities.reinforcement_kg * steel_price),
                    category="material",
                    source="vendor" if vendor_prices.get("reinforcement") else "rate_table",
                    confidence="medium",
                ),
                CostItem(
                    item_code="roof_slab_formwork",
                    description="Roof slab formwork",
                    unit="sqm",
                    quantity=quantities.formwork_sqm,
                    unit_rate=formwork_price,
                    total=round(quantities.formwork_sqm * formwork_price),
                    category="material",
                    source="vendor" if vendor_prices.get("formwork") else "rate_table",
                    confidence="medium",
                ),
                CostItem(
                    item_code="roof_waterproofing_membrane",
                    description="Roof waterproofing membrane",
                    unit="sqm",
                    quantity=quantities.waterproofing_sqm,
                    unit_rate=waterproof_price,
                    total=round(quantities.waterproofing_sqm * waterproof_price),
                    category="material",
                    source="vendor" if vendor_prices.get("waterproofing") else "rate_table",
                    confidence="medium",
                ),
            ]
        )
        return materials

    sheet_variant = sheet_variant_map.get(data.roof_covering, None)
    sheet_price = resolve_material_price(
        "roofing_sheet",
        sheet_variant,
        base_prices,
        vendor_prices.get("roofing_sheet"),
    )
    timber_price = resolve_material_price(
        "timber",
        None,
        base_prices,
        vendor_prices.get("timber"),
    )
    nails_price = resolve_material_price(
        "nails",
        None,
        base_prices,
        vendor_prices.get("nails"),
    )

    materials.extend(
        [
            CostItem(
                item_code=f"{data.roof_covering}",
                description=f"{data.roof_covering.replace('_', ' ').title()}",
                unit="sqm",
                quantity=quantities.roof_covering_area_sqm,
                unit_rate=sheet_price,
                total=round(quantities.roof_covering_area_sqm * sheet_price),
                category="material",
                source="vendor" if vendor_prices.get("roofing_sheet") else "rate_table",
                confidence="medium",
            ),
            CostItem(
                item_code="roof_timber",
                # Timber is currently priced as a bulk structural volume allowance.
                description="Structural roofing timber allowance (bulk volume)",
                unit="m3",
                quantity=quantities.timber_cubic_m,
                unit_rate=timber_price,
                total=round(quantities.timber_cubic_m * timber_price),
                category="material",
                source="vendor" if vendor_prices.get("timber") else "rate_table",
                confidence="medium",
            ),
            CostItem(
                item_code="roofing_nails",
                description="Roofing nails",
                unit="kg",
                quantity=quantities.nails_kg,
                unit_rate=nails_price,
                total=round(quantities.nails_kg * nails_price),
                category="material",
                source="vendor" if vendor_prices.get("nails") else "rate_table",
                confidence="medium",
            ),
        ]
    )

    if quantities.ridge_length_m > 0:
        ridge_price = resolve_material_price(
            "ridge_cap",
            None,
            base_prices,
            vendor_prices.get("ridge_cap"),
        )
        materials.append(
            CostItem(
                item_code="ridge_caps",
                description="Ridge caps",
                unit="m",
                quantity=quantities.ridge_length_m,
                unit_rate=ridge_price,
                total=round(quantities.ridge_length_m * ridge_price),
                category="material",
                source="vendor" if vendor_prices.get("ridge_cap") else "rate_table",
                confidence="medium",
            )
        )

    return materials
