from app.estimation.common_schemas import (
    PhaseEstimate,
    LabourCost,
    PhaseTotals,
)
from app.estimation.phases.superstructure.superstructure_quantifier import SuperstructureQuantities


LABOUR_RATES = {
    "mason": 1500,
    "mason_helper": 1000,
    "steel_fixer": 1800,
    "carpenter": 1700,
    "general_labourer": 1000,
    "foreman": 2500,
}

BLOCKWORK_PRODUCTIVITY = 8  # sqm per mason per day
FORMWORK_PRODUCTIVITY = 12  # sqm/day
STEEL_FIXING_PRODUCTIVITY = 0.5  # tonnes/day (assumed later)


FINISHING_MULTIPLIER = {
    "standard": 1.0,
    "premium": 1.25,
    "luxury": 1.5,
}

STOREY_MULTIPLIER = {
    1: 1.0,
    2: 1.15,
}


def estimate_superstructure_labour(
    quantities: SuperstructureQuantities,
    finishing_level: str,
    number_of_storeys: int,
) -> PhaseEstimate:
    """
    Estimate labour costs for the superstructure phase.
    """

    finishing_factor = FINISHING_MULTIPLIER.get(finishing_level, 1.0)
    storey_factor = STOREY_MULTIPLIER.get(number_of_storeys, 1.3)

    complexity_factor = finishing_factor * storey_factor

    labour_items = []

    # --- BLOCKWORK ---
    mason_days = quantities.net_wall_area_sqm / BLOCKWORK_PRODUCTIVITY
    mason_days *= complexity_factor

    labour_items.append(
        LabourCost(
            role="Mason",
            rate_per_day=LABOUR_RATES["mason"],
            days=round(mason_days),
            total=round(mason_days * LABOUR_RATES["mason"]),
        )
    )

    labour_items.append(
        LabourCost(
            role="Mason Helper",
            rate_per_day=LABOUR_RATES["mason_helper"],
            days=round(mason_days),
            total=round(mason_days * LABOUR_RATES["mason_helper"]),
        )
    )

    # --- FORMWORK (Beams + Slabs) ---
    formwork_area = quantities.slab_area_sqm
    carpenter_days = (formwork_area / FORMWORK_PRODUCTIVITY) * complexity_factor

    labour_items.append(
        LabourCost(
            role="Carpenter",
            rate_per_day=LABOUR_RATES["carpenter"],
            days=round(carpenter_days),
            total=round(carpenter_days * LABOUR_RATES["carpenter"]),
        )
    )

    # --- STEEL FIXING ---
    estimated_steel_tonnes = quantities.slab_concrete_volume_m3 * 0.1
    steel_days = (estimated_steel_tonnes / STEEL_FIXING_PRODUCTIVITY) * complexity_factor

    labour_items.append(
        LabourCost(
            role="Steel Fixer",
            rate_per_day=LABOUR_RATES["steel_fixer"],
            days=round(steel_days),
            total=round(steel_days * LABOUR_RATES["steel_fixer"]),
        )
    )

    # --- GENERAL LABOUR ---
    general_labour_days = (mason_days + carpenter_days) * 0.5

    labour_items.append(
        LabourCost(
            role="General Labourers (2)",
            rate_per_day=2 * LABOUR_RATES["general_labourer"],
            days=round(general_labour_days),
            total=round(general_labour_days * 2 * LABOUR_RATES["general_labourer"]),
        )
    )

    # --- FOREMAN ---
    foreman_days = max(mason_days, carpenter_days) * 0.3

    labour_items.append(
        LabourCost(
            role="Site Foreman",
            rate_per_day=LABOUR_RATES["foreman"],
            days=round(foreman_days),
            total=round(foreman_days * LABOUR_RATES["foreman"]),
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
        phase="superstructure",
        materials=[],
        labour=labour_items,
        other_costs=[],
        totals=totals,
    )
