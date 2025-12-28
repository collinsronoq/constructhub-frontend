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
    subtotal: float | None = None
    total: float | None = None

    @property
    def effective_subtotal(self) -> float:
        if self.subtotal is not None:
            return self.subtotal
        if self.total is not None:
            return self.total
        return 0.0

    @property
    def effective_total(self) -> float:
        if self.total is not None:
            return self.total
        if self.subtotal is not None:
            return self.subtotal
        return 0.0

    def model_post_init(self, __context):
        # Normalize subtotal/total so both are populated
        if self.subtotal is None and self.total is not None:
            object.__setattr__(self, "subtotal", self.total)
        if self.total is None and self.subtotal is not None:
            object.__setattr__(self, "total", self.subtotal)


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
