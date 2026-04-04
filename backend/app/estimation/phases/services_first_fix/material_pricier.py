from app.estimation.common_schemas import PhaseEstimate, build_phase_totals
from app.estimation.phases.services_first_fix.materials import build_services_first_fix_material_items
from app.estimation.phases.services_first_fix.schemas import ServicesFirstFixQuantityModel


def price_services_first_fix_materials(
    quantities: ServicesFirstFixQuantityModel,
    vendor_prices: dict | None = None,
) -> PhaseEstimate:
    """
    Transitional compatibility helper for legacy module callers.
    """

    items = build_services_first_fix_material_items(quantities=quantities, vendor_prices=vendor_prices)
    return PhaseEstimate(
        phase="services_first_fix",
        materials=items,
        labour=[],
        other_costs=[],
        totals=build_phase_totals(materials=items, labour=[], equipment=[], other_costs=[]),
    )


__all__ = ["price_services_first_fix_materials"]

