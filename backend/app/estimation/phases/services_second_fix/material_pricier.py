from app.estimation.common_schemas import MaterialCost, PhaseEstimate, PhaseTotals
from app.estimation.base_materials.loader import load_base_materials
from app.estimation.logic.price_resolver import resolve_material_price
from app.estimation.schemas.services import ServicesSecondFixQuantities


def price_services_second_fix_materials(
    quantities: ServicesSecondFixQuantities,
    vendor_prices: dict | None = None,
) -> PhaseEstimate:
    """
    Price fixtures and fittings for services second fix.
    """

    base_prices = load_base_materials().get("services_second_fix_materials", {})
    vendor_prices = vendor_prices or {}

    materials: list[MaterialCost] = []

    def add_item(key: str, name: str, quantity: float, unit: str = "pcs"):
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

    add_item("switch", "Switches", quantities.switches)
    add_item("socket", "Sockets", quantities.sockets)
    add_item("light_fitting", "Light Fittings", quantities.light_fittings)

    add_item("toilet_set", "Toilet Sets", quantities.toilet_sets)
    add_item("basin", "Wash Basins", quantities.basins)
    add_item("kitchen_sink", "Kitchen Sinks", quantities.kitchen_sinks)

    if quantities.shower_mixers > 0:
        add_item("shower_mixer", "Shower Mixers", quantities.shower_mixers)
    if quantities.instant_showers > 0:
        add_item("instant_shower", "Instant Showers", quantities.instant_showers)

    material_total = sum(m.total for m in materials)

    totals = PhaseTotals(
        materials=material_total,
        labour=0,
        other=0,
        phase_total=material_total,
    )

    return PhaseEstimate(
        phase="services_second_fix",
        materials=materials,
        labour=[],
        other_costs=[],
        totals=totals,
    )
