from app.estimation.common_schemas import (
    MaterialCost,
    PhaseEstimate,
    PhaseTotals,
)
from app.estimation.phases.superstructure.superstructure_quantifier import SuperstructureQuantities
from app.estimation.logic.price_resolver import resolve_material_price


def price_superstructure_materials(
    quantities: SuperstructureQuantities,
    block_type: str,
    vendor_prices: dict | None = None,
) -> PhaseEstimate:
    """
    Price superstructure materials using base or vendor prices.
    """

    base_prices = load_base_materials().get("materials_2", {}).get("materials", {})
    vendor_prices = vendor_prices or {}

    materials = []

    # --- BLOCKWORK ---
    block_price = resolve_material_price(
        material_key="blockwork",
        variant=block_type,
        base_prices=base_prices,
        vendor_price=vendor_prices.get("blockwork"),
    )

    block_cost = quantities.total_blocks * block_price

    materials.append(
        MaterialCost(
            name=f"{block_type.replace('_', ' ').title()} Blocks",
            quantity=quantities.total_blocks,
            unit="pieces",
            unit_cost=block_price,
            total=round(block_cost),
        )
    )

    # --- CEMENT ---
    cement_price = resolve_material_price(
        "cement",
        None,
        base_prices,
        vendor_prices.get("cement"),
    )

    cement_cost = quantities.cement_bags * cement_price

    materials.append(
        MaterialCost(
            name="Cement",
            quantity=quantities.cement_bags,
            unit="bags",
            unit_cost=cement_price,
            total=round(cement_cost),
        )
    )

    # --- SAND ---
    sand_price = resolve_material_price(
        "sand",
        None,
        base_prices,
        vendor_prices.get("sand"),
    )

    sand_cost = quantities.sand_tonnes * sand_price

    materials.append(
        MaterialCost(
            name="Sand",
            quantity=quantities.sand_tonnes,
            unit="tonnes",
            unit_cost=sand_price,
            total=round(sand_cost),
        )
    )

    # --- BALLAST ---
    ballast_price = resolve_material_price(
        "ballast",
        None,
        base_prices,
        vendor_prices.get("ballast"),
    )

    ballast_cost = quantities.ballast_tonnes * ballast_price

    materials.append(
        MaterialCost(
            name="Ballast",
            quantity=quantities.ballast_tonnes,
            unit="tonnes",
            unit_cost=ballast_price,
            total=round(ballast_cost),
        )
    )

    # --- REINFORCEMENT ---
    steel_price = resolve_material_price(
        "reinforcement",
        None,
        base_prices,
        vendor_prices.get("reinforcement"),
    )

    steel_cost = quantities.reinforcement_kg * steel_price

    materials.append(
        MaterialCost(
            name="Reinforcement Steel",
            quantity=quantities.reinforcement_kg,
            unit="kg",
            unit_cost=steel_price,
            total=round(steel_cost),
        )
    )

    material_total = sum(m.total for m in materials)

    totals = PhaseTotals(
        materials=material_total,
        labour=0,
        other=0,
        phase_total=material_total,
    )

    return PhaseEstimate(
        phase="superstructure",
        materials=materials,
        labour=[],
        other_costs=[],
        totals=totals,
    )
