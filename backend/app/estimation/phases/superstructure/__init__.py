"""
Superstructure phase package.

Intentionally avoids eager imports to prevent cycles with shared geometry resolver dependencies.
"""

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.estimation.common_schemas import PhaseEstimate
    from app.estimation.geometry.building_geometry_resolver import ResolvedGeometry
    from app.estimation.phases.superstructure.schemas import SuperstructureInput


def estimate_superstructure(
    data: "SuperstructureInput",
    geometry: "ResolvedGeometry",
    vendor_prices: dict | None = None,
) -> "PhaseEstimate":
    from .estimate import estimate_superstructure as _estimate

    return _estimate(data=data, geometry=geometry, vendor_prices=vendor_prices)


__all__ = ["estimate_superstructure"]
