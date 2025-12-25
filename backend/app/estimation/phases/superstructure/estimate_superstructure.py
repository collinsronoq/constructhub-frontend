# app/estimation/phases/superstructure/estimate_superstructure.py

from app.estimation.common_schemas import (
    PhaseEstimate,
    PhaseTotals,
)

from app.estimation.schemas.superstructure import SuperstructureInput

from app.estimation.phases.superstructure.land_feasibility import (
    resolve_land_feasibility,
)

from app.estimation.phases.superstructure.floor_area_resolver import (
    resolve_floor_area_from_rooms,
)

from app.estimation.phases.superstructure.superstructure_quantifier import (
    quantify_superstructure,
)

from app.estimation.phases.superstructure.superstructure_labour_quantifier import (
    estimate_superstructure_labour,
)

from app.estimation.phases.superstructure.superstructure_material_quantifier import (
    price_superstructure_materials,
)


def estimate_superstructure(
    data: SuperstructureInput,
    vendor_prices: dict | None = None,
) -> PhaseEstimate:
    """
    Final Superstructure Phase Estimator

    Integrates:
    - Land feasibility & footprint resolution
    - Automatic floor area derivation
    - Material quantification
    - Labour estimation
    - Material pricing (base or vendor-driven)
    """

    
    # Level 3: Land feasibility & footprint resolution
    
    footprint = resolve_land_feasibility(
        land_size_sqm=data.land_size_sqm,
        storeys=data.storeys,
    )

    
    # Level 4: Automatic floor area derivation
    
    floor_area = resolve_floor_area_from_rooms(
        rooms=data.rooms,
        footprint=footprint,
        storeys=data.storeys,
    )

    
    # Level 5: Material quantification
    
    quantities = quantify_superstructure(
        floor_area_sqm=floor_area.total_floor_area,
        storeys=data.storeys,
        block_type=data.block_type,
        quality=data.finishing_level,
    )

    
    # Level 6: Labour estimation
    
    labour_items = estimate_superstructure_labour(
        floor_area_sqm=floor_area.total_floor_area,
        storeys=data.storeys,
        complexity=data.structure_complexity,
    )

    labour_total = sum(l.total for l in labour_items)

    
    # Level 7: Material pricing
    
    material_pricing = price_superstructure_materials(
        quantities=quantities,
        block_type=data.block_type,
        vendor_prices=vendor_prices,
    )

    material_total = material_pricing.totals.materials

    
    # Final totals aggregation
    
    totals = PhaseTotals(
        materials=material_total,
        labour=labour_total,
        other=0,
        phase_total=material_total + labour_total,
    )

    return PhaseEstimate(
        phase="superstructure",
        materials=material_pricing.materials,
        labour=labour_items,
        other_costs=[],
        totals=totals,
    )
