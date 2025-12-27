from app.estimation.common_schemas import MaterialCost, PhaseEstimate, PhaseTotals
from app.estimation.logic.price_resolver import resolve_material_price
from app.estimation.base_materials.loader import load_base_materials
from app.estimation.schemas.services_1 import ServicesFirstFixQuantities


def price_services_first_fix_materials(
    quantities: ServicesFirstFixQuantities,
    vendor_prices: dict | None = None,
) -> PhaseEstimate:
    """
    Price first-fix materials using base or vendor overrides.
    """

    base_prices = load_base_materials()
    vendor_prices = vendor_prices or {}

    materials: list[MaterialCost] = []

    def add_item(key: str, name: str, quantity: float, unit: str):
        unit_cost = resolve_material_price(
            material_key=key,
            variant=None,
            base_prices=base_prices,
            vendor_price=vendor_prices.get(key),
        )
        materials.append(
            MaterialCost(
                name=name,
                quantity=quantity,
                unit=unit,
                unit_cost=unit_cost,
                total=round(quantity * unit_cost),
            )
        )

    add_item("pvc_conduit", "PVC Electrical Conduit", quantities.conduit_m, "m")
    add_item("cable_lighting", "Lighting Cable", quantities.lighting_cable_m, "m")
    add_item("cable_power", "Power Cable (Sockets)", quantities.power_cable_m, "m")
    add_item("junction_box", "Junction Boxes", quantities.junction_boxes, "pcs")

    add_item("ppr_cold", "Cold Water PPR Pipe", quantities.cold_water_pipe_m, "m")
    if quantities.hot_water_pipe_m > 0:
        add_item("ppr_hot", "Hot Water PPR Pipe", quantities.hot_water_pipe_m, "m")

    add_item("pvc_waste", "PVC Waste/Drain Pipe", quantities.waste_pipe_m, "m")

    if quantities.earthing_rods > 0:
        add_item("earthing_rod", "Earthing Rod & Clamp", quantities.earthing_rods, "set")

    material_total = sum(m.total for m in materials)

    totals = PhaseTotals(
        materials=material_total,
        labour=0,
        other=0,
        phase_total=material_total,
    )

    return PhaseEstimate(
        phase="services_first_fix",
        materials=materials,
        labour=[],
        other_costs=[],
        totals=totals,
    )
