from __future__ import annotations

from math import ceil, sqrt

from app.estimation.common_schemas import QuantityItem
from app.estimation.phases.external_works.geometry import derive_external_works_geometry
from app.estimation.phases.external_works.schemas import (
    ExternalWorksGeometryModel,
    ExternalWorksInput,
    ExternalWorksQuantityModel,
    ExternalWorksResolvedInputs,
)


QUALITY_FACTOR = {
    "standard": 1.0,
    "premium": 1.12,
}


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(value, high))


def _resolve_hardscape_split(
    data: ExternalWorksInput,
    geometry: ExternalWorksGeometryModel,
) -> tuple[float, float, float]:
    if data.paving_area_sqm is not None:
        total_paving = min(float(data.paving_area_sqm), geometry.open_external_area_sqm * 0.85)
    else:
        total_paving = geometry.hardscape_candidate_area_sqm

    if data.driveway_area_sqm is not None:
        driveway_area = min(float(data.driveway_area_sqm), total_paving)
    else:
        driveway_area = total_paving * 0.45

    walkway_area = max(total_paving - driveway_area, 0.0)
    return total_paving, driveway_area, walkway_area


def derive_external_works_quantities(
    data: ExternalWorksInput,
    geometry: ExternalWorksGeometryModel,
    resolved_inputs: ExternalWorksResolvedInputs,
) -> ExternalWorksQuantityModel:
    total_paving_area, driveway_area, walkway_area = _resolve_hardscape_split(data=data, geometry=geometry)

    if data.landscaping_area_sqm is not None:
        landscaping_area = min(
            float(data.landscaping_area_sqm),
            max(geometry.open_external_area_sqm - total_paving_area, 0.0),
        )
    else:
        landscaping_area = min(
            geometry.softscape_candidate_area_sqm,
            max(geometry.open_external_area_sqm - total_paving_area, 0.0),
        )

    open_unallocated_area = max(geometry.open_external_area_sqm - total_paving_area - landscaping_area, 0.0)

    boundary_length = 0.0
    boundary_effective_length = 0.0
    wall_area = 0.0
    wall_blocks = 0
    wall_mortar = 0.0
    footing_concrete = 0.0
    column_concrete = 0.0
    column_reinf = 0.0
    post_count = 0
    mesh_length = 0.0
    precast_length = 0.0
    razor_wire_length = 0.0

    if data.perimeter_wall_enabled and data.perimeter_wall_type != "none":
        boundary_length = geometry.boundary_length_m
        boundary_effective_length = geometry.boundary_effective_length_m

        if data.perimeter_wall_type == "block_wall":
            wall_area = boundary_effective_length * data.perimeter_wall_height_m
            wall_blocks = ceil(wall_area * 12)
            wall_mortar = wall_blocks * 0.002

            footing_concrete = boundary_effective_length * 0.4 * 0.6
            post_count = max(4, ceil(boundary_effective_length / 3.0))
            column_concrete = post_count * 0.25 * 0.25 * data.perimeter_wall_height_m
            column_reinf = column_concrete * 15

        elif data.perimeter_wall_type == "chain_link":
            mesh_length = boundary_effective_length
            post_count = max(4, ceil(boundary_effective_length / 3.0))
            footing_concrete = post_count * 0.2 * 0.2 * 0.6

        elif data.perimeter_wall_type == "precast":
            precast_length = boundary_effective_length
            post_count = max(4, ceil(boundary_effective_length / 2.4))
            footing_concrete = post_count * 0.22 * 0.22 * 0.6

        if data.razor_wire:
            razor_wire_length = boundary_effective_length

    gate_count = data.gate_count if data.perimeter_wall_enabled and data.perimeter_wall_type != "none" else 0
    gate_width = float(data.gate_width_m) if gate_count > 0 else 0.0
    gate_leaf_equivalent_units = (gate_count * gate_width) / 3.0 if gate_count > 0 else 0.0

    biodigester_capacity_basis = max(
        int(data.biodigester_capacity_users),
        ceil(resolved_inputs.effective_total_floor_area_sqm / 25.0),
    )

    septic_concrete = 0.0
    septic_reinf = 0.0
    biodigester_units = 0
    sewer_connection_length = 0.0
    manholes_count = 0

    if data.sewerage_system == "septic_tank":
        septic_concrete = max(4.5, biodigester_capacity_basis * 0.45)
        septic_reinf = septic_concrete * 16
        sewer_connection_length = max(float(data.sewer_connection_length_m), 12.0)
        manholes_count = max(1, ceil(sewer_connection_length / 18.0))
    elif data.sewerage_system == "biodigester":
        biodigester_units = max(1, ceil(biodigester_capacity_basis / 8.0))
        sewer_connection_length = max(float(data.sewer_connection_length_m), 10.0 + (biodigester_units * 5.0))
        manholes_count = max(1, ceil(sewer_connection_length / 20.0))
    else:
        sewer_connection_length = max(float(data.sewer_connection_length_m), 5.0)
        manholes_count = max(1, ceil(sewer_connection_length / 15.0))

    drainage_length = float(data.drainage_length_m or geometry.drainage_candidate_length_m)

    kerbstone_length = (driveway_area * 0.35) + (walkway_area * 0.20)
    excavation_scope = drainage_length + sewer_connection_length
    if data.sewerage_system in {"septic_tank", "biodigester"}:
        excavation_scope += 12.0
    if data.perimeter_wall_enabled and data.perimeter_wall_type in {"block_wall", "precast"}:
        excavation_scope += boundary_effective_length * 0.10

    concrete_scope = footing_concrete + column_concrete + septic_concrete

    quality_factor = QUALITY_FACTOR.get(data.quality_level, 1.0)

    return ExternalWorksQuantityModel(
        plot_area_sqm=round(geometry.plot_area_sqm, 2),
        plot_perimeter_m=round(geometry.plot_perimeter_m, 2),
        building_footprint_area_sqm=round(geometry.building_footprint_area_sqm, 2),
        open_external_area_sqm=round(geometry.open_external_area_sqm, 2),
        hardscape_candidate_area_sqm=round(geometry.hardscape_candidate_area_sqm, 2),
        softscape_candidate_area_sqm=round(geometry.softscape_candidate_area_sqm, 2),
        open_area_unallocated_sqm=round(open_unallocated_area, 2),
        paving_area_sqm=round(total_paving_area, 2),
        driveway_area_sqm=round(driveway_area, 2),
        walkway_area_sqm=round(walkway_area, 2),
        drainage_length_m=round(drainage_length, 2),
        landscaping_area_sqm=round(landscaping_area, 2),
        kerbstone_length_m=round(kerbstone_length, 2),
        boundary_wall_length_m=round(boundary_effective_length, 2),
        boundary_wall_area_sqm=round(wall_area, 2),
        wall_blocks_count=wall_blocks,
        wall_mortar_volume_m3=round(wall_mortar, 2),
        wall_footing_concrete_volume_m3=round(footing_concrete, 2),
        column_concrete_volume_m3=round(column_concrete, 2),
        column_reinf_kg=round(column_reinf, 1),
        post_count=post_count,
        mesh_length_m=round(mesh_length, 2),
        precast_length_m=round(precast_length, 2),
        gate_count=gate_count,
        gate_width_m=round(gate_width, 2),
        gate_leaf_equivalent_units=round(gate_leaf_equivalent_units, 2),
        razor_wire_length_m=round(razor_wire_length, 2),
        septic_concrete_volume_m3=round(septic_concrete, 2),
        septic_reinforcement_kg=round(septic_reinf, 1),
        biodigester_units=biodigester_units,
        biodigester_capacity_basis_users=int(biodigester_capacity_basis),
        sewer_connection_length_m=round(sewer_connection_length, 2),
        manholes_count=manholes_count,
        excavation_scope_m=round(excavation_scope, 2),
        concrete_scope_m3=round(concrete_scope, 2),
        quality_factor=round(quality_factor, 3),
    )


