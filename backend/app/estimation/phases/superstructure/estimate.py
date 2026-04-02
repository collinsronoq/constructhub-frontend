from __future__ import annotations

from app.estimation.common_schemas import (
    CostItem,
    PhaseEstimate,
    PhaseMetadata,
    build_phase_totals,
)
from app.estimation.geometry.building_geometry_resolver import ResolvedGeometry
from app.estimation.phases.superstructure.equipment import build_equipment_items
from app.estimation.phases.superstructure.geometry import derive_superstructure_geometry
from app.estimation.phases.superstructure.labour import (
    build_labour_items,
    derive_labour_model,
)
from app.estimation.phases.superstructure.materials import build_material_items
from app.estimation.phases.superstructure.quantifier import (
    build_quantity_items,
    derive_quantity_model,
)
from app.estimation.phases.superstructure.schemas import SuperstructureInput


def estimate_superstructure(
    data: SuperstructureInput,
    geometry: ResolvedGeometry,
    vendor_prices: dict | None = None,
) -> PhaseEstimate:
    """
    Superstructure v2 estimator:
      - Masonry (walls + openings deduction + derived mortar materials)
      - RC elements (columns, beams/lintels, suspended slabs)
      - Task-based labour and explicit equipment
    """

    phase_geometry = derive_superstructure_geometry(data=data, geometry=geometry)
    quantity_model = derive_quantity_model(data=data, phase_geometry=phase_geometry)

    materials = build_material_items(
        data=data,
        quantity_model=quantity_model,
        vendor_prices=vendor_prices,
    )

    labour_model = derive_labour_model(
        data=data,
        phase_geometry=phase_geometry,
        quantity_model=quantity_model,
    )
    labour = build_labour_items(labour_model=labour_model)
    equipment = build_equipment_items(
        storeys=phase_geometry.storeys,
        labour_model=labour_model,
    )

    other_costs: list[CostItem] = []
    quantities = build_quantity_items(
        shared_geometry=geometry,
        phase_geometry=phase_geometry,
        quantity_model=quantity_model,
    )

    assumptions = [
        "Core superstructure geometry (floor area, storeys, footprint, perimeter) is consumed from the shared building geometry resolver.",
        "Wall thickness is assumed at 150mm for masonry modeling.",
        "Mortar mix ratio is fixed at 1:4 (cement:sand) with dry volume factor 1.33.",
        "Openings are estimated from room counts and capped at 35% of total wall area.",
        "Suspended slab thickness depends on finishing level (standard/premium/luxury).",
        "Beam and column sizes are standardized assumptions for preliminary estimation.",
    ]
    assumptions.extend(f"Geometry: {item}" for item in geometry.assumptions)

    notes = [
        "Mortar is not treated as a purchasable material; cement and sand are derived from mortar volume.",
        "Masonry and RC concrete are costed as separate systems.",
        "Openings deductions are explicitly applied before masonry quantity takeoff.",
    ]

    warnings = ["Rates are static defaults unless vendor overrides are provided."]
    warnings.extend(geometry.warnings)
    if geometry.caps_applied:
        warnings.append(f"Shared geometry caps applied: {', '.join(geometry.caps_applied)}.")
    if phase_geometry.openings_capped:
        warnings.append("Openings estimate exceeded 35% of wall area and was capped for stability.")

    totals = build_phase_totals(
        materials=materials,
        labour=labour,
        equipment=equipment,
        other_costs=other_costs,
    )

    return PhaseEstimate(
        phase="superstructure",
        phase_id="superstructure",
        phase_name="Superstructure",
        inputs_used={
            "land_size_sqm": data.land_size_sqm,
            "structure_type": data.structure_type,
            "blockwork_type": data.blockwork_type,
            "roof_type": data.roof_type,
            "declared_floor_area_sqm": data.declared_floor_area_sqm,
            "bedrooms": data.bedrooms,
            "bathrooms": data.bathrooms,
            "master_bedrooms": data.master_bedrooms,
            "living_rooms": data.living_rooms,
            "dining_rooms": data.dining_rooms,
            "kitchens": data.kitchens,
            "additional_rooms": {k: v.count for k, v in (data.additional_rooms or {}).items()},
            "room_size_preference": data.room_size_preference,
            "finishing_level": data.finishing_level,
            "geometry_area_source": geometry.area_source,
            "geometry_total_floor_area_sqm": geometry.total_floor_area_sqm,
            "geometry_footprint_area_sqm": geometry.footprint_area_sqm,
            "geometry_storeys": geometry.storeys,
            "geometry_fits_plot_constraints": geometry.fits_plot_constraints,
            "geometry_caps_applied": geometry.caps_applied,
        },
        quantities=quantities,
        materials=materials,
        labour=labour,
        equipment=equipment,
        other_costs=other_costs,
        totals=totals,
        assumptions=assumptions,
        notes=notes,
        warnings=warnings,
        metadata=PhaseMetadata(
            version="v2",
            pricing_source="rate_table_vendor_override",
            confidence="medium",
        ),
    )
