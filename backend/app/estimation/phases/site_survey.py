# app/estimations/phases/site_survey.py
from app.estimation.schemas.site_survey import SiteSurveyInput
from app.estimation.common_schemas import (
    PhaseEstimate,
    LabourCost,
    OtherCost,
    PhaseTotals,
)


def estimate_site_survey(data: SiteSurveyInput) -> PhaseEstimate:
    """
    Estimate site survey costs (labour-only phase).
    """

    #  Base surveyor rates (can later be moved to config / JSON) 
    SURVEYOR_DAILY_RATE = 5000
    DAYS_REQUIRED = 1 if data.plot_size_sqm <= 500 else 2

    if data.survey_quality == "premium":
        SURVEYOR_DAILY_RATE *= 1.3

    labour_cost = LabourCost(
        role="Surveyor",
        rate_per_day=SURVEYOR_DAILY_RATE,
        days=DAYS_REQUIRED,
        total=SURVEYOR_DAILY_RATE * DAYS_REQUIRED,
    )

    other_costs = []

    # Optional add-ons
    if data.include_soil_test:
        other_costs.append(
            OtherCost(name="Soil Test", amount=15000)
        )

    if data.include_topographical_survey:
        other_costs.append(
            OtherCost(name="Topographical Survey", amount=10000)
        )

    labour_total = labour_cost.total
    other_total = sum(c.amount for c in other_costs)

    totals = PhaseTotals(
        materials=0,
        labour=labour_total,
        other=other_total,
        phase_total=labour_total + other_total,
    )

    return PhaseEstimate(
        phase="site_survey",
        materials=[],
        labour=[labour_cost],
        other_costs=other_costs,
        totals=totals,
    )
