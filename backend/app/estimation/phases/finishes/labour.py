from math import ceil

from app.estimation.common_schemas import LabourCost, PhaseEstimate, PhaseTotals
from app.estimation.schemas.finishes import FinishesInput, FinishesQuantities


TILER_RATE = 1800
PLASTERER_RATE = 1700
PAINTER_RATE = 1500
CEILING_FIXER_RATE = 2400
CARPENTER_RATE = 2600
JOINER_RATE = 2400
HELPER_RATE = 1000
FOREMAN_RATE = 3500

QUALITY_FACTOR = {
    "standard": 1.0,
    "premium": 1.12,
    "luxury": 1.25,
}


def estimate_finishes_labour(
    data: FinishesInput,
    quantities: FinishesQuantities,
) -> PhaseEstimate:
    """
    Labour estimation for finishes trades.
    """

    storey_factor = 1 + 0.12 * max(0, data.storeys - 1)
    quality_factor = QUALITY_FACTOR.get(data.quality_level, 1.0)

    labour_items: list[LabourCost] = []
    core_trade_days: list[int] = []

    # Tiling (floors + walls)
    total_tile_area = (
        quantities.main_floor_area_sqm
        + quantities.wet_floor_area_sqm
        + quantities.stairs_area_sqm
        + quantities.wall_tile_area_sqm
    )
    tiler_days = ceil((total_tile_area / 18) * storey_factor * quality_factor)

    if tiler_days > 0:
        core_trade_days.append(tiler_days)
        labour_items.append(
            LabourCost(
                role="Tiler",
                rate_per_day=TILER_RATE,
                days=tiler_days,
                total=TILER_RATE * tiler_days,
            )
        )
        labour_items.append(
            LabourCost(
                role="Tiler Helper",
                rate_per_day=HELPER_RATE,
                days=tiler_days,
                total=HELPER_RATE * tiler_days,
            )
        )

    # Plastering and skim coat
    plaster_days = ceil((quantities.plaster_area_sqm / 28) * storey_factor * quality_factor)
    if plaster_days > 0:
        core_trade_days.append(plaster_days)
        labour_items.append(
            LabourCost(
                role="Plasterer (Fundi)",
                rate_per_day=PLASTERER_RATE,
                days=plaster_days,
                total=PLASTERER_RATE * plaster_days,
            )
        )
        labour_items.append(
            LabourCost(
                role="Plastering Helper",
                rate_per_day=HELPER_RATE,
                days=plaster_days,
                total=HELPER_RATE * plaster_days,
            )
        )

    # Painting
    coat_factor = 1.0 if data.paint_system == "standard_2_coat" else 1.2
    paint_area = (
        quantities.paint_wall_area_sqm
        + quantities.paint_ceiling_area_sqm
        + quantities.paint_exterior_area_sqm
    )
    painter_days = ceil((paint_area / 40) * storey_factor * quality_factor * coat_factor)

    if painter_days > 0:
        core_trade_days.append(painter_days)
        labour_items.append(
            LabourCost(
                role="Painter",
                rate_per_day=PAINTER_RATE,
                days=painter_days,
                total=PAINTER_RATE * painter_days,
            )
        )
        labour_items.append(
            LabourCost(
                role="Painter Helper",
                rate_per_day=HELPER_RATE,
                days=ceil(painter_days * 0.75),
                total=HELPER_RATE * ceil(painter_days * 0.75),
            )
        )

    # Ceilings
    if quantities.ceiling_area_sqm > 0:
        ceiling_days = ceil((quantities.ceiling_area_sqm / 30) * storey_factor * quality_factor)
        core_trade_days.append(ceiling_days)
        labour_items.append(
            LabourCost(
                role="Ceiling Fixer",
                rate_per_day=CEILING_FIXER_RATE,
                days=ceiling_days,
                total=CEILING_FIXER_RATE * ceiling_days,
            )
        )
        labour_items.append(
            LabourCost(
                role="Ceiling Helper",
                rate_per_day=HELPER_RATE,
                days=ceiling_days,
                total=HELPER_RATE * ceiling_days,
            )
        )

    # Doors and trims
    door_days = ceil(max(1, (quantities.internal_doors / 3) * storey_factor * quality_factor))
    core_trade_days.append(door_days)
    labour_items.append(
        LabourCost(
            role="Carpenter (Doors/Trims)",
            rate_per_day=CARPENTER_RATE,
            days=door_days,
            total=CARPENTER_RATE * door_days,
        )
    )

    # Joinery (wardrobes + cabinets)
    joinery_run_m = quantities.wardrobes_m + quantities.kitchen_cabinets_m
    if joinery_run_m > 0:
        joinery_days = ceil((joinery_run_m / 3.5) * storey_factor * quality_factor)
        core_trade_days.append(joinery_days)
        labour_items.append(
            LabourCost(
                role="Joiner (Cabinetry)",
                rate_per_day=JOINER_RATE,
                days=joinery_days,
                total=JOINER_RATE * joinery_days,
            )
        )
        labour_items.append(
            LabourCost(
                role="Joinery Helper",
                rate_per_day=HELPER_RATE,
                days=joinery_days,
                total=HELPER_RATE * joinery_days,
            )
        )

    if core_trade_days:
        foreman_days = ceil(max(core_trade_days) * 0.75)
        labour_items.append(
            LabourCost(
                role="Finishes Foreman",
                rate_per_day=FOREMAN_RATE,
                days=foreman_days,
                total=FOREMAN_RATE * foreman_days,
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
        phase="finishes",
        materials=[],
        labour=labour_items,
        other_costs=[],
        totals=totals,
    )
