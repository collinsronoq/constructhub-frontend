from __future__ import annotations

from math import ceil

from app.estimation.common_schemas import CostItem, PhaseEstimate, build_phase_totals
from app.estimation.phases.finishes.schemas import (
    FinishesInput,
    FinishesQuantityModel,
    FinishesResolvedInputs,
)


TILER_RATE = 1800.0
PLASTERER_RATE = 1700.0
SKIMMER_RATE = 1750.0
PAINTER_RATE = 1500.0
CEILING_FIXER_RATE = 2400.0
CARPENTER_RATE = 2600.0
JOINER_RATE = 2400.0
HELPER_RATE = 1000.0
FOREMAN_RATE = 3500.0

QUALITY_FACTOR = {
    "standard": 1.0,
    "premium": 1.12,
    "luxury": 1.25,
}


def build_finishes_labour_items(
    data: FinishesInput,
    quantities: FinishesQuantityModel,
    resolved_inputs: FinishesResolvedInputs,
) -> list[CostItem]:
    # Productivity and complexity uplift: upper storeys reduce handling efficiency.
    storey_factor = 1 + 0.10 * max(0, resolved_inputs.effective_storeys - 1)
    quality_factor = QUALITY_FACTOR.get(data.quality_level, 1.0)

    items: list[CostItem] = []
    core_trade_days: list[int] = []

    total_tile_area = (
        quantities.main_floor_finish_area_sqm
        + quantities.wet_floor_finish_area_sqm
        + quantities.stair_finish_area_sqm
        + quantities.wall_tile_area_sqm
    )
    tiler_days = ceil((total_tile_area / 20.0) * storey_factor * quality_factor)
    if tiler_days > 0:
        core_trade_days.append(tiler_days)
        items.extend(
            [
                CostItem(
                    item_code="tiler",
                    description="Tiler",
                    unit="day",
                    quantity=float(tiler_days),
                    unit_rate=TILER_RATE,
                    total=round(TILER_RATE * tiler_days),
                    category="labour",
                    source="assumed",
                    confidence="medium",
                ),
                CostItem(
                    item_code="tiler_helper",
                    description="Tiler Helper",
                    unit="day",
                    quantity=float(tiler_days),
                    unit_rate=HELPER_RATE,
                    total=round(HELPER_RATE * tiler_days),
                    category="labour",
                    source="assumed",
                    confidence="medium",
                ),
            ]
        )

    plaster_days = ceil((quantities.plaster_render_area_sqm / 30.0) * storey_factor * quality_factor)
    if plaster_days > 0:
        core_trade_days.append(plaster_days)
        items.extend(
            [
                CostItem(
                    item_code="plasterer",
                    description="Plasterer (Render/Plaster)",
                    unit="day",
                    quantity=float(plaster_days),
                    unit_rate=PLASTERER_RATE,
                    total=round(PLASTERER_RATE * plaster_days),
                    category="labour",
                    source="assumed",
                    confidence="medium",
                ),
                CostItem(
                    item_code="plaster_helper",
                    description="Plastering Helper",
                    unit="day",
                    quantity=float(plaster_days),
                    unit_rate=HELPER_RATE,
                    total=round(HELPER_RATE * plaster_days),
                    category="labour",
                    source="assumed",
                    confidence="medium",
                ),
            ]
        )

    skimming_days = ceil((quantities.skimming_area_sqm / 45.0) * storey_factor * quality_factor)
    if skimming_days > 0:
        core_trade_days.append(skimming_days)
        items.extend(
            [
                CostItem(
                    item_code="skimmer",
                    description="Skimming Finisher",
                    unit="day",
                    quantity=float(skimming_days),
                    unit_rate=SKIMMER_RATE,
                    total=round(SKIMMER_RATE * skimming_days),
                    category="labour",
                    source="assumed",
                    confidence="medium",
                ),
                CostItem(
                    item_code="skimming_helper",
                    description="Skimming Helper",
                    unit="day",
                    quantity=float(skimming_days),
                    unit_rate=HELPER_RATE,
                    total=round(HELPER_RATE * skimming_days),
                    category="labour",
                    source="assumed",
                    confidence="medium",
                ),
            ]
        )

    coat_factor = 1.0 if data.paint_system == "standard_2_coat" else 1.2
    total_paint_area = (
        quantities.interior_wall_paint_area_sqm
        + quantities.ceiling_paint_area_sqm
        + quantities.exterior_wall_paint_area_sqm
    )
    painter_days = ceil((total_paint_area / 42.0) * storey_factor * quality_factor * coat_factor)
    if painter_days > 0:
        core_trade_days.append(painter_days)
        helper_days = ceil(painter_days * 0.75)
        items.extend(
            [
                CostItem(
                    item_code="painter",
                    description="Painter",
                    unit="day",
                    quantity=float(painter_days),
                    unit_rate=PAINTER_RATE,
                    total=round(PAINTER_RATE * painter_days),
                    category="labour",
                    source="assumed",
                    confidence="medium",
                ),
                CostItem(
                    item_code="painter_helper",
                    description="Painter Helper",
                    unit="day",
                    quantity=float(helper_days),
                    unit_rate=HELPER_RATE,
                    total=round(HELPER_RATE * helper_days),
                    category="labour",
                    source="assumed",
                    confidence="medium",
                ),
            ]
        )

    if quantities.ceiling_area_sqm > 0:
        ceiling_days = ceil((quantities.ceiling_area_sqm / 32.0) * storey_factor * quality_factor)
        core_trade_days.append(ceiling_days)
        items.extend(
            [
                CostItem(
                    item_code="ceiling_fixer",
                    description="Ceiling Fixer",
                    unit="day",
                    quantity=float(ceiling_days),
                    unit_rate=CEILING_FIXER_RATE,
                    total=round(CEILING_FIXER_RATE * ceiling_days),
                    category="labour",
                    source="assumed",
                    confidence="medium",
                ),
                CostItem(
                    item_code="ceiling_helper",
                    description="Ceiling Helper",
                    unit="day",
                    quantity=float(ceiling_days),
                    unit_rate=HELPER_RATE,
                    total=round(HELPER_RATE * ceiling_days),
                    category="labour",
                    source="assumed",
                    confidence="medium",
                ),
            ]
        )

    door_days = ceil(max(1.0, (quantities.internal_doors_count / 3.5) * storey_factor * quality_factor))
    core_trade_days.append(door_days)
    items.append(
        CostItem(
            item_code="carpenter_doors_trims",
            description="Carpenter (Doors/Trims)",
            unit="day",
            quantity=float(door_days),
            unit_rate=CARPENTER_RATE,
            total=round(CARPENTER_RATE * door_days),
            category="labour",
            source="assumed",
            confidence="medium",
        )
    )

    trim_length_m = quantities.skirting_run_m + quantities.cornice_run_m
    trim_days = ceil((trim_length_m / 55.0) * storey_factor * quality_factor) if trim_length_m > 0 else 0
    if trim_days > 0:
        core_trade_days.append(trim_days)
        items.append(
            CostItem(
                item_code="trim_installer",
                description="Trim Installer (Skirting/Cornice)",
                unit="day",
                quantity=float(trim_days),
                unit_rate=HELPER_RATE + 900.0,
                total=round((HELPER_RATE + 900.0) * trim_days),
                category="labour",
                source="assumed",
                confidence="medium",
            )
        )

    if quantities.board_equivalent_count > 0:
        joinery_days = ceil((quantities.board_equivalent_count / 12.0) * storey_factor * quality_factor)
        core_trade_days.append(joinery_days)
        items.extend(
            [
                CostItem(
                    item_code="joiner_cabinetry",
                    description="Joiner (Wardrobes/Cabinets)",
                    unit="day",
                    quantity=float(joinery_days),
                    unit_rate=JOINER_RATE,
                    total=round(JOINER_RATE * joinery_days),
                    category="labour",
                    source="assumed",
                    confidence="medium",
                ),
                CostItem(
                    item_code="joinery_helper",
                    description="Joinery Helper",
                    unit="day",
                    quantity=float(joinery_days),
                    unit_rate=HELPER_RATE,
                    total=round(HELPER_RATE * joinery_days),
                    category="labour",
                    source="assumed",
                    confidence="medium",
                ),
            ]
        )

    if core_trade_days:
        foreman_days = ceil(max(core_trade_days) * 0.75)
        items.append(
            CostItem(
                item_code="finishes_foreman",
                description="Finishes Foreman",
                unit="day",
                quantity=float(foreman_days),
                unit_rate=FOREMAN_RATE,
                total=round(FOREMAN_RATE * foreman_days),
                category="labour",
                source="assumed",
                confidence="medium",
            )
        )

    return items


def estimate_finishes_labour(
    data: FinishesInput,
    quantities: FinishesQuantityModel,
) -> PhaseEstimate:
    """
    Transitional compatibility helper for legacy module callers.
    """
    fallback_storeys = max(1, int(data.storeys or 1))
    fallback_floor_area = max(float(data.floor_area_sqm or 1.0), 1.0)

    items = build_finishes_labour_items(
        data=data,
        quantities=quantities,
        resolved_inputs=FinishesResolvedInputs(
            effective_floor_area_sqm=fallback_floor_area,
            effective_storeys=fallback_storeys,
            effective_plan_perimeter_m=max((fallback_floor_area / fallback_storeys) ** 0.5 * 4.0, 4.0),
            used_geometry_floor_area=False,
            used_geometry_storeys=False,
            used_geometry_perimeter=False,
        ),
    )
    return PhaseEstimate(
        phase="finishes",
        materials=[],
        labour=items,
        other_costs=[],
        totals=build_phase_totals(materials=[], labour=items, equipment=[], other_costs=[]),
    )
