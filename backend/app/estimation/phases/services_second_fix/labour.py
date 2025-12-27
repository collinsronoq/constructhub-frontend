from math import ceil

from app.estimation.common_schemas import LabourCost, PhaseEstimate, PhaseTotals
from backend.app.estimation.schemas.services_2 import ServicesSecondFixInput, ServicesSecondFixQuantities


ELECTRICIAN_RATE = 2700
PLUMBER_RATE = 2600
HELPER_RATE = 1500
FINISHER_RATE = 2200


def estimate_services_second_fix_labour(
    data: ServicesSecondFixInput,
    quantities: ServicesSecondFixQuantities,
) -> PhaseEstimate:
    """
    Labour estimation for installing fixtures & fittings.
    """

    storey_factor = 1 + 0.1 * max(0, data.storeys - 1)
    quality_factor = 1.1 if data.quality_level == "premium" else 1.0

    # Electrical effort based on number of fittings
    electrical_points = quantities.switches + quantities.light_fittings + quantities.sockets
    base_elec_days = 1 + (electrical_points / 25)
    elec_days = ceil(base_elec_days * storey_factor * quality_factor)

    # Plumbing effort based on sanitary fixtures
    plumbing_points = (
        quantities.toilet_sets
        + quantities.basins
        + quantities.kitchen_sinks
        + quantities.shower_mixers
        + quantities.instant_showers
    )
    base_plumb_days = 1 + (plumbing_points / 8)
    plumb_days = ceil(base_plumb_days * storey_factor * quality_factor)

    # Finisher for sealing/caulking and touch-ups
    finisher_days = ceil(max(elec_days, plumb_days) * 0.5)

    labour_items = [
        LabourCost(
            role="Electrician",
            rate_per_day=ELECTRICIAN_RATE,
            days=elec_days,
            total=ELECTRICIAN_RATE * elec_days,
        ),
        LabourCost(
            role="Electrical Helper",
            rate_per_day=HELPER_RATE,
            days=elec_days,
            total=HELPER_RATE * elec_days,
        ),
        LabourCost(
            role="Plumber",
            rate_per_day=PLUMBER_RATE,
            days=plumb_days,
            total=PLUMBER_RATE * plumb_days,
        ),
        LabourCost(
            role="Plumbing Helper",
            rate_per_day=HELPER_RATE,
            days=plumb_days,
            total=HELPER_RATE * plumb_days,
        ),
        LabourCost(
            role="Interior Finisher",
            rate_per_day=FINISHER_RATE,
            days=finisher_days,
            total=FINISHER_RATE * finisher_days,
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
        phase="services_second_fix",
        materials=[],
        labour=labour_items,
        other_costs=[],
        totals=totals,
    )
