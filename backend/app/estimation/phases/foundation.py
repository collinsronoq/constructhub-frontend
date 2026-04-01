import math

from app.estimation.geometry.building_geometry_resolver import ResolvedGeometry
from app.estimation.schemas.foundation import FoundationInput
from app.estimation.common_schemas import (
    CostItem,
    PhaseEstimate,
    PhaseMetadata,
    QuantityItem,
    build_phase_totals,
)


def _safe_ceil(value: float) -> int:
    return max(1, math.ceil(value))


def _days_for(quantity: float, productivity_per_day: float) -> int:
    if quantity <= 0 or productivity_per_day <= 0:
        return 0
    return _safe_ceil(quantity / productivity_per_day)


def estimate_foundation(data: FoundationInput, geometry: ResolvedGeometry) -> PhaseEstimate:
    """
    Quantity-driven Foundation v2 estimator.
    Boundary note:
      - Includes trench-only structural excavation + backfill around foundation.
      - Excludes bulk excavation/topsoil stripping/spoil disposal (handled in Site Preparation).
    """

    floor_area_sqm = max(float(geometry.resolved_foundation_area_sqm or 0), 1.0)

    soil_depth_factor = {
        "soft": 1.15,
        "medium": 1.0,
        "rocky": 0.9,
    }.get(data.soil_type, 1.0)

    soil_excavation_productivity_factor = {
        "soft": 0.85,
        "medium": 1.0,
        "rocky": 0.65,
    }.get(data.soil_type, 1.0)

    soil_labour_rate_factor = {
        "soft": 1.1,
        "medium": 1.0,
        "rocky": 1.25,
    }.get(data.soil_type, 1.0)

    quality_multiplier = 1.0 if data.quality_level == "standard" else 1.12

    foundation_perimeter_m = max(float(geometry.equivalent_square_perimeter_m or 0), 4.0)
    trench_width_m = 0.60 if data.quality_level == "standard" else 0.70

    if data.foundation_type == "strip":
        trench_length_m = foundation_perimeter_m * 1.20
        trench_depth_m = (1.00 if data.quality_level == "standard" else 1.10) * soil_depth_factor
        blinding_thickness_m = 0.05
        footing_thickness_m = 0.25 if data.quality_level == "standard" else 0.30
        footing_width_m = trench_width_m * 0.90
        foundation_wall_height_m = 0.60 if data.quality_level == "standard" else 0.75
        foundation_wall_thickness_m = 0.20
        hardcore_thickness_m = 0.15 if data.quality_level == "standard" else 0.18

        trench_excavation_volume_m3 = trench_length_m * trench_width_m * trench_depth_m
        blinding_volume_m3 = trench_length_m * trench_width_m * blinding_thickness_m
        concrete_volume_m3 = trench_length_m * footing_width_m * footing_thickness_m
        foundation_wall_volume_m3 = trench_length_m * foundation_wall_thickness_m * foundation_wall_height_m
        foundation_wall_area_sqm = trench_length_m * foundation_wall_height_m
        hardcore_volume_m3 = floor_area_sqm * hardcore_thickness_m
        dpm_area_sqm = floor_area_sqm * 1.05
        formwork_area_sqm = trench_length_m * 2 * footing_thickness_m if data.include_formwork else 0.0
        backfill_volume_m3 = max(
            trench_excavation_volume_m3 - (blinding_volume_m3 + concrete_volume_m3 + foundation_wall_volume_m3),
            0.0,
        )
        rebar_density_kg_per_m3 = 75.0
    else:
        trench_length_m = foundation_perimeter_m
        trench_depth_m = (0.60 if data.quality_level == "standard" else 0.70) * soil_depth_factor
        blinding_thickness_m = 0.05
        raft_thickness_m = 0.20 if data.quality_level == "standard" else 0.25
        edge_beam_width_m = 0.30
        edge_beam_depth_m = 0.50 if data.quality_level == "standard" else 0.60
        hardcore_thickness_m = 0.20 if data.quality_level == "standard" else 0.25

        trench_excavation_volume_m3 = trench_length_m * trench_width_m * trench_depth_m
        blinding_volume_m3 = floor_area_sqm * blinding_thickness_m
        edge_beam_volume_m3 = trench_length_m * edge_beam_width_m * edge_beam_depth_m
        concrete_volume_m3 = (floor_area_sqm * raft_thickness_m) + edge_beam_volume_m3
        foundation_wall_volume_m3 = 0.0
        foundation_wall_area_sqm = 0.0
        hardcore_volume_m3 = floor_area_sqm * hardcore_thickness_m
        dpm_area_sqm = floor_area_sqm * 1.08
        formwork_area_sqm = trench_length_m * (raft_thickness_m + edge_beam_depth_m) if data.include_formwork else 0.0
        backfill_volume_m3 = max(trench_excavation_volume_m3 - edge_beam_volume_m3, 0.0)
        rebar_density_kg_per_m3 = 95.0

    rebar_weight_kg = concrete_volume_m3 * rebar_density_kg_per_m3 * 1.08

    concrete_related_volume_m3 = concrete_volume_m3 + blinding_volume_m3
    wall_mortar_volume_m3 = foundation_wall_volume_m3 * 0.30

    cement_bags = (
        concrete_related_volume_m3 * 6.8
        + wall_mortar_volume_m3 * 7.5
    ) * 1.05
    sand_tons = (
        concrete_related_volume_m3 * 0.50
        + wall_mortar_volume_m3 * 1.20
    ) * 1.05
    ballast_tons = (concrete_related_volume_m3 * 0.80) * 1.05
    hardcore_qty_m3 = hardcore_volume_m3 * 1.05
    dpm_qty_sqm = dpm_area_sqm
    reinforcement_qty_kg = rebar_weight_kg

    blocks_qty = 0.0
    if data.foundation_type == "strip" and foundation_wall_volume_m3 > 0:
        blocks_qty = foundation_wall_volume_m3 * 62.5 * 1.05

    formwork_material_qty_sqm = formwork_area_sqm * 1.05 if data.include_formwork else 0.0

    material_items = [
        CostItem(
            item_code="cement_50kg",
            description="Cement (50kg bags) for blinding/concrete/mortar",
            unit="bag",
            quantity=round(cement_bags, 1),
            unit_rate=round(750.0 * quality_multiplier, 2),
            total=round(cement_bags * 750.0 * quality_multiplier),
            category="material",
            source="assumed",
            confidence="medium",
        ),
        CostItem(
            item_code="sand",
            description="Sand for concrete and mortar",
            unit="ton",
            quantity=round(sand_tons, 2),
            unit_rate=round(2200.0 * quality_multiplier, 2),
            total=round(sand_tons * 2200.0 * quality_multiplier),
            category="material",
            source="assumed",
            confidence="medium",
        ),
        CostItem(
            item_code="ballast",
            description="Ballast (coarse aggregate) for concrete",
            unit="ton",
            quantity=round(ballast_tons, 2),
            unit_rate=round(2600.0 * quality_multiplier, 2),
            total=round(ballast_tons * 2600.0 * quality_multiplier),
            category="material",
            source="assumed",
            confidence="medium",
        ),
        CostItem(
            item_code="hardcore_fill",
            description="Hardcore fill",
            unit="m3",
            quantity=round(hardcore_qty_m3, 2),
            unit_rate=round(1800.0 * quality_multiplier, 2),
            total=round(hardcore_qty_m3 * 1800.0 * quality_multiplier),
            category="material",
            source="assumed",
            confidence="medium",
        ),
        CostItem(
            item_code="dpm",
            description="Damp proof membrane (DPM)",
            unit="sqm",
            quantity=round(dpm_qty_sqm, 2),
            unit_rate=round(180.0 * quality_multiplier, 2),
            total=round(dpm_qty_sqm * 180.0 * quality_multiplier),
            category="material",
            source="assumed",
            confidence="medium",
        ),
        CostItem(
            item_code="reinforcement_steel",
            description="Reinforcement steel bars",
            unit="kg",
            quantity=round(reinforcement_qty_kg, 1),
            unit_rate=round(165.0 * quality_multiplier, 2),
            total=round(reinforcement_qty_kg * 165.0 * quality_multiplier),
            category="material",
            source="assumed",
            confidence="medium",
        ),
    ]

    if blocks_qty > 0:
        material_items.append(
            CostItem(
                item_code="foundation_blocks",
                description="Foundation wall blocks",
                unit="piece",
                quantity=round(blocks_qty, 0),
                unit_rate=round(85.0 * quality_multiplier, 2),
                total=round(blocks_qty * 85.0 * quality_multiplier),
                category="material",
                source="assumed",
                confidence="medium",
            )
        )

    if formwork_material_qty_sqm > 0:
        material_items.append(
            CostItem(
                item_code="formwork_timber_ply",
                description="Formwork timber/plywood",
                unit="sqm",
                quantity=round(formwork_material_qty_sqm, 2),
                unit_rate=round(650.0 * quality_multiplier, 2),
                total=round(formwork_material_qty_sqm * 650.0 * quality_multiplier),
                category="material",
                source="assumed",
                confidence="medium",
            )
        )

    excavation_days = _days_for(trench_excavation_volume_m3, 10.0 * soil_excavation_productivity_factor)
    concrete_days = _days_for(concrete_related_volume_m3, 6.0)
    steel_fixing_days = _days_for(reinforcement_qty_kg, 450.0)
    masonry_days = _days_for(foundation_wall_area_sqm, 12.0)
    formwork_days = _days_for(formwork_area_sqm, 18.0) if data.include_formwork else 0
    backfill_days = _days_for(backfill_volume_m3, 14.0 * soil_excavation_productivity_factor)
    supervision_days = _safe_ceil(
        (excavation_days + concrete_days + steel_fixing_days + masonry_days + formwork_days + backfill_days) * 0.60
    )

    labour_items: list[CostItem] = []
    if excavation_days > 0:
        labour_items.append(
            CostItem(
                item_code="trench_excavation_crew",
                description="Foundation trench excavation crew",
                unit="crew_day",
                quantity=float(excavation_days),
                unit_rate=round(6800.0 * soil_labour_rate_factor, 2),
                total=round(excavation_days * 6800.0 * soil_labour_rate_factor),
                category="labour",
                source="assumed",
                confidence="medium",
            )
        )
    if concrete_days > 0:
        labour_items.append(
            CostItem(
                item_code="concrete_crew",
                description="Blinding and concrete placement crew",
                unit="crew_day",
                quantity=float(concrete_days),
                unit_rate=round(9800.0 * quality_multiplier, 2),
                total=round(concrete_days * 9800.0 * quality_multiplier),
                category="labour",
                source="assumed",
                confidence="medium",
            )
        )
    if steel_fixing_days > 0:
        labour_items.append(
            CostItem(
                item_code="steel_fixing_crew",
                description="Steel fixing crew",
                unit="crew_day",
                quantity=float(steel_fixing_days),
                unit_rate=round(8600.0 * quality_multiplier, 2),
                total=round(steel_fixing_days * 8600.0 * quality_multiplier),
                category="labour",
                source="assumed",
                confidence="medium",
            )
        )
    if masonry_days > 0:
        labour_items.append(
            CostItem(
                item_code="foundation_masonry_crew",
                description="Foundation wall masonry crew",
                unit="crew_day",
                quantity=float(masonry_days),
                unit_rate=round(7600.0 * quality_multiplier, 2),
                total=round(masonry_days * 7600.0 * quality_multiplier),
                category="labour",
                source="assumed",
                confidence="medium",
            )
        )
    if formwork_days > 0:
        labour_items.append(
            CostItem(
                item_code="formwork_crew",
                description="Formwork crew",
                unit="crew_day",
                quantity=float(formwork_days),
                unit_rate=round(7800.0 * quality_multiplier, 2),
                total=round(formwork_days * 7800.0 * quality_multiplier),
                category="labour",
                source="assumed",
                confidence="medium",
            )
        )
    if backfill_days > 0:
        labour_items.append(
            CostItem(
                item_code="backfill_compaction_crew",
                description="Backfill and compaction crew",
                unit="crew_day",
                quantity=float(backfill_days),
                unit_rate=round(6000.0 * soil_labour_rate_factor, 2),
                total=round(backfill_days * 6000.0 * soil_labour_rate_factor),
                category="labour",
                source="assumed",
                confidence="medium",
            )
        )

    labour_items.append(
        CostItem(
            item_code="foundation_foreman",
            description="Foundation foreman/supervision",
            unit="day",
            quantity=float(supervision_days),
            unit_rate=3500.0,
            total=round(supervision_days * 3500.0),
            category="labour",
            source="assumed",
            confidence="medium",
        )
    )

    equipment_items: list[CostItem] = []
    if concrete_days > 0:
        equipment_items.append(
            CostItem(
                item_code="concrete_mixer_hire",
                description="Concrete mixer hire",
                unit="machine_day",
                quantity=float(concrete_days),
                unit_rate=round(6500.0 * quality_multiplier, 2),
                total=round(concrete_days * 6500.0 * quality_multiplier),
                category="equipment",
                source="fixed_service",
                confidence="medium",
            )
        )
        equipment_items.append(
            CostItem(
                item_code="concrete_vibrator_hire",
                description="Concrete vibrator hire",
                unit="machine_day",
                quantity=float(concrete_days),
                unit_rate=round(2200.0 * quality_multiplier, 2),
                total=round(concrete_days * 2200.0 * quality_multiplier),
                category="equipment",
                source="fixed_service",
                confidence="medium",
            )
        )
    if steel_fixing_days > 0:
        equipment_items.append(
            CostItem(
                item_code="rebar_tools_hire",
                description="Rebar cutting/bending tools hire",
                unit="machine_day",
                quantity=float(steel_fixing_days),
                unit_rate=round(1800.0 * quality_multiplier, 2),
                total=round(steel_fixing_days * 1800.0 * quality_multiplier),
                category="equipment",
                source="fixed_service",
                confidence="medium",
            )
        )
    if backfill_days > 0:
        equipment_items.append(
            CostItem(
                item_code="compaction_equipment_hire",
                description="Backfill compaction equipment hire",
                unit="machine_day",
                quantity=float(backfill_days),
                unit_rate=round(3500.0 * quality_multiplier, 2),
                total=round(backfill_days * 3500.0 * quality_multiplier),
                category="equipment",
                source="fixed_service",
                confidence="medium",
            )
        )

    other_costs: list[CostItem] = []

    quantities = [
        QuantityItem(name="foundation_perimeter_m", value=round(foundation_perimeter_m, 2), unit="m", formula="shared_geometry.equivalent_square_perimeter_m"),
        QuantityItem(name="trench_length_m", value=round(trench_length_m, 2), unit="m", formula="perimeter * 1.20 (strip) or perimeter (raft)"),
        QuantityItem(name="trench_width_m", value=round(trench_width_m, 2), unit="m", formula="0.60m standard strip/raft trench width, 0.70m premium"),
        QuantityItem(name="trench_depth_m", value=round(trench_depth_m, 2), unit="m", formula="base trench depth adjusted by soil depth factor"),
        QuantityItem(name="trench_excavation_volume_m3", value=round(trench_excavation_volume_m3, 2), unit="m3", formula="trench_length_m * trench_width_m * trench_depth_m"),
        QuantityItem(name="blinding_volume_m3", value=round(blinding_volume_m3, 2), unit="m3", formula="blinding thickness * trench area (strip) or floor area (raft)"),
        QuantityItem(name="hardcore_volume_m3", value=round(hardcore_volume_m3, 2), unit="m3", formula="shared_geometry.resolved_foundation_area_sqm * hardcore_thickness_m"),
        QuantityItem(name="concrete_volume_m3", value=round(concrete_volume_m3, 2), unit="m3", formula="strip footing volume or raft slab + edge beam"),
        QuantityItem(name="backfill_volume_m3", value=round(backfill_volume_m3, 2), unit="m3", formula="trench_excavation_volume - occupied structural volumes"),
        QuantityItem(name="dpm_area_sqm", value=round(dpm_area_sqm, 2), unit="sqm", formula="shared_geometry.resolved_foundation_area_sqm * overlap factor"),
        QuantityItem(name="formwork_area_sqm", value=round(formwork_area_sqm, 2), unit="sqm", formula="formwork contact area (if include_formwork)"),
        QuantityItem(name="rebar_weight_kg", value=round(rebar_weight_kg, 1), unit="kg", formula="concrete_volume_m3 * steel_density_kg_per_m3 * 1.08"),
        QuantityItem(name="foundation_wall_volume_m3", value=round(foundation_wall_volume_m3, 2), unit="m3", formula="strip only: trench_length * wall_thickness * wall_height"),
        QuantityItem(name="foundation_wall_area_sqm", value=round(foundation_wall_area_sqm, 2), unit="sqm", formula="strip only: trench_length * wall_height"),
    ]

    assumptions = [
        "Core foundation geometry (area/perimeter) is consumed from the shared building geometry resolver.",
        "Foundation excavation is trench-only structural excavation; bulk earthworks/topsoil stripping/spoil disposal are handled in Site Preparation.",
        "Strip foundations apply a 20% trench-length uplift to represent internal load-bearing wall lines.",
        "Quality level changes section dimensions and selected rates (premium uplift).",
        "Soil type affects trench depth assumptions and excavation productivity/rates.",
        "Material quantities include explicit waste/overlap allowances (concrete constituents, rebar, blocks, formwork, hardcore, DPM).",
    ]
    assumptions.extend(f"Geometry: {item}" for item in geometry.assumptions)

    notes = [
        "Blinding, hardcore, DPM, reinforcement, formwork, structural concrete, foundation wall (strip), and trench backfill are explicitly modeled.",
        "Foundation phase excludes superstructure walls above DPC and any finish-related works.",
        "Spoil disposal fees are intentionally excluded here to avoid double counting with Site Preparation.",
    ]

    warnings = ["Rates are static and not vendor-sourced."]
    warnings.extend(geometry.warnings)
    if geometry.caps_applied:
        warnings.append(f"Shared geometry caps applied: {', '.join(geometry.caps_applied)}.")
    if floor_area_sqm > 900:
        warnings.append("Large floor area increases uncertainty under equivalent-square geometry assumptions.")

    totals = build_phase_totals(
        materials=material_items,
        labour=labour_items,
        equipment=equipment_items,
        other_costs=other_costs,
    )

    return PhaseEstimate(
        phase="foundation",
        phase_id="foundation",
        phase_name="Foundation",
        inputs_used={
            "foundation_type": data.foundation_type,
            "floor_area_sqm": floor_area_sqm,
            "soil_type": data.soil_type,
            "quality_level": data.quality_level,
            "include_formwork": data.include_formwork,
            "geometry_area_source": geometry.area_source,
            "geometry_total_floor_area_sqm": geometry.total_floor_area_sqm,
            "geometry_footprint_area_sqm": geometry.footprint_area_sqm,
            "geometry_storeys": geometry.storeys,
            "geometry_fits_plot_constraints": geometry.fits_plot_constraints,
            "geometry_caps_applied": geometry.caps_applied,
        },
        quantities=quantities,
        materials=material_items,
        labour=labour_items,
        equipment=equipment_items,
        other_costs=other_costs,
        totals=totals,
        assumptions=assumptions,
        notes=notes,
        warnings=warnings,
        metadata=PhaseMetadata(
            version="v2",
            pricing_source="static",
            confidence="medium",
        ),
    )
