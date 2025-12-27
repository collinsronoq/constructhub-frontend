from app.estimation.common_schemas import PhaseEstimate, PhaseTotals
from app.estimation.schemas.finishes import FinishesInput
from app.estimation.phases.finishes.quantifier import quantify_finishes
from app.estimation.phases.finishes.material_pricier import price_finishes_materials
from app.estimation.phases.finishes.labour import estimate_finishes_labour


def estimate_finishes(
    data: FinishesInput,
    vendor_prices: dict | None = None,
) -> PhaseEstimate:
    """
    End-to-end estimator for the finishes phase.
    """

    quantities = quantify_finishes(data)

    material_estimate = price_finishes_materials(
        data=data,
        quantities=quantities,
        vendor_prices=vendor_prices,
    )

    labour_estimate = estimate_finishes_labour(
        data=data,
        quantities=quantities,
    )

    totals = PhaseTotals(
        materials=material_estimate.totals.materials,
        labour=labour_estimate.totals.labour,
        other=0,
        phase_total=material_estimate.totals.materials + labour_estimate.totals.labour,
    )

    return PhaseEstimate(
        phase="finishes",
        materials=material_estimate.materials,
        labour=labour_estimate.labour,
        other_costs=[],
        totals=totals,
    )
