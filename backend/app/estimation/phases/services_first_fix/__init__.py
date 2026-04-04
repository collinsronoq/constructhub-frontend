from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.estimation.common_schemas import PhaseEstimate
    from app.estimation.geometry.building_geometry_resolver import ResolvedGeometry
    from app.estimation.phases.services_first_fix.schemas import ServicesFirstFixInput


def estimate_services_first_fix(
    data: "ServicesFirstFixInput",
    geometry: "ResolvedGeometry | None" = None,
    vendor_prices: dict | None = None,
) -> "PhaseEstimate":
    from .estimate import estimate_services_first_fix as _estimate

    return _estimate(data=data, geometry=geometry, vendor_prices=vendor_prices)


__all__ = ["estimate_services_first_fix"]

