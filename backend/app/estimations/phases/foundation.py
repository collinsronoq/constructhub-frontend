import math

from app.estimations.schemas.foundation import FoundationInput
from app.estimations.common_schemas import (
    PhaseEstimate,
    MaterialCost,
    LabourCost,
    OtherCost,
    PhaseTotals,
)


def estimate_foundation(data: FoundationInput) -> PhaseEstimate:
    """
    Estimate foundation costs (Strip or Raft).
    """


    # 1. Soil Multiplier

    soil_multiplier = {
        "soft": 1.0,
        "medium": 1.15,
        "rocky": 1.4,
    }.get(data.soil_type, 1.15)


    # 2. Concrete Volume

    if data.foundation_type == "strip":
        # Approximate perimeter
        perimeter = 4 * math.sqrt(data.floor_area_sqm)

        trench_width = 0.6      # meters
        trench_depth = 0.9      # meters

        concrete_volume = perimeter * trench_width * trench_depth

    # raft
    else:  
        thickness = 0.20 if data.quality_level == "standard" else 0.25
        concrete_volume = data.floor_area_sqm * thickness

    concrete_volume *= soil_multiplier


    # 3. Material Quantities
    # Concrete mix: 1:2:4

    cement_bags_per_m3 = 6.5
    sand_tons_per_m3 = 0.5
    ballast_tons_per_m3 = 0.8

    cement_bags = concrete_volume * cement_bags_per_m3
    sand_tons = concrete_volume * sand_tons_per_m3
    ballast_tons = concrete_volume * ballast_tons_per_m3

    # Base prices (KES)
    cement_price = 750
    sand_price = 2000
    ballast_price = 2500

    materials = [
        MaterialCost(
            name="Cement (50kg)",
            unit="bags",
            quantity=round(cement_bags, 1),
            unit_cost=cement_price,
            subtotal=round(cement_bags * cement_price),
        ),
        MaterialCost(
            name="Sand",
            unit="tons",
            quantity=round(sand_tons, 1),
            unit_cost=sand_price,
            subtotal=round(sand_tons * sand_price),
        ),
        MaterialCost(
            name="Ballast",
            unit="tons",
            quantity=round(ballast_tons, 1),
            unit_cost=ballast_price,
            subtotal=round(ballast_tons * ballast_price),
        ),
    ]


    # 4. Labour Estimation

    productivity_m3_per_day = 6
    concrete_days = math.ceil(concrete_volume / productivity_m3_per_day)

    fundi = LabourCost(
        role="Mason (Fundi)",
        rate_per_day=2500,
        days=concrete_days,
        total=2500 * concrete_days,
    )

    labourers = LabourCost(
        role="General Labourers (4)",
        rate_per_day=4 * 1200,
        days=concrete_days,
        total=4 * 1200 * concrete_days,
    )

    labour_items = [fundi, labourers]


    # 5. Other Costs

    other_costs = []

    if data.include_formwork:
        other_costs.append(
            OtherCost(
                name="Formwork & Timber",
                amount=round(0.05 * sum(m.subtotal for m in materials)),
            )
        )


    # 6. Totals

    material_total = sum(m.subtotal for m in materials)
    labour_total = sum(l.total for l in labour_items)
    other_total = sum(o.amount for o in other_costs)

    phase_total = material_total + labour_total + other_total

    totals = PhaseTotals(
        materials=material_total,
        labour=labour_total,
        other=other_total,
        phase_total=phase_total,
    )

    return PhaseEstimate(
        phase="foundation",
        materials=materials,
        labour=labour_items,
        other_costs=other_costs,
        totals=totals,
    )
