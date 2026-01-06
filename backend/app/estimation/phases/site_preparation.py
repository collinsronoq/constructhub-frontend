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
    base_hours = 10 if data.plot_size_sqm <= 500 else 24
    excavation_hours = int(base_hours * soil_multiplier)
    excavation_days = int(excavation_hours/24)

    rate_per_hour = 5000

    #  Machinery 
    excavator_cost = LabourCost(
        role="Excavator (Machine)",
        rate_per_day=excavation_hours*rate_per_hour,
        days=excavation_days,
        total=(excavation_hours*rate_per_hour) * excavation_days,
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

    # disposal logic
    # estimate the disposal quantity in volume

    excavation_land_size = data.plot_size_sqm
    excavation_land_depth = data.excavation_depth_m
    soil_density_kg_m3 = 1500 if data.soil_type == "soft" else 1800

    excavation_volume_m3 = excavation_land_size * excavation_land_depth
    disposal_mass_kg = excavation_volume_m3 * soil_density_kg_m3

    cost_per_truck = 8000
    truck_disposal_kg = 15000

    disposal_cost = (disposal_mass_kg/truck_disposal_kg)*cost_per_truck


    if data.include_disposal:
        other_costs.append(
            OtherCost(
                name="Excavated Soil Disposal",
                amount=disposal_cost,
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
