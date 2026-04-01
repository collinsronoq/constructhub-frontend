from math import ceil

from app.estimation.base_materials.loader import load_base_materials
from app.estimation.common_schemas import (
    CostItem,
    PhaseEstimate,
    PhaseMetadata,
    QuantityItem,
    build_phase_totals,
)
from app.estimation.geometry.building_geometry_resolver import ResolvedGeometry
from app.estimation.logic.price_resolver import resolve_material_price
from app.estimation.schemas.superstructure import SuperstructureInput


def _safe_ceil(value: float) -> int:
    return max(1, ceil(value))


def _days_for(quantity: float, productivity_per_day: float, complexity_factor: float = 1.0) -> int:
    if quantity <= 0 or productivity_per_day <= 0:
        return 0
    return _safe_ceil((quantity / productivity_per_day) * complexity_factor)


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

    total_floor_area_sqm = max(float(geometry.total_floor_area_sqm or 0), 1.0)
    storeys = max(1, int(geometry.storeys or 1))
    footprint_area_sqm = max(float(geometry.footprint_area_sqm or 0), 1.0)

    wall_height_m = 2.5
    wall_thickness_m = 0.15

    external_perimeter_m = max(float(geometry.equivalent_square_perimeter_m or 0), 1.0)
    external_wall_area = external_perimeter_m * wall_height_m * storeys

    base_room_count = (
        data.bedrooms
        + data.master_bedrooms
        + data.bathrooms
        + data.living_rooms
        + data.dining_rooms
        + data.kitchens
    )
    additional_room_count = sum(item.count for item in (data.additional_rooms or {}).values())
    total_room_count = base_room_count + additional_room_count

    internal_wall_ratio = 0.45
    if total_room_count > 10:
        internal_wall_ratio += 0.08
    if data.room_size_preference == "compact":
        internal_wall_ratio += 0.10
    elif data.room_size_preference == "spacious":
        internal_wall_ratio -= 0.05
    if storeys >= 3:
        internal_wall_ratio += 0.05
    internal_wall_ratio = max(0.30, min(internal_wall_ratio, 0.90))

    internal_wall_area = external_wall_area * internal_wall_ratio
    total_wall_area = external_wall_area + internal_wall_area

    door_count = total_room_count + 2
    window_count = (
        data.bedrooms * 2
        + data.master_bedrooms * 2
        + data.bathrooms * 1
        + data.living_rooms * 3
        + data.dining_rooms * 2
        + data.kitchens * 1
        + additional_room_count * 1
    )

    # try to understand the door and windows area calculation
    door_area = door_count * 1.89
    window_area = window_count * 1.44
    openings_area = door_area + window_area

    openings_cap = total_wall_area * 0.35
    openings_capped = False
    if openings_area > openings_cap:
        openings_area = openings_cap
        openings_capped = True

    net_wall_area = max(total_wall_area - openings_area, total_wall_area * 0.45)

    blocks_per_sqm = {
        "burnt_bricks": 60.0,
        "concrete_blocks": 12.5,
        "machine_cut_blocks": 10.0,
    }.get(data.blockwork_type, 12.5)
    block_count = _safe_ceil(net_wall_area * blocks_per_sqm * 1.05)

    mortar_consumption_per_sqm = {
        "burnt_bricks": 0.030,
        "concrete_blocks": 0.015,
        "machine_cut_blocks": 0.012,
    }.get(data.blockwork_type, 0.015)
    mortar_volume_m3 = net_wall_area * mortar_consumption_per_sqm

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

    grid_spacing_m = {
        "compact": 4.0,
        "standard": 4.5,
        "spacious": 5.0,
    }.get(data.room_size_preference, 4.5)
    column_count_per_floor = max(4, _safe_ceil(footprint_area_sqm / (grid_spacing_m**2)))
    column_count = column_count_per_floor * storeys

    beam_length_m = external_perimeter_m * storeys * 1.35
    lintel_length_m = (door_count * 1.2) + (window_count * 1.5)

    column_size_m = 0.25 if data.finishing_level == "standard" else 0.30
    beam_width_m = 0.23
    beam_depth_m = 0.40 if storeys > 1 else 0.30
    lintel_width_m = 0.20
    lintel_depth_m = 0.15

    suspended_slab_area = footprint_area_sqm * max(0, storeys - 1)
    roof_slab_area = footprint_area_sqm if data.roof_type == "flat" else 0.0
    slab_area = suspended_slab_area + roof_slab_area
    slab_thickness_m = {
        "standard": 0.125,
        "premium": 0.140,
        "luxury": 0.160,
    }.get(data.finishing_level, 0.125)

    beam_concrete_volume = (beam_length_m * beam_width_m * beam_depth_m) + (
        lintel_length_m * lintel_width_m * lintel_depth_m
    )
    column_concrete_volume = column_count * (column_size_m**2) * wall_height_m
    slab_concrete_volume = slab_area * slab_thickness_m
    concrete_volume_total = beam_concrete_volume + column_concrete_volume + slab_concrete_volume

    concrete_cement_bags = concrete_volume_total * 6.8 * 1.05
    concrete_sand_tons = concrete_volume_total * 0.50 * 1.05
    concrete_ballast_tons = concrete_volume_total * 0.80 * 1.05

    beam_rebar_kg = beam_concrete_volume * 120.0
    column_rebar_kg = column_concrete_volume * 140.0
    slab_rebar_kg = slab_concrete_volume * 90.0
    rebar_weight_kg = (beam_rebar_kg + column_rebar_kg + slab_rebar_kg) * 1.08

    base_prices = load_base_materials().get("superstructure_materials", {})
    if not base_prices:
        raise ValueError("Base prices for superstructure (superstructure_materials) not found.")
    vendor_prices = vendor_prices or {}

    def get_price(key: str, variant: str | None = None, vendor_key: str | None = None) -> float:
        vp = vendor_prices.get(vendor_key or key)
        return resolve_material_price(
            material_key=key,
            variant=variant,
            base_prices=base_prices,
            vendor_price=vp,
        )

    block_price = get_price("blockwork", variant=data.blockwork_type, vendor_key="blockwork")
    cement_price = get_price("cement")
    sand_price = get_price("sand")
    ballast_price = get_price("ballast")
    steel_price = get_price("reinforcement")

    materials = [
        CostItem(
            item_code="blockwork_units",
            description=f"{data.blockwork_type.replace('_', ' ').title()} masonry units",
            unit="piece",
            quantity=float(block_count),
            unit_rate=block_price,
            total=round(block_count * block_price),
            category="material",
            source="vendor" if vendor_prices.get("blockwork") else "rate_table",
            confidence="medium",
        ),
        CostItem(
            item_code="cement_for_mortar",
            description="Cement for masonry mortar (derived from 1:4 mix)",
            unit="bag",
            quantity=round(mortar_cement_bags, 1),
            unit_rate=cement_price,
            total=round(mortar_cement_bags * cement_price),
            category="material",
            source="vendor" if vendor_prices.get("cement") else "rate_table",
            confidence="medium",
        ),
        CostItem(
            item_code="sand_for_mortar",
            description="Sand for masonry mortar (derived from 1:4 mix)",
            unit="ton",
            quantity=round(mortar_sand_tons, 2),
            unit_rate=sand_price,
            total=round(mortar_sand_tons * sand_price),
            category="material",
            source="vendor" if vendor_prices.get("sand") else "rate_table",
            confidence="medium",
        ),
        CostItem(
            item_code="cement_for_concrete",
            description="Cement for RC concrete (columns/beams/slab)",
            unit="bag",
            quantity=round(concrete_cement_bags, 1),
            unit_rate=cement_price,
            total=round(concrete_cement_bags * cement_price),
            category="material",
            source="vendor" if vendor_prices.get("cement") else "rate_table",
            confidence="medium",
        ),
        CostItem(
            item_code="sand_for_concrete",
            description="Sand for RC concrete",
            unit="ton",
            quantity=round(concrete_sand_tons, 2),
            unit_rate=sand_price,
            total=round(concrete_sand_tons * sand_price),
            category="material",
            source="vendor" if vendor_prices.get("sand") else "rate_table",
            confidence="medium",
        ),
        CostItem(
            item_code="ballast_for_concrete",
            description="Ballast for RC concrete",
            unit="ton",
            quantity=round(concrete_ballast_tons, 2),
            unit_rate=ballast_price,
            total=round(concrete_ballast_tons * ballast_price),
            category="material",
            source="vendor" if vendor_prices.get("ballast") else "rate_table",
            confidence="medium",
        ),
        CostItem(
            item_code="reinforcement_steel",
            description="Reinforcement steel for beams/columns/slab",
            unit="kg",
            quantity=round(rebar_weight_kg, 1),
            unit_rate=steel_price,
            total=round(rebar_weight_kg * steel_price),
            category="material",
            source="vendor" if vendor_prices.get("reinforcement") else "rate_table",
            confidence="medium",
        ),
    ]

    finishing_complexity = {
        "standard": 1.0,
        "premium": 1.12,
        "luxury": 1.25,
    }.get(data.finishing_level, 1.0)
    storey_complexity = 1.0 + (max(0, storeys - 1) * 0.08)
    complexity_factor = finishing_complexity * storey_complexity

    block_laying_days = _days_for(net_wall_area, 24.0, complexity_factor)
    concrete_casting_days = _days_for(concrete_volume_total, 8.0, complexity_factor)
    beam_formwork_area = beam_length_m * 2.0 * (beam_width_m + beam_depth_m)
    column_formwork_area = column_count * (4.0 * column_size_m * wall_height_m)
    slab_formwork_area = slab_area
    formwork_area_total = beam_formwork_area + column_formwork_area + slab_formwork_area
    formwork_days = _days_for(formwork_area_total, 28.0, complexity_factor)
    steel_fixing_days = _days_for(rebar_weight_kg, 500.0, complexity_factor)
    support_days = _safe_ceil((block_laying_days + concrete_casting_days + formwork_days) * 0.5)
    foreman_days = _safe_ceil(max(block_laying_days, concrete_casting_days + formwork_days + steel_fixing_days) * 0.85)

    labour = [
        CostItem(
            item_code="block_laying_crew",
            description="Masonry block-laying crew",
            unit="crew_day",
            quantity=float(block_laying_days),
            unit_rate=7600.0,
            total=round(block_laying_days * 7600.0),
            category="labour",
            source="assumed",
            confidence="medium",
        ),
        CostItem(
            item_code="concrete_casting_crew",
            description="Concrete casting crew",
            unit="crew_day",
            quantity=float(concrete_casting_days),
            unit_rate=8200.0,
            total=round(concrete_casting_days * 8200.0),
            category="labour",
            source="assumed",
            confidence="medium",
        ),
        CostItem(
            item_code="formwork_crew",
            description="Formwork crew",
            unit="crew_day",
            quantity=float(formwork_days),
            unit_rate=7800.0,
            total=round(formwork_days * 7800.0),
            category="labour",
            source="assumed",
            confidence="medium",
        ),
        CostItem(
            item_code="steel_fixing_crew",
            description="Steel fixing crew",
            unit="crew_day",
            quantity=float(steel_fixing_days),
            unit_rate=7400.0,
            total=round(steel_fixing_days * 7400.0),
            category="labour",
            source="assumed",
            confidence="medium",
        ),
        CostItem(
            item_code="general_support_labour",
            description="General support labour",
            unit="crew_day",
            quantity=float(support_days),
            unit_rate=4000.0,
            total=round(support_days * 4000.0),
            category="labour",
            source="assumed",
            confidence="medium",
        ),
        CostItem(
            item_code="superstructure_foreman",
            description="Superstructure foreman/supervision",
            unit="day",
            quantity=float(foreman_days),
            unit_rate=3500.0,
            total=round(foreman_days * 3500.0),
            category="labour",
            source="assumed",
            confidence="medium",
        ),
    ]

    equipment = [
        CostItem(
            item_code="concrete_mixer_hire",
            description="Concrete mixer hire",
            unit="machine_day",
            quantity=float(concrete_casting_days),
            unit_rate=6500.0,
            total=round(concrete_casting_days * 6500.0),
            category="equipment",
            source="fixed_service",
            confidence="medium",
        ),
        CostItem(
            item_code="concrete_vibrator_hire",
            description="Concrete vibrator hire",
            unit="machine_day",
            quantity=float(concrete_casting_days),
            unit_rate=2200.0,
            total=round(concrete_casting_days * 2200.0),
            category="equipment",
            source="fixed_service",
            confidence="medium",
        ),
    ]
    if storeys > 1:
        scaffolding_days = _safe_ceil(block_laying_days * 0.6)
        equipment.append(
            CostItem(
                item_code="scaffolding_hire",
                description="Scaffolding hire",
                unit="machine_day",
                quantity=float(scaffolding_days),
                unit_rate=3500.0,
                total=round(scaffolding_days * 3500.0),
                category="equipment",
                source="fixed_service",
                confidence="medium",
            )
        )

    other_costs: list[CostItem] = []

    quantities = [
        QuantityItem(name="total_floor_area_sqm", value=round(total_floor_area_sqm, 2), unit="sqm", formula="shared_geometry.total_floor_area_sqm"),
        QuantityItem(name="footprint_area_sqm", value=round(footprint_area_sqm, 2), unit="sqm", formula="shared_geometry.footprint_area_sqm"),
        QuantityItem(name="external_perimeter_m", value=round(external_perimeter_m, 2), unit="m", formula="shared_geometry.equivalent_square_perimeter_m"),
        QuantityItem(name="external_wall_area", value=round(external_wall_area, 2), unit="sqm", formula="external_perimeter * wall_height * storeys"),
        QuantityItem(name="internal_wall_area", value=round(internal_wall_area, 2), unit="sqm", formula="external_wall_area * internal_wall_ratio"),
        QuantityItem(name="total_wall_area", value=round(total_wall_area, 2), unit="sqm", formula="external_wall_area + internal_wall_area"),
        QuantityItem(name="door_area", value=round(door_area, 2), unit="sqm", formula="door_count * 1.89"),
        QuantityItem(name="window_area", value=round(window_area, 2), unit="sqm", formula="window_count * 1.44"),
        QuantityItem(name="net_wall_area", value=round(net_wall_area, 2), unit="sqm", formula="total_wall_area - openings_area"),
        QuantityItem(name="slab_area", value=round(slab_area, 2), unit="sqm", formula="upper suspended slab area + flat roof slab area (if flat roof)"),
        QuantityItem(name="beam_length", value=round(beam_length_m, 2), unit="m", formula="external_perimeter * storeys * 1.35"),
        QuantityItem(name="column_count", value=float(column_count), unit="count", formula="columns_per_floor * storeys"),
        QuantityItem(name="block_count", value=float(block_count), unit="piece", formula="ceil(net_wall_area * blocks_per_sqm * 1.05)"),
        QuantityItem(name="wall_area_sqm", value=round(net_wall_area, 2), unit="sqm", formula="net_wall_area"),
        QuantityItem(name="mortar_volume_m3", value=round(mortar_volume_m3, 2), unit="m3", formula="net_wall_area * mortar_consumption_per_sqm"),
        QuantityItem(name="beam_concrete_volume", value=round(beam_concrete_volume, 2), unit="m3", formula="beam concrete + lintel concrete"),
        QuantityItem(name="slab_concrete_volume", value=round(slab_concrete_volume, 2), unit="m3", formula="slab_area * slab_thickness"),
        QuantityItem(name="column_concrete_volume", value=round(column_concrete_volume, 2), unit="m3", formula="column_count * column_size^2 * wall_height"),
        QuantityItem(name="rebar_weight_kg", value=round(rebar_weight_kg, 1), unit="kg", formula="(beam+column+slab rebar) * 1.08"),
    ]

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
    if openings_capped:
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
