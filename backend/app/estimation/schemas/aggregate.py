from typing import Optional, Dict, Any
from pydantic import BaseModel

from app.estimation.schemas.site_survey import SiteSurveyInput
from app.estimation.schemas.site_preparation import SitePreparationInput
from app.estimation.schemas.foundation import FoundationInput
from app.estimation.schemas.superstructure import SuperstructureInput
from app.estimation.schemas.roofing import RoofingInput
from app.estimation.schemas.services_1 import ServicesFirstFixInput
from app.estimation.schemas.services_2 import ServicesSecondFixInput
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
