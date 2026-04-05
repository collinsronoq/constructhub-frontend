from __future__ import annotations

from app.estimation.common_schemas import (
    PhaseEstimate,
    PhaseMetadata,
    build_phase_totals,
)
from app.estimation.geometry.building_geometry_resolver import ResolvedGeometry
from app.estimation.phases.services_second_fix.labour import (
    build_services_second_fix_labour_items,
)
from app.estimation.phases.services_second_fix.materials import (
    build_services_second_fix_material_items,
)
from app.estimation.phases.services_second_fix.quantifier import (
    build_services_second_fix_quantity_items,
    derive_services_second_fix_quantities,
)
from app.estimation.phases.services_second_fix.schemas import (
    ServicesSecondFixInput,
    ServicesSecondFixResolvedInputs,
)


def _compat_floor_area(value: float | None) -> float:
    if value is None:
        return 1.0
    try:
        resolved = float(value)
    except (TypeError, ValueError):
        return 1.0
    return max(resolved, 1.0)


def _compat_storeys(value: int | None) -> int:
    if value is None:
        return 1
    try:
        resolved = int(value)
    except (TypeError, ValueError):
        return 1
    return max(resolved, 1)


def _resolve_inputs(
    data: ServicesSecondFixInput,
    geometry: ResolvedGeometry | None,
) -> ServicesSecondFixResolvedInputs:
    if geometry is None:
        return ServicesSecondFixResolvedInputs(
            effective_floor_area_sqm=_compat_floor_area(data.floor_area_sqm),
            effective_storeys=_compat_storeys(data.storeys),
            used_geometry_floor_area=False,
            used_geometry_storeys=False,
        )

    geometry_floor_area = float(geometry.total_floor_area_sqm or 0)
    geometry_storeys = int(geometry.storeys or 0)
    room_summary = geometry.room_program_summary or {}

    use_geometry_floor_area = geometry_floor_area > 0
    use_geometry_storeys = geometry_storeys > 0

    effective_floor_area = geometry_floor_area if use_geometry_floor_area else _compat_floor_area(data.floor_area_sqm)
    effective_storeys = geometry_storeys if use_geometry_storeys else _compat_storeys(data.storeys)

    return ServicesSecondFixResolvedInputs(
        effective_floor_area_sqm=max(effective_floor_area, 1.0),
        effective_storeys=max(effective_storeys, 1),
        used_geometry_floor_area=use_geometry_floor_area,
        used_geometry_storeys=use_geometry_storeys,
        geometry_area_source=getattr(geometry, "area_source", None),
        geometry_room_program_total_rooms=int(room_summary.get("total_rooms") or 0),
        geometry_caps_applied=list(getattr(geometry, "caps_applied", []) or []),
        geometry_fits_plot_constraints=getattr(geometry, "fits_plot_constraints", None),
    )


def estimate_services_second_fix(
    data: ServicesSecondFixInput,
    geometry: ResolvedGeometry | None = None,
    vendor_prices: dict | None = None,
) -> PhaseEstimate:
    resolved_inputs = _resolve_inputs(data=data, geometry=geometry)
    quantities_model = derive_services_second_fix_quantities(
        data=data,
        resolved_inputs=resolved_inputs,
    )

    quantities = build_services_second_fix_quantity_items(
        data=data,
        quantities=quantities_model,
        resolved_inputs=resolved_inputs,
    )
    materials = build_services_second_fix_material_items(
        quantities=quantities_model,
        vendor_prices=vendor_prices,
    )
    labour = build_services_second_fix_labour_items(
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
        "Habitable rooms are inferred as bedrooms + living rooms + dining rooms + kitchens.",
        "Light points are estimated as (habitable_rooms * light_points_per_room) + (bathrooms * 2).",
        "Socket points are estimated as (habitable_rooms * sockets_per_room) + (kitchens * 4).",
        "Storey uplift applies 10% per additional storey and rounds fixture counts up to whole units.",
        "Wash basins include bathroom basins plus one dining-room basin allowance when dining rooms are present.",
        "Labour duration is heuristic: electrical effort scales with fixture points; plumbing effort scales with sanitary fixtures.",
    ]
    if geometry:
        assumptions.extend(f"Geometry: {item}" for item in geometry.assumptions)

    notes = [
        "Second-fix quantities are fixture allowances and not a detailed room-by-room procurement schedule.",
        "Electrical and sanitary fixtures are modeled together in this phase.",
    ]

    warnings = ["Rates are static defaults unless vendor overrides are provided."]
    if not resolved_inputs.used_geometry_floor_area:
        warnings.append("Shared geometry floor area unavailable; services_second_fix.floor_area_sqm fallback was used.")
    if not resolved_inputs.used_geometry_storeys:
        warnings.append("Shared geometry storeys unavailable; services_second_fix.storeys fallback was used.")
    if geometry and data.floor_area_sqm is not None and abs(float(data.floor_area_sqm) - resolved_inputs.effective_floor_area_sqm) > 0.5:
        warnings.append("services_second_fix.floor_area_sqm differs from shared geometry floor area; shared geometry value was used.")
    if geometry and data.storeys is not None and int(data.storeys) != resolved_inputs.effective_storeys:
        warnings.append("services_second_fix.storeys differs from shared geometry storeys; shared geometry value was used.")
    if data.include_shower_mixers:
        warnings.append("Shower mixer quantities are applied to all bathrooms when the toggle is enabled.")
    if data.include_instant_showers:
        warnings.append("Instant shower quantities are applied to all bathrooms when the toggle is enabled.")
    if resolved_inputs.geometry_caps_applied:
        warnings.append(f"Shared geometry caps applied: {', '.join(resolved_inputs.geometry_caps_applied)}.")
    if resolved_inputs.geometry_fits_plot_constraints is False:
        warnings.append("Shared geometry indicates plot constraints were exceeded before capping; second-fix quantities may be lower confidence.")

    return PhaseEstimate(
        phase="services_second_fix",
        phase_id="services_second_fix",
        phase_name="Services Second Fix",
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
            "bedrooms": data.bedrooms,
            "living_rooms": data.living_rooms,
            "dining_rooms": data.dining_rooms,
            "kitchens": data.kitchens,
            "bathrooms": data.bathrooms,
            "sockets_per_room": data.sockets_per_room,
            "light_points_per_room": data.light_points_per_room,
            "include_shower_mixers": data.include_shower_mixers,
            "include_instant_showers": data.include_instant_showers,
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
