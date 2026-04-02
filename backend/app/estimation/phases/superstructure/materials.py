from __future__ import annotations

from app.estimation.base_materials.loader import load_base_materials
from app.estimation.common_schemas import CostItem
from app.estimation.logic.price_resolver import resolve_material_price
from app.estimation.phases.superstructure.schemas import (
    SuperstructureInput,
    SuperstructureQuantityModel,
)


def build_material_items(
    data: SuperstructureInput,
    quantity_model: SuperstructureQuantityModel,
    vendor_prices: dict | None = None,
) -> list[CostItem]:
    base_prices = load_base_materials().get("superstructure_materials", {})
    if not base_prices:
        raise ValueError("Base prices for superstructure (superstructure_materials) not found.")
    vendor_prices = vendor_prices or {}

    def get_price(key: str, variant: str | None = None, vendor_key: str | None = None) -> float:
        vp = vendor_prices.get(vendor_key or key)
        return resolve_material_price(
            material_key=key,
            variant=variant,
            base_prices=base_prices,
            vendor_price=vp,
        )

    block_price = get_price("blockwork", variant=data.blockwork_type, vendor_key="blockwork")
    cement_price = get_price("cement")
    sand_price = get_price("sand")
    ballast_price = get_price("ballast")
    steel_price = get_price("reinforcement")

    return [
        CostItem(
            item_code="blockwork_units",
            description=f"{data.blockwork_type.replace('_', ' ').title()} masonry units",
            unit="piece",
            quantity=float(quantity_model.block_count),
            unit_rate=block_price,
            total=round(quantity_model.block_count * block_price),
            category="material",
            source="vendor" if vendor_prices.get("blockwork") else "rate_table",
            confidence="medium",
        ),
        CostItem(
            item_code="cement_for_mortar",
            description="Cement for masonry mortar (derived from 1:4 mix)",
            unit="bag",
            quantity=round(quantity_model.mortar_cement_bags, 1),
            unit_rate=cement_price,
            total=round(quantity_model.mortar_cement_bags * cement_price),
            category="material",
            source="vendor" if vendor_prices.get("cement") else "rate_table",
            confidence="medium",
        ),
        CostItem(
            item_code="sand_for_mortar",
            description="Sand for masonry mortar (derived from 1:4 mix)",
            unit="ton",
            quantity=round(quantity_model.mortar_sand_tons, 2),
            unit_rate=sand_price,
            total=round(quantity_model.mortar_sand_tons * sand_price),
            category="material",
            source="vendor" if vendor_prices.get("sand") else "rate_table",
            confidence="medium",
        ),
        CostItem(
            item_code="cement_for_concrete",
            description="Cement for RC concrete (columns/beams/slab)",
            unit="bag",
            quantity=round(quantity_model.concrete_cement_bags, 1),
            unit_rate=cement_price,
            total=round(quantity_model.concrete_cement_bags * cement_price),
            category="material",
            source="vendor" if vendor_prices.get("cement") else "rate_table",
            confidence="medium",
        ),
        CostItem(
            item_code="sand_for_concrete",
            description="Sand for RC concrete",
            unit="ton",
            quantity=round(quantity_model.concrete_sand_tons, 2),
            unit_rate=sand_price,
            total=round(quantity_model.concrete_sand_tons * sand_price),
            category="material",
            source="vendor" if vendor_prices.get("sand") else "rate_table",
            confidence="medium",
        ),
        CostItem(
            item_code="ballast_for_concrete",
            description="Ballast for RC concrete",
            unit="ton",
            quantity=round(quantity_model.concrete_ballast_tons, 2),
            unit_rate=ballast_price,
            total=round(quantity_model.concrete_ballast_tons * ballast_price),
            category="material",
            source="vendor" if vendor_prices.get("ballast") else "rate_table",
            confidence="medium",
        ),
        CostItem(
            item_code="reinforcement_steel",
            description="Reinforcement steel for beams/columns/slab",
            unit="kg",
            quantity=round(quantity_model.rebar_weight_kg, 1),
            unit_rate=steel_price,
            total=round(quantity_model.rebar_weight_kg * steel_price),
            category="material",
            source="vendor" if vendor_prices.get("reinforcement") else "rate_table",
            confidence="medium",
        ),
    ]
