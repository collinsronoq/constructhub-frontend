from app.estimation.common_schemas import (
    MaterialCost,
    PhaseEstimate,
    PhaseTotals,
)
from app.estimation.schemas.roofing import RoofingQuantities
from app.estimation.base_materials.loader import load_base_materials
from app.estimation.logic.price_resolver import resolve_material_price


def price_roofing_materials(
    quantities: RoofingQuantities,
    roof_type: str,
    roofing_material: str | None = None,
    vendor_prices: dict | None = None,
) -> PhaseEstimate:
    """
    Price roofing materials using base or vendor prices.
    """

    base_prices = load_base_materials().get("roofing_materials", {})
    vendor_prices = vendor_prices or {}

    materials: list[MaterialCost] = []

    
    # FLAT ROOF (SLAB)
    
    if roof_type == "flat":
        # Concrete
        concrete_price = resolve_material_price(
            "cement",
            None,
            base_prices,
            vendor_prices.get("cement"),
        )

        materials.append(
            MaterialCost(
                name="Roof Slab Concrete",
                quantity=quantities.concrete_volume_m3,
                unit="m³",
                unit_cost=concrete_price,
                total=round(quantities.concrete_volume_m3 * concrete_price),
            )
        )

        # Reinforcement
        steel_price = resolve_material_price(
            "reinforcement",
            None,
            base_prices,
            vendor_prices.get("reinforcement"),
        )

        materials.append(
            MaterialCost(
                name="Reinforcement Steel",
                quantity=quantities.reinforcement_kg,
                unit="kg",
                unit_cost=steel_price,
                total=round(quantities.reinforcement_kg * steel_price),
            )
        )

        # Formwork
        formwork_price = resolve_material_price(
            "formwork",
            None,
            base_prices,
            vendor_prices.get("formwork"),
        )

        materials.append(
            MaterialCost(
                name="Formwork",
                quantity=quantities.formwork_sqm,
                unit="sqm",
                unit_cost=formwork_price,
                total=round(quantities.formwork_sqm * formwork_price),
            )
        )

        # Waterproofing
        waterproof_price = resolve_material_price(
            "waterproofing",
            None,
            base_prices,
            vendor_prices.get("waterproofing"),
        )

        materials.append(
            MaterialCost(
                name="Waterproofing Membrane",
                quantity=quantities.waterproofing_sqm,
                unit="sqm",
                unit_cost=waterproof_price,
                total=round(quantities.waterproofing_sqm * waterproof_price),
            )
        )

    
    # PITCHED ROOFS
    
    else:
        # Roofing sheets / tiles
        sheet_price = resolve_material_price(
            "roofing_sheet",
            roofing_material,
            base_prices,
            vendor_prices.get("roofing_sheet"),
        )

        materials.append(
            MaterialCost(
                name=f"{roofing_material.title()} Roofing",
                quantity=quantities.roofing_sheets_sqm,
                unit="sqm",
                unit_cost=sheet_price,
                total=round(quantities.roofing_sheets_sqm * sheet_price),
            )
        )

        # Timber
        timber_price = resolve_material_price(
            "timber",
            None,
            base_prices,
            vendor_prices.get("timber"),
        )

        materials.append(
            MaterialCost(
                name="Roof Timber",
                quantity=quantities.timber_cubic_m,
                unit="m³",
                unit_cost=timber_price,
                total=round(quantities.timber_cubic_m * timber_price),
            )
        )

        # Nails
        nails_price = resolve_material_price(
            "nails",
            None,
            base_prices,
            vendor_prices.get("nails"),
        )

        materials.append(
            MaterialCost(
                name="Roofing Nails",
                quantity=quantities.nails_kg,
                unit="kg",
                unit_cost=nails_price,
                total=round(quantities.nails_kg * nails_price),
            )
        )

        # Ridge caps
        if quantities.ridge_length_m > 0:
            ridge_price = resolve_material_price(
                "ridge_cap",
                None,
                base_prices,
                vendor_prices.get("ridge_cap"),
            )

            materials.append(
                MaterialCost(
                    name="Ridge Caps",
                    quantity=quantities.ridge_length_m,
                    unit="m",
                    unit_cost=ridge_price,
                    total=round(quantities.ridge_length_m * ridge_price),
                )
            )

    
    # TOTALS
    
    material_total = sum(m.total for m in materials)

    totals = PhaseTotals(
        materials=material_total,
        labour=0,
        other=0,
        phase_total=material_total,
    )

    return PhaseEstimate(
        phase="roofing",
        materials=materials,
        labour=[],
        other_costs=[],
        totals=totals,
    )
