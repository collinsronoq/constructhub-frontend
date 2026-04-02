from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.estimation.common_schemas import PhaseEstimate
    from app.estimation.geometry.building_geometry_resolver import ResolvedGeometry
    from app.estimation.phases.roofing.schemas import RoofingInput


def estimate_roofing_phase(
    data: "RoofingInput",
    geometry: "ResolvedGeometry",
    vendor_prices: dict | None = None,
) -> "PhaseEstimate":
    from .estimate import estimate_roofing_phase as _estimate

    return _estimate(data=data, geometry=geometry, vendor_prices=vendor_prices)


__all__ = ["estimate_roofing_phase"]
