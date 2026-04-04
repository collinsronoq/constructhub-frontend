from __future__ import annotations

from math import ceil

from app.estimation.common_schemas import CostItem, PhaseEstimate, build_phase_totals
from app.estimation.phases.services_first_fix.schemas import (
    ServicesFirstFixInput,
    ServicesFirstFixQuantityModel,
    ServicesFirstFixResolvedInputs,
)


ELECTRICIAN_RATE = 2700.0
ELECTRICAL_HELPER_RATE = 1500.0
PLUMBER_RATE = 2600.0
PLUMBING_HELPER_RATE = 1500.0


def _normalize_quality(level: str | None) -> str:
    if not level:
        return "standard"
    return str(level).strip().lower()


def build_services_first_fix_labour_items(
    data: ServicesFirstFixInput,
    quantities: ServicesFirstFixQuantityModel,
    resolved_inputs: ServicesFirstFixResolvedInputs,
) -> list[CostItem]:
    points = quantities.total_light_points + quantities.total_socket_points
    wet_rooms = quantities.wet_rooms_count

    storey_factor = 1 + 0.15 * max(0, resolved_inputs.effective_storeys - 1)

    quality = _normalize_quality(data.quality_level)
    quality_factor = 1.10 if quality in {"premium", "luxury"} else 1.00

    base_elec_days = 2 + (points / 25.0)
    elec_days = max(1, ceil(base_elec_days * storey_factor * quality_factor))

    base_plumb_days = 1 + (wet_rooms * 0.8)
    plumb_days = max(1, ceil(base_plumb_days * storey_factor * quality_factor))

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
            unit_rate=ELECTRICAL_HELPER_RATE,
            total=round(ELECTRICAL_HELPER_RATE * elec_days),
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
            unit_rate=PLUMBING_HELPER_RATE,
            total=round(PLUMBING_HELPER_RATE * plumb_days),
            category="labour",
            source="assumed",
            confidence="medium",
        ),
    ]


def estimate_services_first_fix_labour(
    data: ServicesFirstFixInput,
    quantities: ServicesFirstFixQuantityModel,
) -> PhaseEstimate:
    """
    Transitional compatibility helper for legacy module callers.
    """

    items = build_services_first_fix_labour_items(
        data=data,
        quantities=quantities,
        resolved_inputs=ServicesFirstFixResolvedInputs(
            effective_floor_area_sqm=float(data.floor_area_sqm),
            effective_storeys=max(1, int(data.storeys)),
            used_geometry_floor_area=False,
            used_geometry_storeys=False,
        ),
    )
    return PhaseEstimate(
        phase="services_first_fix",
        materials=[],
        labour=items,
        other_costs=[],
        totals=build_phase_totals(materials=[], labour=items, equipment=[], other_costs=[]),
    )
