from math import ceil

from app.estimation.common_schemas import CostItem, PhaseEstimate, build_phase_totals
from app.estimation.phases.services_second_fix.schemas import (
    ServicesSecondFixInput,
    ServicesSecondFixQuantityModel,
    ServicesSecondFixResolvedInputs,
)


ELECTRICIAN_RATE = 2700
PLUMBER_RATE = 2600
HELPER_RATE = 1500
FINISHER_RATE = 2200


def estimate_services_second_fix_labour(
    data: ServicesSecondFixInput,
    quantities: ServicesSecondFixQuantityModel,
) -> PhaseEstimate:
    """
    Transitional compatibility helper for legacy module callers.
    """
    fallback_floor_area = max(float(data.floor_area_sqm or 1.0), 1.0)
    fallback_storeys = max(1, int(data.storeys or 1))

    labour_items = build_services_second_fix_labour_items(
        data=data,
        quantities=quantities,
        resolved_inputs=ServicesSecondFixResolvedInputs(
            effective_floor_area_sqm=fallback_floor_area,
            effective_storeys=fallback_storeys,
            used_geometry_floor_area=False,
            used_geometry_storeys=False,
        ),
    )
    return PhaseEstimate(
        phase="services_second_fix",
        materials=[],
        labour=labour_items,
        other_costs=[],
        totals=build_phase_totals(materials=[], labour=labour_items, equipment=[], other_costs=[]),
    )


def build_services_second_fix_labour_items(
    data: ServicesSecondFixInput,
    quantities: ServicesSecondFixQuantityModel,
    resolved_inputs: ServicesSecondFixResolvedInputs,
) -> list[CostItem]:
    storey_factor = 1 + 0.1 * max(0, resolved_inputs.effective_storeys - 1)
    quality_factor = 1.1 if data.quality_level == "premium" else 1.0

    electrical_points = (
        quantities.switches_count
        + quantities.light_fittings_count
        + quantities.sockets_count
    )
    base_elec_days = 1 + (electrical_points / 25)
    elec_days = ceil(base_elec_days * storey_factor * quality_factor)

    plumbing_points = (
        quantities.toilet_sets_count
        + quantities.basins_count
        + quantities.kitchen_sinks_count
        + quantities.shower_mixers_count
        + quantities.instant_showers_count
    )
    base_plumb_days = 1 + (plumbing_points / 8)
    plumb_days = ceil(base_plumb_days * storey_factor * quality_factor)

    finisher_days = ceil(max(elec_days, plumb_days) * 0.5)

    return [
        CostItem(
            item_code="electrician",
            description="Electrician",
            unit="day",
            quantity=float(elec_days),
            unit_rate=ELECTRICIAN_RATE,
            total=round(ELECTRICIAN_RATE * elec_days),
            category="labour",
            source="assumed",
            confidence="medium",
        ),
        CostItem(
            item_code="electrical_helper",
            description="Electrical Helper",
            unit="day",
            quantity=float(elec_days),
            unit_rate=HELPER_RATE,
            total=round(HELPER_RATE * elec_days),
            category="labour",
            source="assumed",
            confidence="medium",
        ),
        CostItem(
            item_code="plumber",
            description="Plumber",
            unit="day",
            quantity=float(plumb_days),
            unit_rate=PLUMBER_RATE,
            total=round(PLUMBER_RATE * plumb_days),
            category="labour",
            source="assumed",
            confidence="medium",
        ),
        CostItem(
            item_code="plumbing_helper",
            description="Plumbing Helper",
            unit="day",
            quantity=float(plumb_days),
            unit_rate=HELPER_RATE,
            total=round(HELPER_RATE * plumb_days),
            category="labour",
            source="assumed",
            confidence="medium",
        ),
        CostItem(
            item_code="interior_finisher",
            description="Interior Finisher",
            unit="day",
            quantity=float(finisher_days),
            unit_rate=FINISHER_RATE,
            total=round(FINISHER_RATE * finisher_days),
            category="labour",
            source="assumed",
            confidence="medium",
        ),
    ]
