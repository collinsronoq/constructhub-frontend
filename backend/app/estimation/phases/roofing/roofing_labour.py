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
    roof_covering: str | None = None,
) -> PhaseEstimate:
    """
    Estimate roofing labour using a fixed crew-per-roof-type model.
    """

    # --- Crew & base duration definitions ---
    roofing_models = {
        "mabati": {
            "base_days": 5,
            "crew": [
                ("Roofing Fundi", 1, 1500),
                ("Helper", 2, 800),
            ],
        },
        "tiles": {
            "base_days": 7,
            "crew": [
                ("Roofing Fundi", 2, 1800),
                ("Helper", 3, 800),
            ],
        },
        "flat_slab": {
            "base_days": 10,
            "crew": [
                ("Foreman", 1, 2500),
                ("Mason", 4, 1200),
                ("Helper", 3, 800),
            ],
        },
    }

    # Map structural roof type + covering to labour model
    if roof_type == "flat":
        labour_model_key = "flat_slab"
    else:
        # default to mabati crews unless covering includes tiles
        labour_model_key = "tiles" if (roof_covering and "tile" in roof_covering) else "mabati"

    model = roofing_models[labour_model_key]

    #  Duration adjustment 
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
