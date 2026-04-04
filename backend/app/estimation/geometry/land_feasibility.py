from __future__ import annotations

from dataclasses import dataclass
from typing import Literal


StructureType = Literal[
    "bungalow",
    "two_storey",
    "three_storey",
    "multi_storey",
]


@dataclass(frozen=True)
class LandFeasibilityResult:
    land_size_sqm: float
    structure_type: StructureType
    floors: int
    max_site_coverage_ratio: float
    buildable_footprint_sqm: float
    total_allowable_floor_area_sqm: float
    effective_floor_area_per_floor_sqm: float


def resolve_floors(structure_type: StructureType) -> int:
    return {
        "bungalow": 1,
        "two_storey": 2,
        "three_storey": 3,
        "multi_storey": 4,
    }.get(structure_type, 1)


def resolve_land_feasibility(
    land_size_sqm: float,
    structure_type: StructureType,
) -> LandFeasibilityResult:
    max_site_coverage_ratio = 0.60
    circulation_loss_ratio = 0.15

    floors = resolve_floors(structure_type)
    land_size_sqm = max(float(land_size_sqm or 0), 1.0)

    raw_footprint = land_size_sqm * max_site_coverage_ratio
    buildable_footprint = raw_footprint * (1 - circulation_loss_ratio)
    total_allowable_floor_area = buildable_footprint * floors
    effective_per_floor = total_allowable_floor_area / max(floors, 1)

    return LandFeasibilityResult(
        land_size_sqm=land_size_sqm,
        structure_type=structure_type,
        floors=floors,
        max_site_coverage_ratio=max_site_coverage_ratio,
        buildable_footprint_sqm=round(buildable_footprint, 2),
        total_allowable_floor_area_sqm=round(total_allowable_floor_area, 2),
        effective_floor_area_per_floor_sqm=round(effective_per_floor, 2),
    )


__all__ = [
    "LandFeasibilityResult",
    "StructureType",
    "resolve_floors",
    "resolve_land_feasibility",
]

