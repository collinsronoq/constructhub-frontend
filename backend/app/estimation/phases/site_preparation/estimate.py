# app/estimations/phases/site_preparation.py
from math import ceil

from app.estimation.phases.site_preparation.schemas import SitePreparationInput
from app.estimation.common_schemas import (
    CostItem,
    PhaseEstimate,
    PhaseMetadata,
    QuantityItem,
    build_phase_totals,
)


def _safe_ceil(value: float) -> int:
    return max(1, ceil(value))


def estimate_site_preparation(data: SitePreparationInput) -> PhaseEstimate:
    """
    Estimate site preparation as a quantity-driven v2 phase.
    Scope boundary: enabling earthworks only (no foundation structural items).
    """

    plot_size_sqm = max(float(data.plot_size_sqm or 0), 1.0)
    excavation_depth_m = max(float(data.excavation_depth_m or 0), 0.3)

    soil_productivity_factor = {
        "soft": 1.1,
        "medium": 1.0,
        "rocky": 0.7,
    }.get(data.soil_type, 1.0)

    soil_rate_multiplier = {
        "soft": 1.0,
        "medium": 1.1,
        "rocky": 1.35,
    }.get(data.soil_type, 1.1)

    vegetation_multiplier = {
        "light": 0.9,
        "medium": 1.0,
        "heavy": 1.25,
    }.get(data.vegetation_density, 1.0)

    access_productivity_penalty = 1.2 if data.access_difficulty == "difficult" else 1.0
    access_rate_multiplier = 1.15 if data.access_difficulty == "difficult" else 1.0

    clearing_area_sqm = plot_size_sqm * 0.90
    topsoil_stripping_area_sqm = clearing_area_sqm
    topsoil_stripping_thickness_m = 0.10
    topsoil_stripping_volume_m3 = topsoil_stripping_area_sqm * topsoil_stripping_thickness_m

    # Assumed enabling-works excavation footprint before foundation scope starts.
    excavation_footprint_sqm = plot_size_sqm * 0.22
    excavation_volume_m3 = excavation_footprint_sqm * excavation_depth_m

    spoil_disposal_volume_m3 = topsoil_stripping_volume_m3 + excavation_volume_m3 if data.include_disposal else 0.0
    truck_capacity_m3 = 10.0
    spoil_disposal_trips = _safe_ceil(spoil_disposal_volume_m3 / truck_capacity_m3) if data.include_disposal else 0
    trucking_days = _safe_ceil(spoil_disposal_trips / 4) if data.include_disposal else 0

    imported_fill_factor = {
        "soft": 0.35,
        "medium": 0.20,
        "rocky": 0.10,
    }.get(data.soil_type, 0.20)
    imported_fill_volume_m3 = topsoil_stripping_volume_m3 * imported_fill_factor
    if data.has_existing_structures:
        imported_fill_volume_m3 += 3.0

    compaction_area_sqm = max(excavation_footprint_sqm, clearing_area_sqm * 0.6)

    excavator_productivity_m3_per_hour = 18.0 * soil_productivity_factor / access_productivity_penalty
    excavator_hours = excavation_volume_m3 / max(excavator_productivity_m3_per_hour, 1.0)
    excavator_days = _safe_ceil(excavator_hours / 8.0)

    compactor_productivity_sqm_per_day = 300.0 / access_productivity_penalty
    compactor_days = _safe_ceil(compaction_area_sqm / max(compactor_productivity_sqm_per_day, 1.0))

    clearing_productivity_sqm_per_crew_day = 180.0 * (1.0 / vegetation_multiplier)
    clearing_crew_days = _safe_ceil(clearing_area_sqm / max(clearing_productivity_sqm_per_crew_day, 1.0))
    excavation_support_days = _safe_ceil(excavator_days * soil_rate_multiplier)
    compaction_crew_days = _safe_ceil(compactor_days)
    obstruction_removal_days = 1 if data.has_existing_structures else 0

    materials: list[CostItem] = []
    if imported_fill_volume_m3 > 0:
        materials.append(
            CostItem(
                item_code="imported_selected_fill",
                description="Imported selected fill for re-leveling/compaction",
                unit="m3",
                quantity=round(imported_fill_volume_m3, 2),
                unit_rate=round(1800.0 * access_rate_multiplier, 2),
                total=round(imported_fill_volume_m3 * 1800.0 * access_rate_multiplier),
                category="material",
                source="assumed",
                confidence="medium",
            )
        )

    labour: list[CostItem] = [
        CostItem(
            item_code="clearing_crew",
            description="Vegetation and surface clearing crew (4 workers)",
            unit="crew_day",
            quantity=float(clearing_crew_days),
            unit_rate=round(5200.0 * vegetation_multiplier * access_rate_multiplier, 2),
            total=round(clearing_crew_days * 5200.0 * vegetation_multiplier * access_rate_multiplier),
            category="labour",
            source="assumed",
            confidence="medium",
        ),
        CostItem(
            item_code="excavation_support_crew",
            description="Manual excavation/loading support crew (3 workers)",
            unit="crew_day",
            quantity=float(excavation_support_days),
            unit_rate=round(4200.0 * soil_rate_multiplier * access_rate_multiplier, 2),
            total=round(excavation_support_days * 4200.0 * soil_rate_multiplier * access_rate_multiplier),
            category="labour",
            source="assumed",
            confidence="medium",
        ),
        CostItem(
            item_code="compaction_leveling_crew",
            description="Compaction and final leveling crew (3 workers)",
            unit="crew_day",
            quantity=float(compaction_crew_days),
            unit_rate=round(3900.0 * access_rate_multiplier, 2),
            total=round(compaction_crew_days * 3900.0 * access_rate_multiplier),
            category="labour",
            source="assumed",
            confidence="medium",
        ),
    ]
    if obstruction_removal_days > 0:
        labour.append(
            CostItem(
                item_code="obstruction_removal_crew",
                description="Minor obstruction removal crew",
                unit="crew_day",
                quantity=float(obstruction_removal_days),
                unit_rate=round(5600.0 * access_rate_multiplier, 2),
                total=round(obstruction_removal_days * 5600.0 * access_rate_multiplier),
                category="labour",
                source="assumed",
                confidence="low",
            )
        )

    equipment: list[CostItem] = [
        CostItem(
            item_code="excavator_hire",
            description="Hydraulic excavator hire",
            unit="machine_day",
            quantity=float(excavator_days),
            unit_rate=round(22000.0 * soil_rate_multiplier * access_rate_multiplier, 2),
            total=round(excavator_days * 22000.0 * soil_rate_multiplier * access_rate_multiplier),
            category="equipment",
            source="fixed_service",
            confidence="medium",
        ),
        CostItem(
            item_code="compactor_hire",
            description="Plate compactor/roller hire",
            unit="machine_day",
            quantity=float(compactor_days),
            unit_rate=round(8500.0 * access_rate_multiplier, 2),
            total=round(compactor_days * 8500.0 * access_rate_multiplier),
            category="equipment",
            source="fixed_service",
            confidence="medium",
        ),
    ]
    if data.include_disposal:
        equipment.append(
            CostItem(
                item_code="tipper_truck_haulage",
                description="Tipper truck haulage for spoil transport",
                unit="truck_day",
                quantity=float(trucking_days),
                unit_rate=round(18000.0 * access_rate_multiplier, 2),
                total=round(trucking_days * 18000.0 * access_rate_multiplier),
                category="equipment",
                source="fixed_service",
                confidence="medium",
            )
        )

    other_costs: list[CostItem] = []
    if data.include_disposal:
        tipping_fee_rate_per_trip = 2200.0
        other_costs.append(
            CostItem(
                item_code="spoil_disposal_tipping_fees",
                description="Spoil dumping/disposal tipping fees",
                unit="trip",
                quantity=float(spoil_disposal_trips),
                unit_rate=round(tipping_fee_rate_per_trip * access_rate_multiplier, 2),
                total=round(spoil_disposal_trips * tipping_fee_rate_per_trip * access_rate_multiplier),
                category="other",
                source="fixed_service",
                confidence="medium",
            )
        )

    quantities = [
        QuantityItem(
            name="clearing_area_sqm",
            value=round(clearing_area_sqm, 2),
            unit="sqm",
            formula="plot_size_sqm * 0.90",
        ),
        QuantityItem(
            name="topsoil_stripping_volume_m3",
            value=round(topsoil_stripping_volume_m3, 2),
            unit="m3",
            formula="clearing_area_sqm * 0.10m",
        ),
        QuantityItem(
            name="excavation_footprint_sqm",
            value=round(excavation_footprint_sqm, 2),
            unit="sqm",
            formula="plot_size_sqm * 0.22",
        ),
        QuantityItem(
            name="excavation_volume_m3",
            value=round(excavation_volume_m3, 2),
            unit="m3",
            formula="excavation_footprint_sqm * excavation_depth_m",
        ),
        QuantityItem(
            name="spoil_disposal_volume_m3",
            value=round(spoil_disposal_volume_m3, 2),
            unit="m3",
            formula="topsoil_stripping_volume_m3 + excavation_volume_m3 if include_disposal",
        ),
        QuantityItem(
            name="spoil_disposal_trips",
            value=float(spoil_disposal_trips),
            unit="trip",
            formula="ceil(spoil_disposal_volume_m3 / 10m3)",
        ),
        QuantityItem(
            name="imported_fill_volume_m3",
            value=round(imported_fill_volume_m3, 2),
            unit="m3",
            formula="topsoil_stripping_volume_m3 * soil_fill_factor (+3m3 if existing structures)",
        ),
        QuantityItem(
            name="compaction_area_sqm",
            value=round(compaction_area_sqm, 2),
            unit="sqm",
            formula="max(excavation_footprint_sqm, clearing_area_sqm * 0.60)",
        ),
        QuantityItem(
            name="excavator_hours",
            value=round(excavator_hours, 2),
            unit="machine_hour",
            formula="excavation_volume_m3 / effective_excavator_productivity",
        ),
        QuantityItem(
            name="excavator_days",
            value=float(excavator_days),
            unit="machine_day",
            formula="ceil(excavator_hours / 8)",
        ),
        QuantityItem(
            name="compactor_days",
            value=float(compactor_days),
            unit="machine_day",
            formula="ceil(compaction_area_sqm / effective_compactor_productivity)",
        ),
        QuantityItem(
            name="trucking_days",
            value=float(trucking_days),
            unit="truck_day",
            formula="ceil(spoil_disposal_trips / 4)",
        ),
        QuantityItem(
            name="clearing_crew_days",
            value=float(clearing_crew_days),
            unit="crew_day",
            formula="ceil(clearing_area_sqm / clearing_productivity)",
        ),
        QuantityItem(
            name="excavation_support_days",
            value=float(excavation_support_days),
            unit="crew_day",
            formula="ceil(excavator_days * soil_rate_multiplier)",
        ),
        QuantityItem(
            name="total_labour_crew_days",
            value=float(clearing_crew_days + excavation_support_days + compaction_crew_days + obstruction_removal_days),
            unit="crew_day",
            formula="clearing_crew_days + excavation_support_days + compaction_crew_days (+ obstruction_removal_days)",
        ),
    ]

    assumptions = [
        "Site preparation scope excludes foundation structural works (no blinding, reinforcement, concrete, or formwork).",
        "Clearing area is assumed as 90% of plot size; topsoil stripping thickness is 0.10m.",
        "Early earthworks excavation footprint is approximated as 22% of plot area at user-provided excavation depth.",
        "Difficult access reduces equipment productivity and increases labour/equipment/service rates by 15%.",
        "Soil type modifies productivity and rates; rocky soil has slower output and higher machine/support rates.",
        "Spoil disposal uses 10m3 truck-trip capacity and separate tipping fees per trip.",
        "Imported fill is estimated from stripped topsoil volume using a soil-dependent replacement factor.",
    ]

    notes = [
        "Excavator and compactor are classified under equipment, not labour.",
        "Spoil transport (equipment) and dumping fees (other cost) are shown as separate line items.",
        "Disposal omitted by user input." if not data.include_disposal else "Disposal included and itemized explicitly.",
    ]

    warnings = []
    if data.access_difficulty == "difficult":
        warnings.append("Access difficulty is modeled via heuristic productivity/rate factors rather than route-based logistics.")
    warnings.append("Rates are static assumptions and are not live vendor quotes.")

    totals = build_phase_totals(
        materials=materials,
        labour=labour,
        equipment=equipment,
        other_costs=other_costs,
    )

    return PhaseEstimate(
        phase="site_preparation_and_earthworks",
        phase_id="site_preparation",
        phase_name="Site Preparation",
        inputs_used={
            "plot_size_sqm": plot_size_sqm,
            "soil_type": data.soil_type,
            "excavation_depth_m": excavation_depth_m,
            "access_difficulty": data.access_difficulty,
            "include_disposal": data.include_disposal,
            "vegetation_density": data.vegetation_density,
            "has_existing_structures": data.has_existing_structures,
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
            pricing_source="static",
            confidence="medium",
        ),
    )
