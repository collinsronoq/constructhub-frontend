from app.estimation.common_schemas import PhaseEstimate, build_phase_totals
from app.estimation.phases.services_second_fix.materials import (
    build_services_second_fix_material_items,
)
from app.estimation.phases.services_second_fix.schemas import ServicesSecondFixQuantityModel


def price_services_second_fix_materials(
    quantities: ServicesSecondFixQuantityModel,
    vendor_prices: dict | None = None,
) -> PhaseEstimate:
    """
    Transitional compatibility helper for legacy module callers.
    """
    materials = build_services_second_fix_material_items(
        quantities=quantities,
        vendor_prices=vendor_prices,
    )

    return PhaseEstimate(
        phase="services_second_fix",
        materials=materials,
        labour=[],
        other_costs=[],
        totals=build_phase_totals(materials=materials, labour=[], equipment=[], other_costs=[]),
    )
