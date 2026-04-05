from __future__ import annotations

from math import sqrt

from app.estimation.common_schemas import PhaseEstimate, PhaseMetadata, build_phase_totals
from app.estimation.geometry.building_geometry_resolver import ResolvedGeometry
from app.estimation.phases.external_works.equipment import build_external_works_equipment_items
from app.estimation.phases.external_works.geometry import derive_external_works_geometry
from app.estimation.phases.external_works.labour import build_external_works_labour_items
from app.estimation.phases.external_works.materials import build_external_works_material_items
from app.estimation.phases.external_works.quantifier import (
    build_external_works_quantity_items,
    derive_external_works_quantities,
)
from app.estimation.phases.external_works.schemas import (
    ExternalWorksInput,
    ExternalWorksResolvedInputs,
)


def _resolve_inputs(
    data: ExternalWorksInput,
    geometry: ResolvedGeometry | None,
) -> ExternalWorksResolvedInputs:
    plot_area = max(float(data.land_size_sqm), 1.0)
    fallback_floor_area = max(float(data.floor_area_sqm or plot_area * 0.40), 1.0)

    if geometry is None:
        fallback_floor = fallback_floor_area
        footprint = min(fallback_floor, plot_area * 0.65)
        return ExternalWorksResolvedInputs(
            plot_area_sqm=plot_area,
            effective_total_floor_area_sqm=fallback_floor,
            effective_building_footprint_sqm=footprint,
            effective_building_plan_perimeter_m=4 * sqrt(max(footprint, 1.0)),
            used_geometry_floor_area=False,
            used_geometry_footprint=False,
            used_geometry_plan_perimeter=False,
        )

    geometry_floor_area = float(geometry.total_floor_area_sqm or 0)
    geometry_footprint = float(geometry.footprint_area_sqm or 0)
    geometry_plan_perimeter = float(geometry.equivalent_plan_perimeter_m or 0)

    use_geometry_floor = geometry_floor_area > 0
    use_geometry_footprint = geometry_footprint > 0
    use_geometry_plan_perimeter = geometry_plan_perimeter > 0

    effective_floor_area = geometry_floor_area if use_geometry_floor else fallback_floor_area
    fallback_footprint = min(effective_floor_area, plot_area * 0.65)
    effective_footprint = geometry_footprint if use_geometry_footprint else fallback_footprint
    effective_plan_perimeter = geometry_plan_perimeter if use_geometry_plan_perimeter else (4 * sqrt(max(effective_footprint, 1.0)))

    return ExternalWorksResolvedInputs(
        plot_area_sqm=plot_area,
        effective_total_floor_area_sqm=max(effective_floor_area, 1.0),
        effective_building_footprint_sqm=max(min(effective_footprint, plot_area * 0.92), 1.0),
        effective_building_plan_perimeter_m=max(effective_plan_perimeter, 4.0),
        used_geometry_floor_area=use_geometry_floor,
        used_geometry_footprint=use_geometry_footprint,
        used_geometry_plan_perimeter=use_geometry_plan_perimeter,
        geometry_area_source=getattr(geometry, "area_source", None),
        geometry_caps_applied=list(getattr(geometry, "caps_applied", []) or []),
        geometry_fits_plot_constraints=getattr(geometry, "fits_plot_constraints", None),
    )


