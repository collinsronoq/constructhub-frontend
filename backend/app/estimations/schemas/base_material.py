# app/schemas/materials/base_material.py
from pydantic import BaseModel
from typing import Dict, List


class BaseMaterial(BaseModel):
    name: str
    unit: str
    base_price: float
    quality_multiplier: Dict[str, float]
    phases: List[str]


class BaseMaterialsCatalog(BaseModel):
    materials: Dict[str, BaseMaterial]