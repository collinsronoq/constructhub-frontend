from __future__ import annotations

from app.estimation.common_schemas import (
    PhaseEstimate,
    PhaseMetadata,
    build_phase_totals,
)
from app.estimation.geometry.building_geometry_resolver import ResolvedGeometry
from app.estimation.phases.roofing.equipment import build_roofing_equipment_items
from app.estimation.phases.roofing.geometry import derive_roofing_geometry
from app.estimation.phases.roofing.labour import build_roofing_labour_items
from app.estimation.phases.roofing.materials import build_roofing_material_items
from app.estimation.phases.roofing.quantifier import (
    build_roofing_quantity_items,
    derive_roofing_quantities,
)
from app.estimation.phases.roofing.schemas import RoofingInput


def estimate_roofing_phase(
    data: RoofingInput,
    geometry: ResolvedGeometry,
    vendor_prices: dict | None = None,
) -> PhaseEstimate:
    # Shared resolved geometry is the authority for base plan dimensions.
    phase_geometry = derive_roofing_geometry(data=data, shared_geometry=geometry)
    quantity_model = derive_roofing_quantities(phase_geometry)

    quantities = build_roofing_quantity_items(
        geometry=phase_geometry,
        quantities=quantity_model,
    )
    materials = build_roofing_material_items(
        data=data,
        quantities=quantity_model,
        vendor_prices=vendor_prices,
    )
    labour = build_roofing_labour_items(data=data, geometry=phase_geometry)
    # Equipment is intentionally roof-type dependent: flat slab works require machinery.
    equipment = build_roofing_equipment_items(data=data, quantities=quantity_model)

    other_costs = []
    totals = build_phase_totals(
        materials=materials,
        labour=labour,
        equipment=equipment,
        other_costs=other_costs,
    )

    assumptions = [
        "Roofing base plan geometry (footprint/perimeter/storeys) is consumed from shared building geometry.",
        "Pitched roof area uses pitch-derived slope factor and optional overhang factor.",
        "Pitched roof covering quantity includes 5% wastage allowance.",
        "Pitched roof timber uses a bulk volume allowance (m3) derived from roof cover area and roof-type timber factors.",
        "Flat roof slab uses 200mm slab thickness, 14kg/sqm reinforcement, 5% formwork allowance, and 10% waterproofing allowance.",
        "Flat roof equipment uses fixed-service hire assumptions for concrete mixer and vibrator tied to concrete volume.",
        "Roofing labour uses fixed crew models by roof system with bounded area adjustment.",
    ]
    assumptions.extend(f"Geometry: {item}" for item in geometry.assumptions)

    notes = [
        "Roofing-specific geometry is derived from shared plan geometry plus roof form/pitch assumptions.",
        "Roofing phase excludes ceiling finishes and non-roof external drainage works.",
    ]
    # Backward-compatible fallback remains for older payloads that still pass footprint directly.
    if phase_geometry.used_fallback_footprint:
        notes.append("Shared geometry footprint unavailable; roofing input footprint fallback applied.")
    if not phase_geometry.is_flat:
        notes.append(
            "Timber is estimated as a bulk structural allowance; procurement may require conversion to member sizes and piece counts."
        )

    warnings = ["Rates are static defaults unless vendor overrides are provided."]
    warnings.extend(geometry.warnings)
    if geometry.caps_applied:
        warnings.append(f"Shared geometry caps applied: {', '.join(geometry.caps_applied)}.")
    if (
        phase_geometry.input_footprint_sqm is not None
        and phase_geometry.shared_footprint_area_sqm > 0
        and abs(phase_geometry.input_footprint_sqm - phase_geometry.shared_footprint_area_sqm) > 0.5
    ):
        warnings.append(
            "Roofing input footprint differs from shared geometry footprint; shared geometry value was used as authority."
        )
    if not phase_geometry.is_flat:
        warnings.append(
            "Timber quantity is volumetric (m3) and may not directly match market purchase units without member-size conversion."
        )

    return PhaseEstimate(
        phase="roofing",
        phase_id="roofing",
        phase_name="Roofing",
        inputs_used={
            "roof_type": data.roof_type,
            "roof_covering": data.roof_covering,
            "roof_pitch": data.roof_pitch,
            "include_overhangs": data.include_overhangs,
            "input_building_footprint_sqm": data.building_footprint_sqm,
            "input_storeys": data.storeys,
            "geometry_footprint_area_sqm": geometry.ground_footprint_area_sqm,
            "geometry_plan_perimeter_m": geometry.equivalent_plan_perimeter_m,
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
