from __future__ import annotations

from math import sqrt

from app.estimation.common_schemas import (
    PhaseEstimate,
    PhaseMetadata,
    build_phase_totals,
)
from app.estimation.geometry.building_geometry_resolver import ResolvedGeometry
from app.estimation.phases.finishes.geometry import derive_finishes_geometry
from app.estimation.phases.finishes.labour import build_finishes_labour_items
from app.estimation.phases.finishes.materials import build_finishes_material_items
from app.estimation.phases.finishes.quantifier import (
    build_finishes_quantity_items,
    derive_finishes_quantities,
)
from app.estimation.phases.finishes.schemas import (
    FinishesInput,
    FinishesResolvedInputs,
)


def _resolve_inputs(
    data: FinishesInput,
    geometry: ResolvedGeometry | None,
) -> FinishesResolvedInputs:
    if geometry is None:
        effective_floor_area = float(data.floor_area_sqm)
        effective_storeys = max(1, int(data.storeys))
        footprint = max(effective_floor_area / effective_storeys, 1.0)
        perimeter = 4 * sqrt(footprint)
        return FinishesResolvedInputs(
            effective_floor_area_sqm=effective_floor_area,
            effective_storeys=effective_storeys,
            effective_plan_perimeter_m=perimeter,
            used_geometry_floor_area=False,
            used_geometry_storeys=False,
            used_geometry_perimeter=False,
        )

    geometry_floor_area = float(geometry.total_floor_area_sqm or 0)
    geometry_storeys = int(geometry.storeys or 0)
    geometry_perimeter = float(geometry.equivalent_plan_perimeter_m or 0)
    room_summary = geometry.room_program_summary or {}

    use_geometry_floor_area = geometry_floor_area > 0
    use_geometry_storeys = geometry_storeys > 0
    use_geometry_perimeter = geometry_perimeter > 0

    effective_floor_area = geometry_floor_area if use_geometry_floor_area else float(data.floor_area_sqm)
    effective_storeys = geometry_storeys if use_geometry_storeys else int(data.storeys)
    if use_geometry_perimeter:
        effective_perimeter = geometry_perimeter
    else:
        footprint = max(effective_floor_area / max(effective_storeys, 1), 1.0)
        effective_perimeter = 4 * sqrt(footprint)

    return FinishesResolvedInputs(
        effective_floor_area_sqm=max(effective_floor_area, 1.0),
        effective_storeys=max(effective_storeys, 1),
        effective_plan_perimeter_m=max(effective_perimeter, 4.0),
        used_geometry_floor_area=use_geometry_floor_area,
        used_geometry_storeys=use_geometry_storeys,
        used_geometry_perimeter=use_geometry_perimeter,
        geometry_area_source=getattr(geometry, "area_source", None),
        geometry_room_program_total_rooms=int(room_summary.get("total_rooms") or 0),
        geometry_caps_applied=list(getattr(geometry, "caps_applied", []) or []),
        geometry_fits_plot_constraints=getattr(geometry, "fits_plot_constraints", None),
    )


