from __future__ import annotations

from app.estimation.base_materials.loader import load_base_materials
from app.estimation.common_schemas import CostItem
from app.estimation.logic.price_resolver import resolve_material_price
from app.estimation.phases.services_first_fix.schemas import ServicesFirstFixQuantityModel


def build_services_first_fix_material_items(
    quantities: ServicesFirstFixQuantityModel,
    vendor_prices: dict | None = None,
) -> list[CostItem]:
    base_prices = load_base_materials().get("services_first_fix_materials", {})
    vendor_prices = vendor_prices or {}
    items: list[CostItem] = []

    def add_item(key: str, item_code: str, description: str, quantity: float, unit: str) -> None:
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

    add_item("pvc_conduit", "pvc_electrical_conduit", "PVC Electrical Conduit", quantities.conduit_length_m, "m")
    add_item("cable_lighting", "lighting_cable", "Lighting Cable", quantities.lighting_cable_length_m, "m")
    add_item("cable_power", "power_cable_sockets", "Power Cable (Sockets)", quantities.power_cable_length_m, "m")
    add_item("junction_box", "junction_boxes", "Junction Boxes", float(quantities.junction_boxes_count), "pcs")

    add_item("ppr_cold", "cold_water_ppr_pipe", "Cold Water PPR Pipe", quantities.cold_water_pipe_length_m, "m")
    if quantities.hot_water_pipe_length_m > 0:
        add_item("ppr_hot", "hot_water_ppr_pipe", "Hot Water PPR Pipe", quantities.hot_water_pipe_length_m, "m")

    add_item("pvc_waste", "pvc_waste_drain_pipe", "PVC Waste/Drain Pipe", quantities.waste_pipe_length_m, "m")
    if quantities.earthing_rods_count > 0:
        add_item("earthing_rod", "earthing_rod_clamp", "Earthing Rod & Clamp", float(quantities.earthing_rods_count), "set")

    return items

