# estimations/schemas.py
from pydantic import BaseModel, Field
from typing import List


class LabourCost(BaseModel):
    role: str
    rate_per_day: float
    days: int
    total: float


class MaterialCost(BaseModel):
    name: str
    quantity: float
    unit: str
    unit_cost: float
    total: float


class OtherCost(BaseModel):
    name: str
    amount: float


class PhaseTotals(BaseModel):
    materials: float
    labour: float
    other: float
    phase_total: float


class PhaseEstimate(BaseModel):
    phase: str
    materials: List[MaterialCost] = Field(default_factory=list)
    labour: List[LabourCost] = Field(default_factory=list)
    other_costs: List[OtherCost] = Field(default_factory=list)
    totals: PhaseTotals
