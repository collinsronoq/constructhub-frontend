from __future__ import annotations

from app.estimation.common_schemas import (
    PhaseEstimate,
    PhaseMetadata,
    build_phase_totals,
)
from app.estimation.geometry.building_geometry_resolver import ResolvedGeometry
from app.estimation.phases.services_first_fix.labour import build_services_first_fix_labour_items
from app.estimation.phases.services_first_fix.materials import build_services_first_fix_material_items
from app.estimation.phases.services_first_fix.quantifier import (
    build_services_first_fix_quantity_items,
    derive_services_first_fix_quantities,
)
from app.estimation.phases.services_first_fix.schemas import (
    ServicesFirstFixInput,
    ServicesFirstFixResolvedInputs,
)


def _resolve_inputs(
    data: ServicesFirstFixInput,
    geometry: ResolvedGeometry | None,
) -> ServicesFirstFixResolvedInputs:
    if geometry is None:
        return ServicesFirstFixResolvedInputs(
            effective_floor_area_sqm=float(data.floor_area_sqm),
            effective_storeys=max(1, int(data.storeys)),
            used_geometry_floor_area=False,
            used_geometry_storeys=False,
        )

    geometry_floor_area = float(geometry.total_floor_area_sqm or 0)
    geometry_storeys = int(geometry.storeys or 0)
    room_summary = geometry.room_program_summary or {}

    use_geometry_floor_area = geometry_floor_area > 0
    use_geometry_storeys = geometry_storeys > 0

    effective_floor_area = geometry_floor_area if use_geometry_floor_area else float(data.floor_area_sqm)
    effective_storeys = geometry_storeys if use_geometry_storeys else int(data.storeys)

    return ServicesFirstFixResolvedInputs(
        effective_floor_area_sqm=max(effective_floor_area, 1.0),
        effective_storeys=max(effective_storeys, 1),
        used_geometry_floor_area=use_geometry_floor_area,
        used_geometry_storeys=use_geometry_storeys,
        geometry_area_source=getattr(geometry, "area_source", None),
        geometry_room_program_total_rooms=int(room_summary.get("total_rooms") or 0),
        geometry_caps_applied=list(getattr(geometry, "caps_applied", []) or []),
        geometry_fits_plot_constraints=getattr(geometry, "fits_plot_constraints", None),
    )


def estimate_services_first_fix(
    data: ServicesFirstFixInput,
    geometry: ResolvedGeometry | None = None,
    vendor_prices: dict | None = None,
) -> PhaseEstimate:
    resolved_inputs = _resolve_inputs(data=data, geometry=geometry)
    quantities_model = derive_services_first_fix_quantities(data=data, resolved_inputs=resolved_inputs)

    quantities = build_services_first_fix_quantity_items(
        quantities=quantities_model,
        resolved_inputs=resolved_inputs,
    )
    materials = build_services_first_fix_material_items(
        quantities=quantities_model,
        vendor_prices=vendor_prices,
    )
    labour = build_services_first_fix_labour_items(
        data=data,
        quantities=quantities_model,
        resolved_inputs=resolved_inputs,
    )
    equipment = []
    other_costs = []

    totals = build_phase_totals(
        materials=materials,
        labour=labour,
        equipment=equipment,
        other_costs=other_costs,
    )

    assumptions = [
        "Habitable room count is derived from effective floor area using a 14sqm-per-room heuristic.",
        "Electrical run lengths use 7m average conduit/cable run per point with 5% waste allowance.",
        "Plumbing run lengths use per-wet-room allowances (cold=18m, hot=12m for bathrooms+kitchens, waste=15m).",
        "Electrical and plumbing quantities scale by storey factor for multi-storey distribution routing.",
        "Labour duration is heuristic: electrical by point count and plumbing by wet-room count.",
    ]
    if geometry:
        assumptions.extend(f"Geometry: {item}" for item in geometry.assumptions)
    notes = [
        "Service quantities are first-fix rough-in allowances and not detailed routing/tender takeoff.",
        "Electrical and plumbing are modeled together in this phase.",
    ]
    warnings = ["Rates are static defaults unless vendor overrides are provided."]

    if not resolved_inputs.used_geometry_floor_area:
        warnings.append("Shared geometry floor area unavailable; services_first_fix.floor_area_sqm fallback was used.")
    if not resolved_inputs.used_geometry_storeys:
        warnings.append("Shared geometry storeys unavailable; services_first_fix.storeys fallback was used.")
    if geometry and abs(float(data.floor_area_sqm) - resolved_inputs.effective_floor_area_sqm) > 0.5:
        warnings.append("services_first_fix.floor_area_sqm differs from shared geometry floor area; shared geometry value was used.")
    if geometry and int(data.storeys) != resolved_inputs.effective_storeys:
        warnings.append("services_first_fix.storeys differs from shared geometry storeys; shared geometry value was used.")
    if resolved_inputs.geometry_room_program_total_rooms > 0:
        notes.append("Room-program summary is available from shared geometry but not directly mapped to service point schedules.")
    if resolved_inputs.geometry_caps_applied:
        warnings.append(f"Shared geometry caps applied: {', '.join(resolved_inputs.geometry_caps_applied)}.")
    if resolved_inputs.geometry_fits_plot_constraints is False:
        warnings.append("Shared geometry indicates plot constraints were exceeded before capping; service quantities may be lower confidence.")

    return PhaseEstimate(
        phase="services_first_fix",
        phase_id="services_first_fix",
        phase_name="Services First Fix",
        inputs_used={
            "geometry_total_floor_area_sqm": float(geometry.total_floor_area_sqm) if geometry else None,
            "geometry_storeys": int(geometry.storeys) if geometry else None,
            "geometry_area_source": resolved_inputs.geometry_area_source,
            "geometry_room_program_total_rooms": resolved_inputs.geometry_room_program_total_rooms,
            "geometry_fits_plot_constraints": resolved_inputs.geometry_fits_plot_constraints,
            "geometry_caps_applied": resolved_inputs.geometry_caps_applied,
            "used_geometry_floor_area": resolved_inputs.used_geometry_floor_area,
            "used_geometry_storeys": resolved_inputs.used_geometry_storeys,
            "effective_floor_area_sqm": resolved_inputs.effective_floor_area_sqm,
            "effective_storeys": resolved_inputs.effective_storeys,
            "bathrooms": data.bathrooms,
            "kitchens": data.kitchens,
            "laundry_rooms": data.laundry_rooms,
            "sockets_per_room": data.sockets_per_room,
            "light_points_per_room": data.light_points_per_room,
            "quality_level": data.quality_level,
            "include_hot_water": data.include_hot_water,
            "include_earthing": data.include_earthing,
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
