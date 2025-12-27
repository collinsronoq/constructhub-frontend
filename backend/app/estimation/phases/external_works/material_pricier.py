from app.estimation.common_schemas import MaterialCost, PhaseEstimate, PhaseTotals
from app.estimation.schemas.external import ExternalWorksInput, ExternalWorksQuantities
from app.estimation.logic.price_resolver import resolve_material_price
from app.estimation.base_materials.loader import load_base_materials


QUALITY_FACTOR = {
    "standard": 1.0,
    "premium": 1.12,
}


def price_external_works_materials(
    data: ExternalWorksInput,
    quantities: ExternalWorksQuantities,
    vendor_prices: dict | None = None,
) -> PhaseEstimate:
    """
    Price external works (paving, drainage, landscaping, perimeter wall, sewerage).
    """

    raw_base = load_base_materials()
    base_dict = raw_base if isinstance(raw_base, dict) else raw_base.model_dump()
    base_prices = base_dict.get("external_works_materials", {})
    vendor_block = (vendor_prices or {}).get("external_works_materials", {})

    quality_factor = QUALITY_FACTOR.get(data.quality_level, 1.0)

    materials: list[MaterialCost] = []

    def add_item(key: str, name: str, quantity: float, unit: str = "unit", apply_quality: bool = True):
        if quantity <= 0:
            return
        unit_cost = resolve_material_price(
            material_key=key,
            variant=None,
            base_prices=base_prices,
            vendor_price=vendor_block.get(key),
        )
        if apply_quality:
            unit_cost *= quality_factor
        materials.append(
            MaterialCost(
                name=name,
                quantity=quantity,
                unit=unit,
                unit_cost=unit_cost,
                total=round(quantity * unit_cost),
            )
        )

    # External surfaces
    add_item("paving_block", "Paving Blocks", quantities.paving_area_sqm, "sqm")
    add_item("kerbstone", "Kerbstones", quantities.paving_area_sqm * 0.25, "m")
    add_item("drainage_pipe", "Drainage Pipes", quantities.drainage_length_m, "m")
    add_item("landscaping_topsoil", "Top Soil & Landscaping", quantities.landscaping_area_sqm, "sqm")

    # Perimeter wall
    if data.perimeter_wall_enabled and data.perimeter_wall_type != "none":
        if data.perimeter_wall_type == "block_wall":
            add_item("wall_block", "Wall Blocks", quantities.wall_blocks, "pcs")
            add_item("mortar", "Mortar", quantities.wall_mortar_m3, "m3")
            add_item("concrete_m3", "Footing Concrete", quantities.footing_concrete_m3, "m3")
            add_item("concrete_m3", "Column Concrete", quantities.column_concrete_m3, "m3")
            add_item("reinforcement", "Column Reinforcement", quantities.column_reinf_kg, "kg")
            add_item("plaster_mortar", "Plaster (One Side)", quantities.plaster_area_sqm, "sqm")
        elif data.perimeter_wall_type == "chain_link":
            add_item("chain_link_mesh", "Chain-link Mesh", quantities.chain_link_mesh_m, "m")
            add_item("concrete_post", "Concrete Posts", quantities.chain_link_mesh_m / 3, "pcs")
            add_item("concrete_m3", "Post Concrete", quantities.chain_link_post_concrete_m3, "m3")
        elif data.perimeter_wall_type == "precast":
            add_item("precast_panel_per_m", "Precast Panel", quantities.precast_length_m, "m")

        if quantities.razor_wire_m > 0:
            add_item("razor_wire", "Razor Wire", quantities.razor_wire_m, "m")

        if quantities.gate_count > 0:
            add_item("gate_standard", "Gates", quantities.gate_count, "pcs")

    # Sewerage / waste
    if data.sewerage_system == "septic_tank":
        add_item("concrete_m3", "Septic Tank Concrete", quantities.septic_concrete_m3, "m3")
        add_item("reinforcement", "Septic Reinforcement", quantities.septic_reinf_kg, "kg")
        add_item("sewer_pipe", "Sewer Pipes", quantities.sewer_pipe_m, "m")
        add_item("manhole", "Manholes", quantities.manhole_count, "pcs")
    elif data.sewerage_system == "biodigester":
        add_item("biodigester_unit", "Biodigester Unit", quantities.biodigester_units, "pcs", apply_quality=False)
        add_item("sewer_pipe", "Sewer Pipes", quantities.sewer_pipe_m, "m")
        add_item("manhole", "Manholes", quantities.manhole_count, "pcs")
    elif data.sewerage_system == "sewer_connection":
        add_item("sewer_pipe", "Sewer Connection Pipes", quantities.sewer_pipe_m, "m")
        add_item("manhole", "Manholes", quantities.manhole_count, "pcs")

    material_total = sum(m.total for m in materials)

    totals = PhaseTotals(
        materials=material_total,
        labour=0,
        other=0,
        phase_total=material_total,
    )

    return PhaseEstimate(
        phase="external_works",
        materials=materials,
        labour=[],
        other_costs=[],
        totals=totals,
    )
