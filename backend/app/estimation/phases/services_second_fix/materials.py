from __future__ import annotations

from app.estimation.base_materials.loader import load_base_materials
from app.estimation.common_schemas import CostItem
from app.estimation.logic.price_resolver import resolve_material_price
from app.estimation.phases.services_second_fix.schemas import ServicesSecondFixQuantityModel


def build_services_second_fix_material_items(
    quantities: ServicesSecondFixQuantityModel,
    vendor_prices: dict | None = None,
) -> list[CostItem]:
    base_prices = load_base_materials().get("services_second_fix_materials", {})
    vendor_prices = vendor_prices or {}
    items: list[CostItem] = []

    def add_item(
        key: str,
        item_code: str,
        description: str,
        quantity: float,
        unit: str = "pcs",
    ) -> None:
        unit_rate = resolve_material_price(
            material_key=key,
            variant=None,
            base_prices=base_prices,
            vendor_price=vendor_prices.get(key),
        )
        items.append(
            CostItem(
                item_code=item_code,
                description=description,
                unit=unit,
                quantity=quantity,
                unit_rate=unit_rate,
                total=round(quantity * unit_rate),
                category="material",
                source="vendor" if vendor_prices.get(key) is not None else "rate_table",
                confidence="medium",
            )
        )

    add_item("switch", "switches", "Switches", float(quantities.switches_count))
    add_item("socket", "socket_outlets", "Sockets", float(quantities.sockets_count))
    add_item("light_fitting", "light_fittings", "Light Fittings", float(quantities.light_fittings_count))
    add_item("toilet_set", "toilet_sets", "Toilet Sets", float(quantities.toilet_sets_count))
    add_item("basin", "wash_basins", "Wash Basins", float(quantities.basins_count))
    add_item("kitchen_sink", "kitchen_sinks", "Kitchen Sinks", float(quantities.kitchen_sinks_count))

    if quantities.shower_mixers_count > 0:
        add_item("shower_mixer", "shower_mixers", "Shower Mixers", float(quantities.shower_mixers_count))
    if quantities.instant_showers_count > 0:
        add_item("instant_shower", "instant_showers", "Instant Showers", float(quantities.instant_showers_count))

    return items

