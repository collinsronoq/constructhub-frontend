from __future__ import annotations

from math import ceil

from app.estimation.common_schemas import CostItem
from app.estimation.phases.superstructure.schemas import (
    SuperstructureInput,
    SuperstructureLabourModel,
    SuperstructurePhaseGeometry,
    SuperstructureQuantityModel,
)


def _safe_ceil(value: float) -> int:
    return max(1, ceil(value))


def _days_for(quantity: float, productivity_per_day: float, complexity_factor: float = 1.0) -> int:
    if quantity <= 0 or productivity_per_day <= 0:
        return 0
    return _safe_ceil((quantity / productivity_per_day) * complexity_factor)

def derive_labour_model(
    data: SuperstructureInput,
    phase_geometry: SuperstructurePhaseGeometry,
    quantity_model: SuperstructureQuantityModel,
) -> SuperstructureLabourModel:
    finishing_complexity = {
        "standard": 1.0,
        "premium": 1.12,
        "luxury": 1.25,
    }.get(data.finishing_level, 1.0)
    storey_complexity = 1.0 + (max(0, phase_geometry.storeys - 1) * 0.08)
    complexity_factor = finishing_complexity * storey_complexity

    block_laying_days = _days_for(phase_geometry.net_wall_area, 24.0, complexity_factor)
    concrete_casting_days = _days_for(quantity_model.concrete_volume_total, 8.0, complexity_factor)

    beam_formwork_area = (
        phase_geometry.beam_length_m
        * 2.0
        * (phase_geometry.beam_width_m + phase_geometry.beam_depth_m)
    )
    column_formwork_area = (
        phase_geometry.column_count
        * (4.0 * phase_geometry.column_size_m * phase_geometry.wall_height_m)
    )
    slab_formwork_area = phase_geometry.slab_area
    formwork_area_total = beam_formwork_area + column_formwork_area + slab_formwork_area
    formwork_days = _days_for(formwork_area_total, 28.0, complexity_factor)

    steel_fixing_days = _days_for(quantity_model.rebar_weight_kg, 500.0, complexity_factor)
    support_days = _safe_ceil((block_laying_days + concrete_casting_days + formwork_days) * 0.5)
    foreman_days = _safe_ceil(
        max(
            block_laying_days,
            concrete_casting_days + formwork_days + steel_fixing_days,
        )
        * 0.85
    )

    return SuperstructureLabourModel(
        finishing_complexity=finishing_complexity,
        storey_complexity=storey_complexity,
        complexity_factor=complexity_factor,
        block_laying_days=block_laying_days,
        concrete_casting_days=concrete_casting_days,
        formwork_days=formwork_days,
        steel_fixing_days=steel_fixing_days,
        support_days=support_days,
        foreman_days=foreman_days,
        beam_formwork_area=beam_formwork_area,
        column_formwork_area=column_formwork_area,
        slab_formwork_area=slab_formwork_area,
        formwork_area_total=formwork_area_total,
    )


def build_labour_items(labour_model: SuperstructureLabourModel) -> list[CostItem]:
    return [
        CostItem(
            item_code="block_laying_crew",
            description="Masonry block-laying crew",
            unit="crew_day",
            quantity=float(labour_model.block_laying_days),
            unit_rate=7600.0,
            total=round(labour_model.block_laying_days * 7600.0),
            category="labour",
            source="assumed",
            confidence="medium",
        ),
        CostItem(
            item_code="concrete_casting_crew",
            description="Concrete casting crew",
            unit="crew_day",
            quantity=float(labour_model.concrete_casting_days),
            unit_rate=8200.0,
            total=round(labour_model.concrete_casting_days * 8200.0),
            category="labour",
            source="assumed",
            confidence="medium",
        ),
        CostItem(
            item_code="formwork_crew",
            description="Formwork crew",
            unit="crew_day",
            quantity=float(labour_model.formwork_days),
            unit_rate=7800.0,
            total=round(labour_model.formwork_days * 7800.0),
            category="labour",
            source="assumed",
            confidence="medium",
        ),
        CostItem(
            item_code="steel_fixing_crew",
            description="Steel fixing crew",
            unit="crew_day",
            quantity=float(labour_model.steel_fixing_days),
            unit_rate=7400.0,
            total=round(labour_model.steel_fixing_days * 7400.0),
            category="labour",
            source="assumed",
            confidence="medium",
        ),
        CostItem(
            item_code="general_support_labour",
            description="General support labour",
            unit="crew_day",
            quantity=float(labour_model.support_days),
            unit_rate=4000.0,
            total=round(labour_model.support_days * 4000.0),
            category="labour",
            source="assumed",
            confidence="medium",
        ),
        CostItem(
            item_code="superstructure_foreman",
            description="Superstructure foreman/supervision",
            unit="day",
            quantity=float(labour_model.foreman_days),
            unit_rate=3500.0,
            total=round(labour_model.foreman_days * 3500.0),
            category="labour",
            source="assumed",
            confidence="medium",
        ),
    ]
