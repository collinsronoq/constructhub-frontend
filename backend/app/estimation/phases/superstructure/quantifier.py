from __future__ import annotations

from math import ceil

from app.estimation.common_schemas import QuantityItem
from app.estimation.geometry.building_geometry_resolver import ResolvedGeometry
from app.estimation.phases.superstructure.schemas import (
    SuperstructureInput,
    SuperstructurePhaseGeometry,
    SuperstructureQuantityModel,
)


def _safe_ceil(value: float) -> int:
    return max(1, ceil(value))

def derive_quantity_model(
    data: SuperstructureInput,
    phase_geometry: SuperstructurePhaseGeometry,
) -> SuperstructureQuantityModel:
    blocks_per_sqm = {
        "burnt_bricks": 60.0,
        "concrete_blocks": 12.5,
        "machine_cut_blocks": 10.0,
    }.get(data.blockwork_type, 12.5)
    block_count = _safe_ceil(phase_geometry.net_wall_area * blocks_per_sqm * 1.05)

    mortar_consumption_per_sqm = {
        "burnt_bricks": 0.030,
        "concrete_blocks": 0.015,
        "machine_cut_blocks": 0.012,
    }.get(data.blockwork_type, 0.015)
    mortar_volume_m3 = phase_geometry.net_wall_area * mortar_consumption_per_sqm

    # Mortar rule (mandatory): derive mortar constituents from mix ratio, never buy "mortar".
    mortar_mix_cement = 1.0
    mortar_mix_sand = 4.0
    mortar_parts = mortar_mix_cement + mortar_mix_sand
    dry_volume_factor = 1.33

    mortar_dry_volume_m3 = mortar_volume_m3 * dry_volume_factor
    mortar_cement_volume_m3 = mortar_dry_volume_m3 * (mortar_mix_cement / mortar_parts)
    mortar_sand_volume_m3 = mortar_dry_volume_m3 * (mortar_mix_sand / mortar_parts)

    mortar_cement_bags = (mortar_cement_volume_m3 / 0.0347) * 1.05
    mortar_sand_tons = (mortar_sand_volume_m3 * 1.6) * 1.05

    beam_concrete_volume = (
        phase_geometry.beam_length_m
        * phase_geometry.beam_width_m
        * phase_geometry.beam_depth_m
    ) + (
        phase_geometry.lintel_length_m
        * phase_geometry.lintel_width_m
        * phase_geometry.lintel_depth_m
    )
    column_concrete_volume = (
        phase_geometry.column_count
        * (phase_geometry.column_size_m**2)
        * phase_geometry.wall_height_m
    )
    slab_concrete_volume = phase_geometry.slab_area * phase_geometry.slab_thickness_m
    concrete_volume_total = beam_concrete_volume + column_concrete_volume + slab_concrete_volume

    concrete_cement_bags = concrete_volume_total * 6.8 * 1.05
    concrete_sand_tons = concrete_volume_total * 0.50 * 1.05
    concrete_ballast_tons = concrete_volume_total * 0.80 * 1.05

    beam_rebar_kg = beam_concrete_volume * 120.0
    column_rebar_kg = column_concrete_volume * 140.0
    slab_rebar_kg = slab_concrete_volume * 90.0
    rebar_weight_kg = (beam_rebar_kg + column_rebar_kg + slab_rebar_kg) * 1.08

    return SuperstructureQuantityModel(
        blocks_per_sqm=blocks_per_sqm,
        block_count=block_count,
        mortar_consumption_per_sqm=mortar_consumption_per_sqm,
        mortar_volume_m3=mortar_volume_m3,
        mortar_mix_cement=mortar_mix_cement,
        mortar_mix_sand=mortar_mix_sand,
        mortar_parts=mortar_parts,
        dry_volume_factor=dry_volume_factor,
        mortar_dry_volume_m3=mortar_dry_volume_m3,
        mortar_cement_volume_m3=mortar_cement_volume_m3,
        mortar_sand_volume_m3=mortar_sand_volume_m3,
        mortar_cement_bags=mortar_cement_bags,
        mortar_sand_tons=mortar_sand_tons,
        beam_concrete_volume=beam_concrete_volume,
        column_concrete_volume=column_concrete_volume,
        slab_concrete_volume=slab_concrete_volume,
        concrete_volume_total=concrete_volume_total,
        concrete_cement_bags=concrete_cement_bags,
        concrete_sand_tons=concrete_sand_tons,
        concrete_ballast_tons=concrete_ballast_tons,
        beam_rebar_kg=beam_rebar_kg,
        column_rebar_kg=column_rebar_kg,
        slab_rebar_kg=slab_rebar_kg,
        rebar_weight_kg=rebar_weight_kg,
    )


