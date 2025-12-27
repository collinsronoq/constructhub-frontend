from app.estimation.common_schemas import PhaseEstimate, PhaseTotals
from app.estimation.schemas.external import ExternalWorksInput
from app.estimation.phases.external_works.quantifier import quantify_external_works
from app.estimation.phases.external_works.material_pricier import price_external_works_materials
from app.estimation.phases.external_works.labour import estimate_external_works_labour


def estimate_external_works(
    data: ExternalWorksInput,
    vendor_prices: dict | None = None,
) -> PhaseEstimate:
    """
    End-to-end estimator for external works (paving, drainage, landscaping, perimeter wall, sewerage).
    """

    quantities = quantify_external_works(data)

    material_estimate = price_external_works_materials(
        data=data,
        quantities=quantities,
        vendor_prices=vendor_prices,
    )

    labour_estimate = estimate_external_works_labour(
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
        phase="external_works",
        materials=material_estimate.materials,
        labour=labour_estimate.labour,
        other_costs=[],
        totals=totals,
    )