def estimate_external_works(
    data: ExternalWorksInput,
    geometry: ResolvedGeometry | None = None,
    vendor_prices: dict | None = None,
) -> PhaseEstimate:
    resolved_inputs = _resolve_inputs(data=data, geometry=geometry)
    site_geometry = derive_external_works_geometry(data=data, resolved_inputs=resolved_inputs)
    quantities_model = derive_external_works_quantities(
        data=data,
        geometry=site_geometry,
        resolved_inputs=resolved_inputs,
    )

    quantities = build_external_works_quantity_items(
        data=data,
        geometry=site_geometry,
        quantities=quantities_model,
        resolved_inputs=resolved_inputs,
    )
    materials = build_external_works_material_items(
        data=data,
        quantities=quantities_model,
        vendor_prices=vendor_prices,
    )
    labour = build_external_works_labour_items(
        data=data,
        quantities=quantities_model,
    )
    equipment = build_external_works_equipment_items(
        data=data,
        quantities=quantities_model,
        vendor_prices=vendor_prices,
    )
    other_costs = []

    totals = build_phase_totals(
        materials=materials,
        labour=labour,
        equipment=equipment,
        other_costs=other_costs,
    )

    assumptions = [
        "External works uses plot area as the primary site driver and shared building footprint as occupancy context.",
        "Open external area is derived as plot_area_sqm - building_footprint_area_sqm, with a minimum residual allowance.",
        "Hardscape and softscape candidate areas are allocated from open area, then clamped to avoid over-allocation.",
        "Boundary effective length deducts gate openings (gate_count * gate_width_m) before wall/fence quantity takeoff.",
        "Biodigester sizing basis uses max(input biodigester_capacity_users, floor-area occupancy heuristic).",
        "Equipment quantities are productivity-based allowances tied to paving, excavation scope, and concrete scope.",
    ]
    if geometry:
        assumptions.extend(f"Geometry: {item}" for item in geometry.assumptions)

    notes = [
        "External works quantities are planning-level allowances and not a final civil BOQ.",
        "Paving includes driveway and walkway hardscape allocations.",
        "Gate supply is width-adjusted using a standard 3m gate equivalent basis.",
    ]

    warnings = ["Rates are static defaults unless vendor overrides are provided."]
    if not resolved_inputs.used_geometry_floor_area:
        warnings.append("Shared geometry floor area unavailable; external_works.floor_area_sqm fallback was used.")
    if not resolved_inputs.used_geometry_footprint:
        warnings.append("Shared geometry footprint unavailable; fallback footprint from floor area and plot area was used.")
    if not resolved_inputs.used_geometry_plan_perimeter:
        warnings.append("Shared geometry plan perimeter unavailable; equivalent-square perimeter fallback was used.")
    if data.perimeter_wall_enabled and data.perimeter_wall_length_m is None:
        warnings.append("Boundary length was inferred from equivalent-square plot perimeter.")
    if data.paving_area_sqm is None:
        warnings.append("Paving area was derived from open-area allocation heuristics.")
    if data.landscaping_area_sqm is None:
        warnings.append("Landscaping area was derived from open-area allocation heuristics.")
    if data.sewerage_system in {"septic_tank", "biodigester"}:
        warnings.append("Sewerage sizing is approximate and should be validated against detailed utility design.")
    if resolved_inputs.geometry_caps_applied:
        warnings.append(f"Shared geometry caps applied: {', '.join(resolved_inputs.geometry_caps_applied)}.")
    if resolved_inputs.geometry_fits_plot_constraints is False:
        warnings.append("Shared geometry indicates pre-cap plot fit issues; external works outputs may have lower confidence.")

    return PhaseEstimate(
        phase="external_works",
        phase_id="external_works",
        phase_name="External Works",
        inputs_used={
            "plot_area_sqm": data.land_size_sqm,
            "geometry_total_floor_area_sqm": float(geometry.total_floor_area_sqm) if geometry else None,
            "geometry_footprint_area_sqm": float(geometry.footprint_area_sqm) if geometry else None,
            "geometry_plan_perimeter_m": float(geometry.equivalent_plan_perimeter_m) if geometry else None,
            "geometry_area_source": resolved_inputs.geometry_area_source,
            "geometry_fits_plot_constraints": resolved_inputs.geometry_fits_plot_constraints,
            "geometry_caps_applied": resolved_inputs.geometry_caps_applied,
            "used_geometry_floor_area": resolved_inputs.used_geometry_floor_area,
            "used_geometry_footprint": resolved_inputs.used_geometry_footprint,
            "used_geometry_plan_perimeter": resolved_inputs.used_geometry_plan_perimeter,
            "effective_total_floor_area_sqm": resolved_inputs.effective_total_floor_area_sqm,
            "effective_building_footprint_sqm": resolved_inputs.effective_building_footprint_sqm,
            "perimeter_wall_enabled": data.perimeter_wall_enabled,
            "perimeter_wall_type": data.perimeter_wall_type,
            "perimeter_wall_length_m": data.perimeter_wall_length_m,
            "perimeter_wall_height_m": data.perimeter_wall_height_m,
            "gate_count": data.gate_count,
            "gate_width_m": data.gate_width_m,
            "razor_wire": data.razor_wire,
            "paving_area_sqm_override": data.paving_area_sqm,
            "driveway_area_sqm_override": data.driveway_area_sqm,
            "drainage_length_m_override": data.drainage_length_m,
            "landscaping_area_sqm_override": data.landscaping_area_sqm,
            "sewerage_system": data.sewerage_system,
            "sewer_connection_length_m": data.sewer_connection_length_m,
            "biodigester_capacity_users": data.biodigester_capacity_users,
            "quality_level": data.quality_level,
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
