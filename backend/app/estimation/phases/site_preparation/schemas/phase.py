from typing import Literal

from pydantic import BaseModel


class SitePreparationInput(BaseModel):
    plot_size_sqm: float
    soil_type: str  # soft | medium | rocky
    excavation_depth_m: float
    include_disposal: bool = True
    access_difficulty: Literal["normal", "difficult"] = "normal"
    vegetation_density: Literal["light", "medium", "heavy"] = "medium"
    has_existing_structures: bool = False


__all__ = ["SitePreparationInput"]
