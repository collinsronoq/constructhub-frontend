# app/schemas/estimation/site_preparation.py
from pydantic import BaseModel


class SitePreparationInput(BaseModel):
    plot_size_sqm: float
    soil_type: str  # soft | medium | rocky
    excavation_depth_m: float
    include_disposal: bool = True
    access_difficulty: str = "normal"  # normal | difficult
