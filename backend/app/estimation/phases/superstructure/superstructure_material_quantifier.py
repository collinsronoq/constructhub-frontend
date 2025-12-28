from app.estimation.common_schemas import (
    MaterialCost,
    PhaseEstimate,
    PhaseTotals,
)
from app.estimation.phases.superstructure.superstructure_quantifier import SuperstructureQuantities
from app.estimation.base_materials.loader import load_base_materials
from app.estimation.logic.price_resolver import resolve_material_price


def price_superstructure_materials(
    quantities: SuperstructureQuantities,
    blockwork_type: str,
    vendor_prices: dict | None = None,
) -> PhaseEstimate:
    """
    Price superstructure materials using base or vendor prices.
    """

    base_prices = load_base_materials().get("superstructure_materials", {})
    if not base_prices:
        raise ValueError("Base prices for superstructure (superstructure_materials) not found.")

    vendor_prices = vendor_prices or {}

    def get_price(key: str, variant: str | None = None, vendor_key: str | None = None) -> float:
        vp = vendor_prices.get(vendor_key or key)
        return resolve_material_price(
            material_key=key,
            variant=variant,
            base_prices=base_prices,
            vendor_price=vp,
        )

    materials = []

    # --- BLOCKWORK ---
    block_price = get_price("blockwork", variant=blockwork_type, vendor_key="blockwork")
    block_cost = quantities.block_units * block_price

    materials.append(
        MaterialCost(
            name=f"{blockwork_type.replace('_', ' ').title()} Blocks",
            quantity=quantities.block_units,
            unit="pieces",
            unit_cost=block_price,
            total=round(block_cost),
        )
    )

    # --- CEMENT ---
    cement_price = get_price("cement")
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
    sand_price = get_price("sand")
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
    ballast_price = get_price("ballast")
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
    steel_price = get_price("reinforcement")
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

    material_total = sum(m.effective_total for m in materials)

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
