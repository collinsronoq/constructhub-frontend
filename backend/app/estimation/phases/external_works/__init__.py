from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.estimation.common_schemas import PhaseEstimate
    from app.estimation.geometry.building_geometry_resolver import ResolvedGeometry
    from app.estimation.phases.external_works.schemas import ExternalWorksInput


def estimate_external_works(
    data: "ExternalWorksInput",
    geometry: "ResolvedGeometry | None" = None,
    vendor_prices: dict | None = None,
) -> "PhaseEstimate":
    from .estimate import estimate_external_works as _estimate

    return _estimate(data=data, geometry=geometry, vendor_prices=vendor_prices)


__all__ = ["estimate_external_works"]

