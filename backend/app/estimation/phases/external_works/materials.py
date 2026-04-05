from __future__ import annotations

from app.estimation.base_materials.loader import load_base_materials
from app.estimation.common_schemas import CostItem, PhaseEstimate, build_phase_totals
from app.estimation.logic.price_resolver import resolve_material_price
from app.estimation.phases.external_works.schemas import ExternalWorksInput, ExternalWorksQuantityModel


QUALITY_FACTOR = {
    "standard": 1.0,
    "premium": 1.12,
}


def build_external_works_material_items(
    data: ExternalWorksInput,
    quantities: ExternalWorksQuantityModel,
    vendor_prices: dict | None = None,
) -> list[CostItem]:
    raw_base = load_base_materials()
    base_dict = raw_base if isinstance(raw_base, dict) else raw_base.model_dump()
    base_prices = base_dict.get("external_works_materials", {})
    vendor_block = (vendor_prices or {}).get("external_works_materials", {})
    quality_factor = QUALITY_FACTOR.get(data.quality_level, 1.0)

    items: list[CostItem] = []

    def add_item(
        key: str,
        item_code: str,
        description: str,
        quantity: float,
        unit: str,
        apply_quality: bool = True,
    ) -> None:
        if quantity <= 0:
            return

        vendor_price = vendor_block.get(key)
        unit_rate = float(
            resolve_material_price(
                material_key=key,
                variant=None,
                base_prices=base_prices,
                vendor_price=vendor_price,
            )
        )
        if apply_quality:
            unit_rate *= quality_factor

        items.append(
            CostItem(
                item_code=item_code,
                description=description,
                unit=unit,
                quantity=float(quantity),
                unit_rate=round(unit_rate, 2),
                total=round(quantity * unit_rate),
                category="material",
                source="vendor" if vendor_price is not None else "rate_table",
                confidence="medium",
            )
        )

    # Hardscape and drainage
    add_item("paving_block", "paving_blocks", "Paving Blocks", quantities.paving_area_sqm, "sqm")
    add_item("kerbstone", "kerbstones", "Kerbstones", quantities.kerbstone_length_m, "m")
    add_item("drainage_pipe", "drainage_pipes", "Drainage Pipes", quantities.drainage_length_m, "m")

    # Softscape
    add_item("landscaping_topsoil", "landscaping_topsoil", "Topsoil & Landscaping Prep", quantities.landscaping_area_sqm, "sqm")

    # Boundary works
    if data.perimeter_wall_enabled and data.perimeter_wall_type != "none":
        if data.perimeter_wall_type == "block_wall":
            add_item("wall_block", "boundary_wall_blocks", "Boundary Wall Blocks", float(quantities.wall_blocks_count), "pcs")
            add_item("mortar", "boundary_wall_mortar", "Mortar for Boundary Wall", quantities.wall_mortar_volume_m3, "m3")
            add_item("concrete_m3", "boundary_wall_footing_concrete", "Boundary Footing Concrete", quantities.wall_footing_concrete_volume_m3, "m3")
            add_item("concrete_m3", "boundary_wall_column_concrete", "Boundary Column Concrete", quantities.column_concrete_volume_m3, "m3")
            add_item("reinforcement", "boundary_wall_column_reinf", "Boundary Column Reinforcement", quantities.column_reinf_kg, "kg")
            add_item("plaster_mortar", "boundary_wall_plaster", "Boundary Wall Plaster (One Side)", quantities.boundary_wall_area_sqm * 1.1, "sqm")
        elif data.perimeter_wall_type == "chain_link":
            add_item("chain_link_mesh", "chain_link_mesh", "Chain-link Mesh", quantities.mesh_length_m, "m")
            add_item("concrete_post", "chain_link_posts", "Chain-link Posts", float(quantities.post_count), "pcs")
            add_item("concrete_m3", "chain_link_post_concrete", "Chain-link Post Concrete", quantities.wall_footing_concrete_volume_m3, "m3")
        elif data.perimeter_wall_type == "precast":
            add_item("precast_panel_per_m", "precast_panels", "Precast Fence Panels", quantities.precast_length_m, "m")
            add_item("concrete_post", "precast_posts", "Precast Fence Posts", float(quantities.post_count), "pcs")
            add_item("concrete_m3", "precast_post_concrete", "Precast Post Concrete", quantities.wall_footing_concrete_volume_m3, "m3")

        if quantities.razor_wire_length_m > 0:
            add_item("razor_wire", "boundary_razor_wire", "Razor Wire", quantities.razor_wire_length_m, "m")

        if quantities.gate_count > 0 and quantities.gate_leaf_equivalent_units > 0:
            add_item(
                "gate_standard",
                "boundary_gate",
                "Gate Supply (Width-adjusted)",
                quantities.gate_leaf_equivalent_units,
                "equiv_gate",
            )

    # Sewerage scope
    if data.sewerage_system == "septic_tank":
        add_item("concrete_m3", "septic_concrete", "Septic Tank Concrete", quantities.septic_concrete_volume_m3, "m3")
        add_item("reinforcement", "septic_reinforcement", "Septic Tank Reinforcement", quantities.septic_reinforcement_kg, "kg")
        add_item("sewer_pipe", "septic_connection_pipe", "Septic Connection Pipes", quantities.sewer_connection_length_m, "m")
        add_item("manhole", "septic_manholes", "Septic Manholes", float(quantities.manholes_count), "pcs")
    elif data.sewerage_system == "biodigester":
        add_item(
            "biodigester_unit",
            "biodigester_units",
            "Biodigester Units",
            float(quantities.biodigester_units),
            "unit",
            apply_quality=False,
        )
        add_item("sewer_pipe", "biodigester_connection_pipe", "Biodigester Connection Pipes", quantities.sewer_connection_length_m, "m")
        add_item("manhole", "biodigester_manholes", "Biodigester Manholes", float(quantities.manholes_count), "pcs")
    else:
        add_item("sewer_pipe", "sewer_connection_pipe", "Sewer Connection Pipes", quantities.sewer_connection_length_m, "m")
        add_item("manhole", "sewer_connection_manholes", "Sewer Connection Manholes", float(quantities.manholes_count), "pcs")

    return items


def price_external_works_materials(
    data: ExternalWorksInput,
    quantities: ExternalWorksQuantityModel,
    vendor_prices: dict | None = None,
) -> PhaseEstimate:
    """
    Transitional compatibility helper for legacy module callers.
    """
    items = build_external_works_material_items(
        data=data,
        quantities=quantities,
        vendor_prices=vendor_prices,
    )
    return PhaseEstimate(
        phase="external_works",
        materials=items,
        labour=[],
        other_costs=[],
        totals=build_phase_totals(materials=items, labour=[], equipment=[], other_costs=[]),
    )

