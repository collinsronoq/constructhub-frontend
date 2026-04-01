# estimations/schemas.py
import re
from typing import Any, Dict, List, Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


# ----------------------------
# Legacy line-item models
# ----------------------------
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
        # Normalize subtotal/total so both are populated.
        if self.subtotal is None and self.total is not None:
            object.__setattr__(self, "subtotal", self.total)
        if self.total is None and self.subtotal is not None:
            object.__setattr__(self, "total", self.subtotal)


class OtherCost(BaseModel):
    name: str
    amount: float


# ----------------------------
# v2 shared contract models
# ----------------------------
CostCategory = Literal["material", "labour", "equipment", "other"]
CostSource = Literal["rate_table", "vendor", "assumed", "fixed_service"]
CostConfidence = Literal["low", "medium", "high"]


def _slug(value: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9]+", "_", (value or "").strip().lower())
    cleaned = cleaned.strip("_")
    return cleaned or "item"


def _title_from_phase_id(phase_id: str) -> str:
    if not phase_id:
        return "Phase"
    return phase_id.replace("_", " ").strip().title()


def _item_to_dict(item: Any) -> Dict[str, Any]:
    if isinstance(item, dict):
        return dict(item)
    if hasattr(item, "model_dump"):
        return item.model_dump()
    return {}


class QuantityItem(BaseModel):
    name: str
    value: float
    unit: str
    formula: str | None = None


class CostItem(BaseModel):
    """
    Canonical v2 cost line shared across material/labour/equipment/other.
    Supports legacy key coercion to keep old phases functional during migration.
    """

    model_config = ConfigDict(extra="ignore")

    item_code: str
    description: str
    unit: str
    quantity: float
    unit_rate: float
    total: float
    category: CostCategory
    source: CostSource = "assumed"
    confidence: CostConfidence = "medium"

    @model_validator(mode="before")
    @classmethod
    def _from_legacy(cls, raw: Any):
        data = _item_to_dict(raw)
        if not data:
            return raw

        category = data.get("category") or data.get("_category")

        description = (
            data.get("description")
            or data.get("name")
            or data.get("role")
            or data.get("label")
            or "Cost Item"
        )

        unit = data.get("unit")
        if not unit:
            if "days" in data:
                unit = "day"
            elif "amount" in data:
                unit = "sum"
            else:
                unit = "unit"

        quantity = data.get("quantity")
        if quantity is None:
            if "days" in data:
                quantity = float(data.get("days") or 0)
            elif "amount" in data:
                quantity = 1.0
            else:
                quantity = 0.0

        unit_rate = data.get("unit_rate")
        if unit_rate is None:
            unit_rate = data.get("unit_cost")
        if unit_rate is None:
            unit_rate = data.get("rate_per_day")
        if unit_rate is None and data.get("amount") is not None:
            unit_rate = data.get("amount")
        if unit_rate is None:
            q = float(quantity or 0)
            candidate_total = data.get("total")
            if candidate_total is None:
                candidate_total = data.get("subtotal")
            if candidate_total is not None and q > 0:
                unit_rate = float(candidate_total) / q
            else:
                unit_rate = 0.0

        total = data.get("total")
        if total is None:
            total = data.get("subtotal")
        if total is None and data.get("amount") is not None:
            total = data.get("amount")
        if total is None:
            total = float(quantity or 0) * float(unit_rate or 0)

        item_code = data.get("item_code") or _slug(str(description))
        resolved_category = category or "other"

        return {
            "item_code": item_code,
            "description": description,
            "unit": unit,
            "quantity": float(quantity or 0),
            "unit_rate": float(unit_rate or 0),
            "total": float(total or 0),
            "category": resolved_category,
            "source": data.get("source") or "assumed",
            "confidence": data.get("confidence") or "medium",
        }


class PhaseMetadata(BaseModel):
    version: str = "v1"
    pricing_source: str = "mixed"
    confidence: CostConfidence = "medium"


