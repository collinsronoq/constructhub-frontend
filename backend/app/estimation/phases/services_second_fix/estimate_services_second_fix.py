from app.estimation.common_schemas import PhaseEstimate, PhaseTotals
from backend.app.estimation.schemas.services_2 import ServicesSecondFixInput
from app.estimation.phases.services_second_fix.quantifier import quantify_services_second_fix
from app.estimation.phases.services_second_fix.material_pricier import price_services_second_fix_materials
from app.estimation.phases.services_second_fix.labour import estimate_services_second_fix_labour


def estimate_services_second_fix(
    data: ServicesSecondFixInput,
    vendor_prices: dict | None = None,
) -> PhaseEstimate:
    """
    End-to-end estimator for services second fix (fixtures & fittings).
    """

    quantities = quantify_services_second_fix(data)

    material_estimate = price_services_second_fix_materials(
        quantities=quantities,
        vendor_prices=vendor_prices,
    )

    labour_estimate = estimate_services_second_fix_labour(
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
        phase="services_second_fix",
        materials=material_estimate.materials,
        labour=labour_estimate.labour,
        other_costs=[],
        totals=totals,
    )
