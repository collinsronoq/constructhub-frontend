from app.estimation.common_schemas import PhaseEstimate, build_phase_totals
from app.estimation.phases.finishes.materials import build_finishes_material_items
from app.estimation.phases.finishes.schemas import FinishesInput, FinishesQuantityModel


def price_finishes_materials(
    data: FinishesInput,
    quantities: FinishesQuantityModel,
    vendor_prices: dict | None = None,
) -> PhaseEstimate:
    """
    Transitional compatibility helper for legacy module callers.
    """
    items = build_finishes_material_items(
        data=data,
        quantities=quantities,
        vendor_prices=vendor_prices,
    )
    return PhaseEstimate(
        phase="finishes",
        materials=items,
        labour=[],
        other_costs=[],
        totals=build_phase_totals(materials=items, labour=[], equipment=[], other_costs=[]),
    )

