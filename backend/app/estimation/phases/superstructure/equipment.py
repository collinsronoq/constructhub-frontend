from __future__ import annotations

from math import ceil

from app.estimation.common_schemas import CostItem
from app.estimation.phases.superstructure.labour import SuperstructureLabourModel


def _safe_ceil(value: float) -> int:
    return max(1, ceil(value))


def build_equipment_items(
    storeys: int,
    labour_model: SuperstructureLabourModel,
) -> list[CostItem]:
    equipment = [
        CostItem(
            item_code="concrete_mixer_hire",
            description="Concrete mixer hire",
            unit="machine_day",
            quantity=float(labour_model.concrete_casting_days),
            unit_rate=6500.0,
            total=round(labour_model.concrete_casting_days * 6500.0),
            category="equipment",
            source="fixed_service",
            confidence="medium",
        ),
        CostItem(
            item_code="concrete_vibrator_hire",
            description="Concrete vibrator hire",
            unit="machine_day",
            quantity=float(labour_model.concrete_casting_days),
            unit_rate=2200.0,
            total=round(labour_model.concrete_casting_days * 2200.0),
            category="equipment",
            source="fixed_service",
            confidence="medium",
        ),
    ]
    if storeys > 1:
        scaffolding_days = _safe_ceil(labour_model.block_laying_days * 0.6)
        equipment.append(
            CostItem(
                item_code="scaffolding_hire",
                description="Scaffolding hire",
                unit="machine_day",
                quantity=float(scaffolding_days),
                unit_rate=3500.0,
                total=round(scaffolding_days * 3500.0),
                category="equipment",
                source="fixed_service",
                confidence="medium",
            )
        )
    return equipment
