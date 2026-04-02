from typing import Literal

from pydantic import BaseModel


class SiteSurveyInput(BaseModel):
    plot_size_sqm: float
    location: str
    include_soil_test: bool = False
    include_topographical_survey: bool = False
    survey_quality: Literal["standard", "premium"] = "standard"


__all__ = ["SiteSurveyInput"]
