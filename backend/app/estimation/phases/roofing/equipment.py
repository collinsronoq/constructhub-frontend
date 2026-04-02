from __future__ import annotations

from math import ceil

from app.estimation.common_schemas import CostItem
from app.estimation.phases.roofing.schemas import RoofingInput, RoofingQuantityModel


MIXER_DAILY_CAPACITY_M3 = 6.0
VIBRATOR_DAILY_CAPACITY_M3 = 8.0
MIXER_HIRE_RATE_PER_DAY = 6500.0
VIBRATOR_HIRE_RATE_PER_DAY = 2200.0


def _safe_ceil(value: float) -> int:
    return max(1, ceil(value))


def build_roofing_equipment_items(
    data: RoofingInput,
    quantities: RoofingQuantityModel,
) -> list[CostItem]:
    # Pitched roofing stays labour/material driven for now.
    if data.roof_type != "flat" or quantities.concrete_volume_m3 <= 0:
        return []

    # Machine hire is tied to roof slab concrete workload for traceability.
    mixer_days = _safe_ceil(quantities.concrete_volume_m3 / MIXER_DAILY_CAPACITY_M3)
    vibrator_days = _safe_ceil(quantities.concrete_volume_m3 / VIBRATOR_DAILY_CAPACITY_M3)

    return [
        CostItem(
            item_code="roof_concrete_mixer_hire",
            description="Concrete mixer hire (flat roof slab works)",
            unit="machine_day",
            quantity=float(mixer_days),
            unit_rate=MIXER_HIRE_RATE_PER_DAY,
            total=round(mixer_days * MIXER_HIRE_RATE_PER_DAY),
            category="equipment",
            source="fixed_service",
            confidence="medium",
        ),
        CostItem(
            item_code="roof_concrete_vibrator_hire",
            description="Concrete vibrator hire (flat roof slab works)",
            unit="machine_day",
            quantity=float(vibrator_days),
            unit_rate=VIBRATOR_HIRE_RATE_PER_DAY,
            total=round(vibrator_days * VIBRATOR_HIRE_RATE_PER_DAY),
            category="equipment",
            source="fixed_service",
            confidence="medium",
        ),
    ]

