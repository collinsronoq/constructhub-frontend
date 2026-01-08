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
        structure_type=data.structure_type,
    )

    # Level 4: Automatic floor area derivation
    room_quantities = {
        "bedroom": data.bedrooms,
        "master_bedroom": data.master_bedrooms,
        "bathroom": data.bathrooms,
        "kitchen": data.kitchens,
        "dining": data.dining_rooms,
        "living_room": data.living_rooms,
    }
    for name, room in data.additional_rooms.items():
        room_quantities[name] = room.count

    floor_area = resolve_floor_area_from_rooms(
        room_quantities=room_quantities,
        max_allowable_floor_area_sqm=footprint.total_allowable_floor_area_sqm,
        size_tier=data.room_size_preference,
    )

    
    # Level 5: Material quantification
    
    effective_floor_area = data.declared_floor_area_sqm or floor_area.total_floor_area_sqm

    print(f"effective floor area: {effective_floor_area}")

    quantities = quantify_superstructure(
        data=data,
        total_floor_area_sqm=effective_floor_area,
        number_of_storeys=footprint.floors,
    )

    
    # Level 6: Labour estimation
    
    labour_phase = estimate_superstructure_labour(
        quantities=quantities,
        finishing_level=data.finishing_level,
        number_of_storeys=footprint.floors,
    )
    labour_items = labour_phase.labour
    labour_total = labour_phase.totals.labour

    
    # Level 7: Material pricing
    
    material_pricing = price_superstructure_materials(
        quantities=quantities,
        blockwork_type=data.blockwork_type,
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
