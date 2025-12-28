from math import ceil

from app.estimation.common_schemas import LabourCost, PhaseEstimate, PhaseTotals
from app.estimation.schemas.services import ServicesFirstFixQuantities, ServicesFirstFixInput

ELECTRICIAN_RATE = 2700
ELECTRICAL_HELPER_RATE = 1500
PLUMBER_RATE = 2600
PLUMBING_HELPER_RATE = 1500


def _normalize_quality(level: str | None) -> str:
    if not level:
        return "standard"
    return str(level).strip().lower()


def estimate_services_first_fix_labour(
    data: ServicesFirstFixInput,
    quantities: ServicesFirstFixQuantities,
) -> PhaseEstimate:
    """
    Labour model for electrical + plumbing rough-in (first fix).

    Driven primarily by:
      - number of electrical points
      - number of wet rooms (bathrooms/kitchens/laundry)
      - storeys factor
      - quality factor (premium tends to require more careful routing/finish prep)
    """

    points = (quantities.total_light_points or 0) + (quantities.total_socket_points or 0)
    wet_rooms = (data.bathrooms or 0) + (data.kitchens or 0) + (data.laundry_rooms or 0)

    storeys = data.storeys or 1
    storey_factor = 1 + 0.15 * max(0, storeys - 1)

    quality = _normalize_quality(getattr(data, "quality_level", None))
    quality_factor = 1.10 if quality in {"premium", "luxury"} else 1.00

    # Electrical duration driven by number of points
    #  - baseline: 2 days mobilization + setup
    #  - + 1 day per ~25 points (rough heuristic)
    base_elec_days = 2 + (points / 25.0)
    elec_days = max(1, ceil(base_elec_days * storey_factor * quality_factor))

    # Plumbing duration driven by wet rooms
    #  - baseline: 1 day mobilization + setup
    #  - + ~0.8 day per wet room
    base_plumb_days = 1 + (wet_rooms * 0.8)
    plumb_days = max(1, ceil(base_plumb_days * storey_factor * quality_factor))

    labour_items = [
        LabourCost(
            role="Electrician",
            rate_per_day=ELECTRICIAN_RATE,
            days=elec_days,
            total=ELECTRICIAN_RATE * elec_days,
        ),
        LabourCost(
            role="Electrical Helper",
            rate_per_day=ELECTRICAL_HELPER_RATE,
            days=elec_days,
            total=ELECTRICAL_HELPER_RATE * elec_days,
        ),
        LabourCost(
            role="Plumber",
            rate_per_day=PLUMBER_RATE,
            days=plumb_days,
            total=PLUMBER_RATE * plumb_days,
        ),
        LabourCost(
            role="Plumbing Helper",
            rate_per_day=PLUMBING_HELPER_RATE,
            days=plumb_days,
            total=PLUMBING_HELPER_RATE * plumb_days,
        ),
    ]

    labour_total = sum(item.total for item in labour_items)

    totals = PhaseTotals(
        materials=0,
        labour=labour_total,
        other=0,
        phase_total=labour_total,
    )

    return PhaseEstimate(
        phase="services_first_fix",
        materials=[],
        labour=labour_items,
        other_costs=[],
        totals=totals,
    )
