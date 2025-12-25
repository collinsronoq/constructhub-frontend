# app/estimations/phases/site_preparation.py
from app.estimation.schemas.site_preparation import SitePreparationInput
from app.estimation.common_schemas import (
    PhaseEstimate,
    LabourCost,
    OtherCost,
    PhaseTotals,
)


def estimate_site_preparation(data: SitePreparationInput) -> PhaseEstimate:
    """
    Estimate site preparation & earthworks costs.
    """

    #  Excavation difficulty multiplier 
    soil_multiplier = {
        "soft": 1.0,
        "medium": 1.2,
        "rocky": 1.5,
    }.get(data.soil_type, 1.2)

    access_multiplier = 1.3 if data.access_difficulty == "difficult" else 1.0

    #  Duration logic 
    base_days = 2 if data.plot_size_sqm <= 500 else 4
    excavation_days = int(base_days * soil_multiplier)

    #  Machinery 
    excavator_cost = LabourCost(
        role="Excavator (Machine)",
        rate_per_day=18000,
        days=excavation_days,
        total=18000 * excavation_days,
    )

    #  Labour 
    labourers = LabourCost(
        role="General Labourers (4)",
        rate_per_day=4 * 1200,
        days=excavation_days,
        total=4 * 1200 * excavation_days,
    )

    labour_items = [excavator_cost, labourers]

    #  Other costs 
    other_costs = []

    if data.include_disposal:
        other_costs.append(
            OtherCost(
                name="Excavated Soil Disposal",
                amount=8000 * excavation_days,
            )
        )

    #  Totals 
    labour_total = sum(l.total for l in labour_items)
    other_total = sum(o.amount for o in other_costs)

    phase_total = (labour_total + other_total) * access_multiplier

    totals = PhaseTotals(
        materials=0,
        labour=labour_total,
        other=other_total,
        phase_total=phase_total,
    )

    return PhaseEstimate(
        phase="site_preparation_and_earthworks",
        materials=[],
        labour=labour_items,
        other_costs=other_costs,
        totals=totals,
    )