def estimate_finishes(
    data: FinishesInput,
    geometry: ResolvedGeometry | None = None,
    vendor_prices: dict | None = None,
) -> PhaseEstimate:
    resolved_inputs = _resolve_inputs(data=data, geometry=geometry)
    finish_geometry = derive_finishes_geometry(data=data, resolved_inputs=resolved_inputs)
    quantities_model = derive_finishes_quantities(
        data=data,
        geometry=finish_geometry,
        resolved_inputs=resolved_inputs,
    )

    quantities = build_finishes_quantity_items(
        data=data,
        geometry=finish_geometry,
        quantities=quantities_model,
        resolved_inputs=resolved_inputs,
    )
    materials = build_finishes_material_items(
        data=data,
        quantities=quantities_model,
        vendor_prices=vendor_prices,
    )
    labour = build_finishes_labour_items(
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
        "Finishes uses shared geometry for effective floor area, storeys, and plan perimeter when available.",
        "Wet floor area is room-driven and bounded to 14%-32% of effective floor area to avoid unrealistic splits.",
        "Opening deductions are inferred from wall area and room counts because explicit window/door schedules are not yet modeled.",
        "Paint quantities are surface-based with explicit coat and coverage assumptions (walls 11sqm/L, ceiling 12sqm/L, exterior 9sqm/L).",
        "Plaster/render materials convert area into cement and sand using 15mm thickness, dry-volume factor 1.33, and 1:4 mix.",
        "Skimming materials use a 22sqm-per-bag coverage assumption.",
        "Cabinetry uses a two-layer model: design run lengths then board-equivalent sheet conversion.",
    ]
    if geometry:
        assumptions.extend(f"Geometry: {item}" for item in geometry.assumptions)

    notes = [
        "Wardrobe and cabinet quantities are indicative design allowances, not full shop-drawing takeoffs.",
        "Bathroom and store cabinetry runs are included when corresponding toggles and room counts are present.",
        "Skimming is modeled separately from plaster/render to improve material visibility.",
    ]

    warnings = ["Rates are static defaults unless vendor overrides are provided."]
    if not resolved_inputs.used_geometry_floor_area:
        warnings.append("Shared geometry floor area unavailable; finishes.floor_area_sqm fallback was used.")
    if not resolved_inputs.used_geometry_storeys:
        warnings.append("Shared geometry storeys unavailable; finishes.storeys fallback was used.")
    if not resolved_inputs.used_geometry_perimeter:
        warnings.append("Shared geometry perimeter unavailable; equivalent-square perimeter fallback was used.")
    if geometry and abs(float(data.floor_area_sqm) - resolved_inputs.effective_floor_area_sqm) > 0.5:
        warnings.append("finishes.floor_area_sqm differs from shared geometry floor area; shared geometry value was used.")
    if geometry and int(data.storeys) != resolved_inputs.effective_storeys:
        warnings.append("finishes.storeys differs from shared geometry storeys; shared geometry value was used.")
    if resolved_inputs.geometry_caps_applied:
        warnings.append(f"Shared geometry caps applied: {', '.join(resolved_inputs.geometry_caps_applied)}.")
    if resolved_inputs.geometry_fits_plot_constraints is False:
        warnings.append("Shared geometry indicates plot constraints were exceeded before capping; finish quantities may be lower confidence.")
    warnings.append("Openings, partition density, and cabinetry conversion remain heuristic and should be refined with project-specific drawings.")

    return PhaseEstimate(
        phase="finishes",
        phase_id="finishes",
        phase_name="Finishes",
        inputs_used={
            "geometry_total_floor_area_sqm": float(geometry.total_floor_area_sqm) if geometry else None,
            "geometry_storeys": int(geometry.storeys) if geometry else None,
            "geometry_equivalent_plan_perimeter_m": float(geometry.equivalent_plan_perimeter_m) if geometry else None,
            "geometry_area_source": resolved_inputs.geometry_area_source,
            "geometry_room_program_total_rooms": resolved_inputs.geometry_room_program_total_rooms,
            "geometry_fits_plot_constraints": resolved_inputs.geometry_fits_plot_constraints,
            "geometry_caps_applied": resolved_inputs.geometry_caps_applied,
            "used_geometry_floor_area": resolved_inputs.used_geometry_floor_area,
            "used_geometry_storeys": resolved_inputs.used_geometry_storeys,
            "used_geometry_perimeter": resolved_inputs.used_geometry_perimeter,
            "effective_floor_area_sqm": resolved_inputs.effective_floor_area_sqm,
            "effective_storeys": resolved_inputs.effective_storeys,
            "effective_plan_perimeter_m": resolved_inputs.effective_plan_perimeter_m,
            "wall_height_m": data.wall_height_m,
            "bedrooms": data.bedrooms,
            "master_bedrooms": data.master_bedrooms,
            "bathrooms": data.bathrooms,
            "kitchens": data.kitchens,
            "living_rooms": data.living_rooms,
            "dining_rooms": data.dining_rooms,
            "stores": data.stores,
            "other_rooms": data.other_rooms,
            "main_floor_finish": data.main_floor_finish,
            "wet_floor_finish": data.wet_floor_finish,
            "wet_wall_tiling": data.wet_wall_tiling,
            "ceiling_type": data.ceiling_type,
            "paint_system": data.paint_system,
            "include_cornices": data.include_cornices,
            "include_skirting": data.include_skirting,
            "include_wardrobes": data.include_wardrobes,
            "include_kitchen_cabinets": data.include_kitchen_cabinets,
            "include_bathroom_cabinetry": data.include_bathroom_cabinetry,
            "include_store_cabinetry": data.include_store_cabinetry,
            "joinery_level": data.joinery_level,
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

