from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.estimation.common_schemas import PhaseEstimate
    from app.estimation.phases.site_preparation.schemas import SitePreparationInput


def estimate_site_preparation(data: "SitePreparationInput") -> "PhaseEstimate":
    from .estimate import estimate_site_preparation as _estimate

    return _estimate(data=data)


__all__ = ["estimate_site_preparation"]
