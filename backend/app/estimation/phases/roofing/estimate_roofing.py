# app/estimation/phases/roofing/roofing_phase.py

from app.estimation.common_schemas import PhaseEstimate, PhaseTotals

from app.estimation.schemas.roofing import RoofingInput
from backend.app.estimation.phases.roofing.roofing_geometry import derive_roof_geometry
from app.estimation.phases.roofing.roofing_quantifier import (
    quantify_roofing,
)
from app.estimation.phases.roofing.roofing_material_pricier import (
    price_roofing_materials,
)
from app.estimation.phases.roofing.roofing_labour import (
    estimate_roofing_labour,
)


def estimate_roofing_phase(
    data: RoofingInput,
    vendor_prices: dict | None = None,
) -> PhaseEstimate:
    """
    Final roofing phase estimator.

    Orchestrates:
    - Geometry derivation
    - Material quantification
    - Material pricing
    - Labour estimation
    """

    # 1. Geometry
    geometry = derive_roof_geometry(
        floor_area_sqm=data.floor_area_sqm,
        roof_type=data.roof_type,
        pitch=data.pitch,
        overhang_m=data.overhang_m,
    )

    # 2. Quantities
    quantities = quantify_roofing(
        geometry=geometry,
        roof_type=data.roof_type,
    )

    # 3. Material pricing
    materials_estimate = price_roofing_materials(
        quantities=quantities,
        roof_type=data.roof_type,
        vendor_prices=vendor_prices,
    )

    # 4. Labour
    labour_estimate = estimate_roofing_labour(
        roof_type=data.roof_type,
        roof_area_sqm=geometry.roof_area_sqm,
    )

    # 5. Aggregate totals
    material_total = materials_estimate.totals.materials
    labour_total = labour_estimate.totals.labour

    totals = PhaseTotals(
        materials=material_total,
        labour=labour_total,
        other=0,
        phase_total=material_total + labour_total,
    )

    return PhaseEstimate(
        phase="roofing",
        materials=materials_estimate.materials,
        labour=labour_estimate.labour,
        other_costs=[],
        totals=totals,
    )


# app/estimation/phases/roofing/estimate_roofing.py

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
        vendor_prices,
    )

    labour_items, labour_total = estimate_roofing_labour(
        geometry.roof_area_sqm,
        data.roof_type,
    )

    totals = PhaseTotals(
        materials=material_estimate.totals.materials,
        labour=labour_total,
        other=0,
        phase_total=material_estimate.totals.materials + labour_total,
    )

    return PhaseEstimate(
        phase="roofing",
        materials=material_estimate.materials,
        labour=labour_items,
        other_costs=[],
        totals=totals,
    )
