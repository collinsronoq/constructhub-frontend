# estimations/schemas.py
from pydantic import BaseModel
from typing import List


class MaterialItem(BaseModel):
    id: str
    name: str
    qty: float
    unit: str
    unitCost: float
    subtotal: float


class LabourItem(BaseModel):
    id: str
    role: str
    days: int
    ratePerDay: float
    subtotal: float


class PhaseEstimate(BaseModel):
    id: str
    title: str
    subtotal: float
    materials: List[MaterialItem]
    labour: List[LabourItem]
    technicians: List[str]


class EstimationBreakdown(BaseModel):
    projectTitle: str
    floorArea: int
    quality: str
    phases: List[PhaseEstimate]

    recommendations: dict


class CategoryCost(BaseModel):
    name: str
    cost: float


class EstimateSummary(BaseModel):
    projectName: str
    projectType: str
    location: str
    totalCost: float
    duration: str

    materialCost: float
    laborCost: float
    avgKenyaCost: float
    potentialSavings: float
    keyChoices: List[str]

    categories: List[CategoryCost]


class EstimationResponse(BaseModel):
    summary: EstimateSummary
    breakdown: EstimationBreakdown


# hizi ni mambo ya breakdown, hizo phases zake mob specifically

class LabourCost(BaseModel):
    role: str
    rate_per_day: float
    days: int
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
    materials: List = []
    labour: List[LabourCost]
    other_costs: List[OtherCost]
    totals: PhaseTotals
