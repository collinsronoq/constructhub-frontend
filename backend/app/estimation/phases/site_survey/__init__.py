from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.estimation.common_schemas import PhaseEstimate
    from app.estimation.phases.site_survey.schemas import SiteSurveyInput


def estimate_site_survey(data: "SiteSurveyInput") -> "PhaseEstimate":
    from .estimate import estimate_site_survey as _estimate

    return _estimate(data=data)


__all__ = ["estimate_site_survey"]
