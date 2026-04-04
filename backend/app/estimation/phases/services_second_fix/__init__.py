from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.estimation.common_schemas import PhaseEstimate
    from app.estimation.geometry.building_geometry_resolver import ResolvedGeometry
    from app.estimation.phases.services_second_fix.schemas import ServicesSecondFixInput


def estimate_services_second_fix(
    data: "ServicesSecondFixInput",
    geometry: "ResolvedGeometry | None" = None,
    vendor_prices: dict | None = None,
) -> "PhaseEstimate":
    from .estimate import estimate_services_second_fix as _estimate

    return _estimate(data=data, geometry=geometry, vendor_prices=vendor_prices)


__all__ = ["estimate_services_second_fix"]

