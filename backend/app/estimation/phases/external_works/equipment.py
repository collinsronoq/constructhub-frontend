from __future__ import annotations

from math import ceil

from app.estimation.base_materials.loader import load_base_materials
from app.estimation.common_schemas import CostItem
from app.estimation.phases.external_works.schemas import ExternalWorksInput, ExternalWorksQuantityModel


DEFAULT_EQUIPMENT_RATES = {
    "mini_excavator_day": 18000.0,
    "plate_compactor_day": 6500.0,
    "concrete_mixer_day": 4500.0,
    "fencing_tools_day": 2500.0,
}


def build_external_works_equipment_items(
    data: ExternalWorksInput,
    quantities: ExternalWorksQuantityModel,
    vendor_prices: dict | None = None,
) -> list[CostItem]:
    base_dict = load_base_materials()
    equipment_rates = (base_dict if isinstance(base_dict, dict) else base_dict.model_dump()).get("external_works_equipment", {})
    vendor_block = (vendor_prices or {}).get("external_works_equipment", {})

    items: list[CostItem] = []

    def resolve_rate(key: str) -> tuple[float, str]:
        if vendor_block.get(key) is not None:
            return float(vendor_block[key]), "vendor"
        if key in equipment_rates:
            entry = equipment_rates[key]
            if isinstance(entry, dict):
                return float(entry.get("price", DEFAULT_EQUIPMENT_RATES.get(key, 0.0))), "rate_table"
            return float(entry), "rate_table"
        return float(DEFAULT_EQUIPMENT_RATES.get(key, 0.0)), "assumed"

    def add_item(item_code: str, description: str, quantity: float, unit: str, rate_key: str) -> None:
        if quantity <= 0:
            return
        unit_rate, source = resolve_rate(rate_key)
        if unit_rate <= 0:
            return
        items.append(
            CostItem(
                item_code=item_code,
                description=description,
                unit=unit,
                quantity=float(quantity),
                unit_rate=round(unit_rate, 2),
                total=round(quantity * unit_rate),
                category="equipment",
                source=source,  # type: ignore[arg-type]
                confidence="medium",
            )
        )

    # Paving compaction plant
    if quantities.paving_area_sqm > 0:
        compactor_days = ceil(quantities.paving_area_sqm / 120.0)
        add_item("plate_compactor_hire", "Plate Compactor Hire", float(compactor_days), "day", "plate_compactor_day")

    # Drainage / sewer trenching plant
    if quantities.excavation_scope_m > 0:
        excavator_days = ceil(quantities.excavation_scope_m / 90.0)
        if data.sewerage_system in {"septic_tank", "biodigester"}:
            excavator_days = max(excavator_days, 1)
        add_item("mini_excavator_hire", "Mini Excavator Hire", float(excavator_days), "day", "mini_excavator_day")

    # Concrete/masonry support plant
    if quantities.concrete_scope_m3 > 0:
        mixer_days = ceil(quantities.concrete_scope_m3 / 3.5)
        add_item("concrete_mixer_hire", "Concrete Mixer Hire", float(mixer_days), "day", "concrete_mixer_day")

    # Fence/razor-wire installation tools
    fence_scope_length = max(quantities.boundary_wall_length_m, quantities.razor_wire_length_m)
    if data.perimeter_wall_enabled and fence_scope_length > 0 and data.perimeter_wall_type in {"chain_link", "precast"}:
        fence_tools_days = ceil(fence_scope_length / 100.0)
        add_item("fencing_tools_hire", "Fencing Tools & Plant Allowance", float(fence_tools_days), "day", "fencing_tools_day")

    return items

