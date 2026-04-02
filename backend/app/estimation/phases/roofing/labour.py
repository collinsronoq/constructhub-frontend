from __future__ import annotations

import re

from app.estimation.common_schemas import CostItem
from app.estimation.phases.roofing.schemas import RoofingInput, RoofingPhaseGeometry


# Labour crews are calibrated around a mid-size house roof; larger/smaller roofs scale from here.
REFERENCE_ROOF_AREA_SQM = 120.0


def _area_adjustment_factor(actual_area: float) -> float:
    if actual_area <= 0:
        return 1.0
    raw = actual_area / REFERENCE_ROOF_AREA_SQM
    # Clamp avoids extreme durations from very small/very large areas in this preliminary model.
    return max(0.8, min(raw, 1.5))


def _slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", value.lower()).strip("_") or "labour"


def build_roofing_labour_items(
    data: RoofingInput,
    geometry: RoofingPhaseGeometry,
) -> list[CostItem]:
    roofing_models = {
        "mabati": {
            "base_days": 5,
            "crew": [
                ("Roofing Fundi", 1, 1500),
                ("Helper", 2, 800),
            ],
        },
        "tiles": {
            "base_days": 7,
            "crew": [
                ("Roofing Fundi", 2, 1800),
                ("Helper", 3, 800),
            ],
        },
        "flat_slab": {
            "base_days": 10,
            "crew": [
                ("Foreman", 1, 2500),
                ("Mason", 4, 1200),
                ("Helper", 3, 800),
            ],
        },
    }

    # Roof system drives crew mix: slab casting crews for flat roofs, installation crews for pitched roofs.
    if data.roof_type == "flat":
        labour_model_key = "flat_slab"
    else:
        labour_model_key = "tiles" if "tile" in data.roof_covering else "mabati"

    model = roofing_models[labour_model_key]
    adjustment = _area_adjustment_factor(geometry.roof_cover_area_sqm)
    days = max(1, round(model["base_days"] * adjustment))

    items: list[CostItem] = []
    for role, count, rate in model["crew"]:
        crew_rate = float(rate * count)
        description = f"{role} ({count})"
        items.append(
            CostItem(
                item_code=_slug(description),
                description=description,
                unit="day",
                quantity=float(days),
                unit_rate=crew_rate,
                total=round(crew_rate * days),
                category="labour",
                source="assumed",
                confidence="medium",
            )
        )
    return items
