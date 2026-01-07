from app.estimation.schemas.roofing import RoofingInput
from app.estimation.phases.roofing.roofing_geometry import derive_roof_geometry
from app.estimation.phases.roofing.roofing_quantifier import quantify_roofing
from app.estimation.phases.roofing.roofing_material_pricier import price_roofing_materials
from app.estimation.phases.roofing.roofing_labour import estimate_roofing_labour
from app.estimation.common_schemas import PhaseEstimate, PhaseTotals


def estimate_roofing_phase(
    data: RoofingInput,
    vendor_prices: dict | None = None,
) -> PhaseEstimate:
    """
    Full roofing phase estimation.
    """

    geometry = derive_roof_geometry(data)
    quantities = quantify_roofing(geometry, data.roof_type)

    material_estimate = price_roofing_materials(
        quantities,
        data.roof_type,
        data.roof_covering,
        vendor_prices,
    )

    labour_estimate = estimate_roofing_labour(
        roof_type=data.roof_type,
        roof_area_sqm=geometry.roof_area_sqm,
        roof_covering=data.roof_covering,
    )

    totals = PhaseTotals(
        materials=material_estimate.totals.materials,
        labour=labour_estimate.totals.labour,
        other=0,
        phase_total=material_estimate.totals.materials + labour_estimate.totals.labour,
    )

    return PhaseEstimate(
        phase="roofing",
        materials=material_estimate.materials,
        labour=labour_estimate.labour,
        other_costs=[],
        totals=totals,
    )
