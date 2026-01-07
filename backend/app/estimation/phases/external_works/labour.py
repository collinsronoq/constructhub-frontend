from math import ceil

from app.estimation.common_schemas import LabourCost, PhaseEstimate, PhaseTotals
from app.estimation.schemas.external import ExternalWorksInput, ExternalWorksQuantities


MASON_RATE = 1200
FENCE_CREW_RATE = 1500
PAVER_RATE = 1500
LANDSCAPER_RATE = 2000
HELPER_RATE = 800

QUALITY_FACTOR = {
    "standard": 1.0,
    "premium": 1.12,
}


def estimate_external_works_labour(
    data: ExternalWorksInput,
    quantities: ExternalWorksQuantities,
) -> PhaseEstimate:
    """
    Labour estimation for external works.
    """

    quality_factor = QUALITY_FACTOR.get(data.quality_level, 1.0)

    labour_items: list[LabourCost] = []

    # Perimeter wall masonry (block wall)
    if data.perimeter_wall_enabled and data.perimeter_wall_type == "block_wall":
        wall_area = quantities.wall_area_sqm
        mason_days = ceil((wall_area / 12) * quality_factor)
        helper_days = mason_days
        labour_items.append(
            LabourCost(
                role="Mason (Wall)",
                rate_per_day=MASON_RATE,
                days=mason_days,
                total=MASON_RATE * mason_days,
            )
        )
        labour_items.append(
            LabourCost(
                role="Wall Helper",
                rate_per_day=HELPER_RATE,
                days=helper_days,
                total=HELPER_RATE * helper_days,
            )
        )

    if data.perimeter_wall_enabled and data.perimeter_wall_type in {"chain_link", "precast"}:
        fence_days = ceil((quantities.wall_length_m / 25) * quality_factor)
        labour_items.append(
            LabourCost(
                role="Fence Crew",
                rate_per_day=FENCE_CREW_RATE,
                days=fence_days,
                total=FENCE_CREW_RATE * fence_days,
            )
        )

    # Paving
    if quantities.paving_area_sqm > 0:
        paving_days = ceil((quantities.paving_area_sqm / 40) * quality_factor)
        labour_items.append(
            LabourCost(
                role="Paving Crew",
                rate_per_day=PAVER_RATE,
                days=paving_days,
                total=PAVER_RATE * paving_days,
            )
        )

    # Drainage trenching/installation
    if quantities.drainage_length_m > 0:
        drainage_days = ceil((quantities.drainage_length_m / 25) * quality_factor)
        labour_items.append(
            LabourCost(
                role="Drainage Crew",
                rate_per_day=PAVER_RATE,
                days=drainage_days,
                total=PAVER_RATE * drainage_days,
            )
        )

    # Landscaping
    if quantities.landscaping_area_sqm > 0:
        landscape_days = ceil((quantities.landscaping_area_sqm / 120) * quality_factor)
        labour_items.append(
            LabourCost(
                role="Landscaping Crew",
                rate_per_day=LANDSCAPER_RATE,
                days=landscape_days,
                total=LANDSCAPER_RATE * landscape_days,
            )
        )

    # Sewerage
    if data.sewerage_system == "septic_tank":
        sewer_days = ceil(5 * quality_factor)
    elif data.sewerage_system == "biodigester":
        sewer_days = ceil(3 * quality_factor)
    else:
        sewer_days = ceil((quantities.sewer_pipe_m / 20) * quality_factor)

    labour_items.append(
        LabourCost(
            role="Sewerage Crew",
            rate_per_day=MASON_RATE,
            days=sewer_days,
            total=MASON_RATE * sewer_days,
        )
    )

    labour_total = sum(item.total for item in labour_items)

    totals = PhaseTotals(
        materials=0,
        labour=labour_total,
        other=0,
        phase_total=labour_total,
    )

    return PhaseEstimate(
        phase="external_works",
        materials=[],
        labour=labour_items,
        other_costs=[],
        totals=totals,
    )