class PhaseTotals(BaseModel):
    materials: float = 0
    labour: float = 0
    equipment: float = 0
    other: float = 0
    phase_total: float = 0

    @model_validator(mode="after")
    def _normalize_phase_total(self):
        calculated = float(self.materials or 0) + float(self.labour or 0) + float(self.equipment or 0) + float(self.other or 0)
        object.__setattr__(self, "phase_total", calculated)
        return self


def _sum_totals(items: List[CostItem]) -> float:
    return float(sum(float(i.total or 0) for i in items))


def build_phase_totals(
    materials: List[CostItem] | None = None,
    labour: List[CostItem] | None = None,
    equipment: List[CostItem] | None = None,
    other_costs: List[CostItem] | None = None,
) -> PhaseTotals:
    mats = materials or []
    labs = labour or []
    eqp = equipment or []
    oth = other_costs or []
    return PhaseTotals(
        materials=_sum_totals(mats),
        labour=_sum_totals(labs),
        equipment=_sum_totals(eqp),
        other=_sum_totals(oth),
    )


def _coerce_cost_items(raw_items: Any, category: CostCategory) -> List[CostItem]:
    if not raw_items:
        return []
    coerced: List[CostItem] = []
    for raw in raw_items:
        payload = _item_to_dict(raw)
        if not payload:
            continue
        payload.setdefault("category", category)
        coerced.append(CostItem.model_validate(payload))
    return coerced


class PhaseEstimate(BaseModel):
    """
    Shared phase-result contract v2.
    Legacy compatibility:
      - accepts `phase` and mirrors to `phase_id`
      - accepts legacy MaterialCost/LabourCost/OtherCost line items
      - preserves `phase` in output during transition
    """

    phase_id: str | None = None
    phase_name: str | None = None
    phase: str | None = None  # transitional compatibility key

    inputs_used: Dict[str, Any] = Field(default_factory=dict)

    quantities: List[QuantityItem] = Field(default_factory=list)
    materials: List[CostItem] = Field(default_factory=list)
    labour: List[CostItem] = Field(default_factory=list)
    equipment: List[CostItem] = Field(default_factory=list)
    other_costs: List[CostItem] = Field(default_factory=list)

    totals: PhaseTotals | None = None

    assumptions: List[str] = Field(default_factory=list)
    notes: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    metadata: PhaseMetadata = Field(default_factory=PhaseMetadata)

    @model_validator(mode="before")
    @classmethod
    def _normalize_legacy_shape(cls, raw: Any):
        data = _item_to_dict(raw)
        if not data:
            return raw

        phase_id = data.get("phase_id") or data.get("phase")
        phase_name = data.get("phase_name") or (_title_from_phase_id(phase_id) if phase_id else None)

        data["phase_id"] = phase_id
        data["phase_name"] = phase_name
        data["phase"] = data.get("phase") or phase_id

        data["materials"] = _coerce_cost_items(data.get("materials"), "material")
        data["labour"] = _coerce_cost_items(data.get("labour"), "labour")
        data["equipment"] = _coerce_cost_items(data.get("equipment"), "equipment")
        data["other_costs"] = _coerce_cost_items(data.get("other_costs"), "other")

        if data.get("totals") is None:
            data["totals"] = build_phase_totals(
                materials=data["materials"],
                labour=data["labour"],
                equipment=data["equipment"],
                other_costs=data["other_costs"],
            )

        if data.get("metadata") is None:
            data["metadata"] = PhaseMetadata()

        return data

    @model_validator(mode="after")
    def _finalize(self):
        if not self.phase_id:
            fallback = self.phase or "unknown_phase"
            object.__setattr__(self, "phase_id", fallback)

        if not self.phase:
            object.__setattr__(self, "phase", self.phase_id)

        if not self.phase_name:
            object.__setattr__(self, "phase_name", _title_from_phase_id(self.phase_id or ""))

        if self.totals is None:
            object.__setattr__(
                self,
                "totals",
                build_phase_totals(
                    materials=self.materials,
                    labour=self.labour,
                    equipment=self.equipment,
                    other_costs=self.other_costs,
                ),
            )
        return self