def build_external_works_quantity_items(
    data: ExternalWorksInput,
    geometry: ExternalWorksGeometryModel,
    quantities: ExternalWorksQuantityModel,
    resolved_inputs: ExternalWorksResolvedInputs,
) -> list[QuantityItem]:
    return [
        QuantityItem(name="plot_area_sqm", value=quantities.plot_area_sqm, unit="sqm", formula="external_works.land_size_sqm"),
        QuantityItem(name="plot_perimeter_m", value=quantities.plot_perimeter_m, unit="m", formula="4 * sqrt(plot_area_sqm)"),
        QuantityItem(name="building_footprint_area_sqm", value=quantities.building_footprint_area_sqm, unit="sqm", formula="shared_geometry.footprint_area_sqm if available else clamped footprint fallback"),
        QuantityItem(name="open_external_area_sqm", value=quantities.open_external_area_sqm, unit="sqm", formula="plot_area_sqm - building_footprint_area_sqm"),
        QuantityItem(name="hardscape_candidate_area_sqm", value=quantities.hardscape_candidate_area_sqm, unit="sqm", formula="explicit hardscape override or open_external_area_sqm * 0.40"),
        QuantityItem(name="softscape_candidate_area_sqm", value=quantities.softscape_candidate_area_sqm, unit="sqm", formula="explicit landscaping override or open_external_area_sqm * 0.35"),
        QuantityItem(name="paving_area_sqm", value=quantities.paving_area_sqm, unit="sqm", formula="paving override or hardscape candidate after allocation clamp"),
        QuantityItem(name="drainage_length_m", value=quantities.drainage_length_m, unit="m", formula="drainage override or (boundary_length_m*0.55 + building_plan_perimeter_m*0.25), min 8m"),
        QuantityItem(name="landscaping_area_sqm", value=quantities.landscaping_area_sqm, unit="sqm", formula="landscaping override or softscape candidate, capped by remaining open area"),
        QuantityItem(name="boundary_wall_length_m", value=quantities.boundary_wall_length_m, unit="m", formula="(perimeter input or plot perimeter) - (gate_count*gate_width_m) when perimeter works are enabled"),
        QuantityItem(name="boundary_wall_area_sqm", value=quantities.boundary_wall_area_sqm, unit="sqm", formula="boundary_wall_length_m * perimeter_wall_height_m for block wall"),
        QuantityItem(name="wall_blocks_count", value=float(quantities.wall_blocks_count), unit="pcs", formula="ceil(boundary_wall_area_sqm * 12)"),
        QuantityItem(name="wall_mortar_volume_m3", value=quantities.wall_mortar_volume_m3, unit="m3", formula="wall_blocks_count * 0.002"),
        QuantityItem(name="wall_footing_concrete_volume_m3", value=quantities.wall_footing_concrete_volume_m3, unit="m3", formula="boundary_wall_length_m * 0.4 * 0.6 for block/precast post footings"),
        QuantityItem(name="post_count", value=float(quantities.post_count), unit="count", formula="max(4, ceil(boundary_wall_length_m / spacing)) for chain-link/precast/posts"),
        QuantityItem(name="mesh_length_m", value=quantities.mesh_length_m, unit="m", formula="boundary_wall_length_m when perimeter_wall_type == chain_link"),
        QuantityItem(name="gate_count", value=float(quantities.gate_count), unit="count", formula="input gate_count when perimeter works are enabled"),
        QuantityItem(name="gate_width_m", value=quantities.gate_width_m, unit="m", formula="input gate_width_m"),
        QuantityItem(name="gate_leaf_equivalent_units", value=quantities.gate_leaf_equivalent_units, unit="equiv_gate", formula="(gate_count * gate_width_m) / 3.0 standard gate-width basis"),
        QuantityItem(name="razor_wire_length_m", value=quantities.razor_wire_length_m, unit="m", formula="boundary_wall_length_m when razor_wire is enabled"),
        QuantityItem(name="septic_concrete_volume_m3", value=quantities.septic_concrete_volume_m3, unit="m3", formula="max(4.5, design_users*0.45) for septic_tank"),
        QuantityItem(name="septic_reinforcement_kg", value=quantities.septic_reinforcement_kg, unit="kg", formula="septic_concrete_volume_m3 * 16"),
        QuantityItem(name="biodigester_units", value=float(quantities.biodigester_units), unit="unit", formula="ceil(design_users/8) for biodigester system"),
        QuantityItem(name="biodigester_capacity_basis_users", value=float(quantities.biodigester_capacity_basis_users), unit="users", formula="max(input biodigester_capacity_users, ceil(effective_total_floor_area_sqm/25))"),
        QuantityItem(name="sewer_connection_length_m", value=quantities.sewer_connection_length_m, unit="m", formula="system-specific sewer length floor based on input and service type"),
        QuantityItem(name="manholes_count", value=float(quantities.manholes_count), unit="count", formula="max(1, ceil(sewer_connection_length_m / spacing_by_system))"),
        QuantityItem(name="effective_total_floor_area_sqm", value=resolved_inputs.effective_total_floor_area_sqm, unit="sqm", formula="shared_geometry.total_floor_area_sqm if available else external_works.floor_area_sqm"),
        QuantityItem(name="effective_building_footprint_sqm", value=resolved_inputs.effective_building_footprint_sqm, unit="sqm", formula="shared_geometry.footprint_area_sqm if available else fallback from floor area/plot"),
        QuantityItem(name="effective_building_plan_perimeter_m", value=resolved_inputs.effective_building_plan_perimeter_m, unit="m", formula="shared_geometry.equivalent_plan_perimeter_m if available else equivalent-square perimeter from footprint"),
        QuantityItem(name="open_area_unallocated_sqm", value=quantities.open_area_unallocated_sqm, unit="sqm", formula="open_external_area_sqm - paving_area_sqm - landscaping_area_sqm"),
        QuantityItem(name="quality_factor", value=quantities.quality_factor, unit="ratio", formula=f"quality_level == premium ? {QUALITY_FACTOR['premium']} : {QUALITY_FACTOR['standard']}"),
        QuantityItem(name="excavation_scope_m", value=quantities.excavation_scope_m, unit="m", formula="drainage_length_m + sewer_connection_length_m + sewer/footing excavation allowances"),
        QuantityItem(name="concrete_scope_m3", value=quantities.concrete_scope_m3, unit="m3", formula="wall_footing_concrete_volume_m3 + column_concrete_volume_m3 + septic_concrete_volume_m3"),
        QuantityItem(name="driveway_area_sqm", value=quantities.driveway_area_sqm, unit="sqm", formula="driveway override or 45% of paving allocation"),
        QuantityItem(name="walkway_area_sqm", value=quantities.walkway_area_sqm, unit="sqm", formula="paving_area_sqm - driveway_area_sqm"),
    ]


def quantify_external_works(
    data: ExternalWorksInput,
    geometry: ExternalWorksGeometryModel | None = None,
    resolved_inputs: ExternalWorksResolvedInputs | None = None,
) -> ExternalWorksQuantityModel:
    """
    Transitional compatibility helper used by legacy imports.
    """
    if resolved_inputs is None:
        plot_area = max(float(data.land_size_sqm), 1.0)
        floor_area = max(float(data.floor_area_sqm or plot_area * 0.40), 1.0)
        footprint = min(floor_area, plot_area * 0.65)
        resolved_inputs = ExternalWorksResolvedInputs(
            plot_area_sqm=plot_area,
            effective_total_floor_area_sqm=floor_area,
            effective_building_footprint_sqm=footprint,
            effective_building_plan_perimeter_m=4 * sqrt(max(footprint, 1.0)),
            used_geometry_floor_area=False,
            used_geometry_footprint=False,
            used_geometry_plan_perimeter=False,
        )

    if geometry is None:
        geometry = derive_external_works_geometry(data=data, resolved_inputs=resolved_inputs)

    return derive_external_works_quantities(
        data=data,
        geometry=geometry,
        resolved_inputs=resolved_inputs,
    )
