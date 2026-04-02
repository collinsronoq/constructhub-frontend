from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.estimation.common_schemas import PhaseEstimate
    from app.estimation.geometry.building_geometry_resolver import ResolvedGeometry
    from app.estimation.phases.foundation.schemas import FoundationInput


def estimate_foundation(
    data: "FoundationInput",
    geometry: "ResolvedGeometry",
) -> "PhaseEstimate":
    from .estimate import estimate_foundation as _estimate

    return _estimate(data=data, geometry=geometry)


__all__ = ["estimate_foundation"]