def build_quantity_items(
    shared_geometry: ResolvedGeometry,
    phase_geometry: SuperstructurePhaseGeometry,
    quantity_model: SuperstructureQuantityModel,
) -> list[QuantityItem]:
    return [
        QuantityItem(
            name="total_floor_area_sqm",
            value=round(phase_geometry.total_floor_area_sqm, 2),
            unit="sqm",
            formula="shared_geometry.total_floor_area_sqm",
        ),
        QuantityItem(
            name="footprint_area_sqm",
            value=round(phase_geometry.footprint_area_sqm, 2),
            unit="sqm",
            formula="shared_geometry.footprint_area_sqm",
        ),
        QuantityItem(
            name="external_perimeter_m",
            value=round(phase_geometry.external_perimeter_m, 2),
            unit="m",
            formula="shared_geometry.equivalent_square_perimeter_m",
        ),
        QuantityItem(
            name="external_wall_area",
            value=round(phase_geometry.external_wall_area, 2),
            unit="sqm",
            formula="external_perimeter * wall_height * storeys",
        ),
        QuantityItem(
            name="internal_wall_area",
            value=round(phase_geometry.internal_wall_area, 2),
            unit="sqm",
            formula="external_wall_area * internal_wall_ratio",
        ),
        QuantityItem(
            name="total_wall_area",
            value=round(phase_geometry.total_wall_area, 2),
            unit="sqm",
            formula="external_wall_area + internal_wall_area",
        ),
        QuantityItem(
            name="door_area",
            value=round(phase_geometry.door_area, 2),
            unit="sqm",
            formula="door_count * 1.89",
        ),
        QuantityItem(
            name="window_area",
            value=round(phase_geometry.window_area, 2),
            unit="sqm",
            formula="window_count * 1.44",
        ),
        QuantityItem(
            name="net_wall_area",
            value=round(phase_geometry.net_wall_area, 2),
            unit="sqm",
            formula="total_wall_area - openings_area",
        ),
        QuantityItem(
            name="slab_area",
            value=round(phase_geometry.slab_area, 2),
            unit="sqm",
            formula="upper suspended slab area + flat roof slab area (if flat roof)",
        ),
        QuantityItem(
            name="beam_length",
            value=round(phase_geometry.beam_length_m, 2),
            unit="m",
            formula="external_perimeter * storeys * 1.35",
        ),
        QuantityItem(
            name="column_count",
            value=float(phase_geometry.column_count),
            unit="count",
            formula="columns_per_floor * storeys",
        ),
        QuantityItem(
            name="block_count",
            value=float(quantity_model.block_count),
            unit="piece",
            formula="ceil(net_wall_area * blocks_per_sqm * 1.05)",
        ),
        QuantityItem(
            name="wall_area_sqm",
            value=round(phase_geometry.net_wall_area, 2),
            unit="sqm",
            formula="net_wall_area",
        ),
        QuantityItem(
            name="mortar_volume_m3",
            value=round(quantity_model.mortar_volume_m3, 2),
            unit="m3",
            formula="net_wall_area * mortar_consumption_per_sqm",
        ),
        QuantityItem(
            name="beam_concrete_volume",
            value=round(quantity_model.beam_concrete_volume, 2),
            unit="m3",
            formula="beam concrete + lintel concrete",
        ),
        QuantityItem(
            name="slab_concrete_volume",
            value=round(quantity_model.slab_concrete_volume, 2),
            unit="m3",
            formula="slab_area * slab_thickness",
        ),
        QuantityItem(
            name="column_concrete_volume",
            value=round(quantity_model.column_concrete_volume, 2),
            unit="m3",
            formula="column_count * column_size^2 * wall_height",
        ),
        QuantityItem(
            name="rebar_weight_kg",
            value=round(quantity_model.rebar_weight_kg, 1),
            unit="kg",
            formula="(beam+column+slab rebar) * 1.08",
        ),
    ]
