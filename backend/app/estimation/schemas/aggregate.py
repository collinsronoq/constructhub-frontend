from typing import Optional, Dict, Any
from pydantic import BaseModel

from app.estimation.phases.site_survey.schemas import SiteSurveyInput
from app.estimation.phases.site_preparation.schemas import SitePreparationInput
from app.estimation.phases.foundation.schemas import FoundationInput
from app.estimation.phases.superstructure.schemas import SuperstructureInput
from app.estimation.phases.roofing.schemas import RoofingInput
from app.estimation.schemas.services import ServicesFirstFixInput, ServicesSecondFixInput
from app.estimation.schemas.finishes import FinishesInput
from app.estimation.schemas.external import ExternalWorksInput


class EstimationRequest(BaseModel):
    """
    Combined payload for full project estimation.
    """

    project_name: str | None = None
    site_survey: SiteSurveyInput
    site_preparation: SitePreparationInput
    foundation: FoundationInput
    superstructure: SuperstructureInput
    roofing: RoofingInput
    services_first_fix: ServicesFirstFixInput
    services_second_fix: ServicesSecondFixInput
    finishes: FinishesInput
    external_works: ExternalWorksInput

    vendor_prices: Optional[Dict[str, Any]] = None
