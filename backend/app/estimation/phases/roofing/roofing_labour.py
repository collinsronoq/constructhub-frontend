# app/estimation/phases/roofing/roofing_labour.py

from app.estimation.common_schemas import (
    LabourCost,
    PhaseEstimate,
    PhaseTotals,
)


REFERENCE_ROOF_AREA_SQM = 120


def _area_adjustment_factor(actual_area: float) -> float:
    """
    Bounded adjustment based on roof area.
    Prevents unrealistic labour scaling.
    """
    if actual_area <= 0:
        return 1.0

    raw = actual_area / REFERENCE_ROOF_AREA_SQM
    return max(0.8, min(raw, 1.5))


def estimate_roofing_labour(
    roof_type: str,
    roof_area_sqm: float,
) -> PhaseEstimate:
    """
    Estimate roofing labour using a fixed crew-per-roof-type model.
    """

    # --- Crew & base duration definitions ---
    roofing_models = {
        "mabati": {
            "base_days": 5,
            "crew": [
                ("Roofing Fundi", 1, 2500),
                ("Helper", 2, 1200),
            ],
        },
        "tiles": {
            "base_days": 7,
            "crew": [
                ("Roofing Fundi", 2, 2800),
                ("Helper", 3, 1200),
            ],
        },
        "flat_slab": {
            "base_days": 10,
            "crew": [
                ("Foreman", 1, 3500),
                ("Mason", 4, 2800),
                ("Helper", 3, 1200),
            ],
        },
    }

    if roof_type not in roofing_models:
        raise ValueError(f"Unsupported roof type: {roof_type}")

    model = roofing_models[roof_type]

    # --- Duration adjustment ---
    adjustment = _area_adjustment_factor(roof_area_sqm)
    days = round(model["base_days"] * adjustment)

    labour_items = []

    for role, count, rate in model["crew"]:
        total = count * rate * days
        labour_items.append(
            LabourCost(
                role=f"{role} ({count})",
                rate_per_day=rate * count,
                days=days,
                total=total,
            )
        )

    labour_total = sum(l.total for l in labour_items)

    totals = PhaseTotals(
        materials=0,
        labour=labour_total,
        other=0,
        phase_total=labour_total,
    )

    return PhaseEstimate(
        phase="roofing",
        materials=[],
        labour=labour_items,
        other_costs=[],
        totals=totals,
    )
