import type { EstimationDetail, EstimationRequest, PhaseEstimate } from "../../services/api/estimationTypes";
import type {
  EquipmentLine,
  EstimationBreakdown,
  LabourLine,
  MaterialLine,
  OtherCostLine,
  QuantityLine,
} from "./types";

export interface EstimationMeta {
  request?: EstimationRequest;
  projectName?: string | null;
  finishing?: string | null;
}

type LooseRecord = Record<string, unknown>;

function asRecord(value: unknown): LooseRecord {
  return value && typeof value === "object" ? (value as LooseRecord) : {};
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() !== "" ? value : fallback;
}

function asArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function asConfidence(value: unknown): "low" | "medium" | "high" {
  if (value === "low" || value === "medium" || value === "high") return value;
  return "medium";
}

function mapMaterialLines(phaseKey: string, rawItems: unknown[]): MaterialLine[] {
  return rawItems.map((item, i) => {
    const raw = asRecord(item);
    const qty = asNumber(raw.quantity ?? raw.qty ?? raw.amount);
    const unitCost = asNumber(raw.unit_rate ?? raw.unit_cost ?? raw.unitPrice);
    const subtotal = asNumber(raw.total ?? raw.subtotal ?? raw.cost, qty * unitCost);

    return {
      id: `${phaseKey}-mat-${i}`,
      name: asString(raw.description ?? raw.name ?? raw.material ?? raw.item, `Material ${i + 1}`),
      qty,
      unit: asString(raw.unit ?? raw.unit_type),
      unitCost,
      subtotal,
    };
  });
}

function mapLabourLines(phaseKey: string, rawItems: unknown[]): LabourLine[] {
  return rawItems.map((item, i) => {
    const raw = asRecord(item);
    const quantity = asNumber(raw.quantity);
    const days = asNumber(
      raw.days ??
        raw.duration_days ??
        raw.duration ??
        ((raw.unit === "day" || raw.unit === "days") ? quantity : undefined),
      quantity
    );
    const ratePerDay = asNumber(raw.unit_rate ?? raw.rate_per_day ?? raw.daily_rate ?? raw.rate);
    const subtotal = asNumber(raw.total ?? raw.subtotal ?? raw.cost, days * ratePerDay);

    return {
      id: `${phaseKey}-lab-${i}`,
      role: asString(raw.description ?? raw.role ?? raw.title, `Labour ${i + 1}`),
      days,
      ratePerDay,
      subtotal,
    };
  });
}

function mapEquipmentLines(phaseKey: string, rawItems: unknown[]): EquipmentLine[] {
  return rawItems.map((item, i) => {
    const raw = asRecord(item);
    const qty = asNumber(raw.quantity ?? raw.qty ?? raw.amount);
    const unitCost = asNumber(raw.unit_rate ?? raw.unit_cost ?? raw.unitPrice);
    const subtotal = asNumber(raw.total ?? raw.subtotal ?? raw.cost, qty * unitCost);

    return {
      id: `${phaseKey}-eq-${i}`,
      name: asString(raw.description ?? raw.name ?? raw.item_code, `Equipment ${i + 1}`),
      qty,
      unit: asString(raw.unit ?? raw.unit_type),
      unitCost,
      subtotal,
    };
  });
}

function mapQuantityLines(phaseKey: string, rawItems: unknown[]): QuantityLine[] {
  return rawItems.map((item, i) => {
    const raw = asRecord(item);
    return {
      id: `${phaseKey}-qty-${i}`,
      name: asString(raw.name, `Quantity ${i + 1}`),
      value: asNumber(raw.value),
      unit: asString(raw.unit),
      formula: asString(raw.formula, "") || null,
    };
  });
}

function mapOtherCostLines(phaseKey: string, rawItems: unknown[]): OtherCostLine[] {
  return rawItems.map((item, i) => {
    const raw = asRecord(item);
    const amount = asNumber(
      raw.amount ?? raw.total ?? raw.subtotal ?? raw.cost,
      asNumber(raw.quantity) * asNumber(raw.unit_rate)
    );

    return {
      id: `${phaseKey}-other-${i}`,
      name: asString(raw.description ?? raw.name ?? raw.label, `Other Cost ${i + 1}`),
      amount,
    };
  });
}

/**
 * Normalize backend EstimationDetail into the UI-friendly EstimationBreakdown shape.
 */
export function mapEstimationDetailToBreakdown(
  backend: EstimationDetail,
  meta?: EstimationMeta
): EstimationBreakdown {
  const request = meta?.request;
  const projectDetails = backend.project_details ?? {};
  const phases = asArray<PhaseEstimate>(backend.breakdown).map((phase, idx) => {
    const legacyPhase = asRecord(phase as unknown);
    const phaseKey = String(phase.phase_id ?? legacyPhase.phase ?? `phase-${idx}`);
    const phaseTitle = String(phase.phase_name ?? legacyPhase.name ?? phase.phase_id ?? `Phase ${idx + 1}`);

    const materials = mapMaterialLines(phaseKey, asArray(phase.materials));
    const labour = mapLabourLines(phaseKey, asArray(phase.labour));
    const equipment = mapEquipmentLines(phaseKey, asArray(phase.equipment));
    const otherCosts = mapOtherCostLines(phaseKey, asArray(phase.other_costs));
    const quantities = mapQuantityLines(phaseKey, asArray(phase.quantities));

    const materialTotal = materials.reduce((sum, line) => sum + line.subtotal, 0);
    const labourTotal = labour.reduce((sum, line) => sum + line.subtotal, 0);
    const equipmentTotal = equipment.reduce((sum, line) => sum + line.subtotal, 0);
    const otherTotal = otherCosts.reduce((sum, line) => sum + line.amount, 0);

    const subtotal = asNumber(
      phase.totals?.phase_total ?? legacyPhase.subtotal ?? legacyPhase.total,
      materialTotal + labourTotal + equipmentTotal + otherTotal
    );

    return {
      id: phaseKey,
      title: phaseTitle.replace(/_/g, " "),
      phaseName: phaseTitle,
      materials,
      labour,
      equipment,
      otherCosts,
      quantities,
      assumptions: asStringList(phase.assumptions),
      notes: asStringList(phase.notes),
      warnings: asStringList(phase.warnings),
      metadata: {
        version: asString(phase.metadata?.version, "v2"),
        pricingSource: asString(phase.metadata?.pricing_source, "mixed"),
        confidence: asConfidence(phase.metadata?.confidence),
      },
      inputsUsed: asRecord(phase.inputs_used),
      totals: {
        materials: asNumber(phase.totals?.materials, materialTotal),
        labour: asNumber(phase.totals?.labour, labourTotal),
        equipment: asNumber(phase.totals?.equipment, equipmentTotal),
        other: asNumber(phase.totals?.other, otherTotal),
        phaseTotal: asNumber(phase.totals?.phase_total, subtotal),
      },
      technicians: [],
      subtotal,
    };
  });

  const floorArea = asNumber(
    projectDetails.floor_area_sqm ?? request?.superstructure.declared_floor_area_sqm,
    0
  );

  const bedrooms = request?.superstructure.bedrooms ?? projectDetails.bedrooms;
  const bathrooms = request?.superstructure.bathrooms ?? projectDetails.bathrooms;
  const structureType = request?.superstructure.structure_type ?? projectDetails.structure_type;

  const permits = asArray(backend.permits).map((permit, idx) => ({
    id: String(permit?.id ?? `permit-${idx}`),
    name: permit?.name ?? `Permit ${idx + 1}`,
    cost: permit?.cost ?? null,
    where: permit?.where ?? null,
    significance: permit?.significance ?? null,
    durationDays: permit?.duration_days ?? null,
    status: permit?.status ?? null,
  }));

  return {
    projectTitle: meta?.projectName ?? request?.project_name ?? projectDetails.project_name ?? "Project",
    floorArea,
    quality: request?.superstructure.finishing_level ?? projectDetails.finishing_level ?? meta?.finishing ?? "Standard",
    bedrooms,
    bathrooms,
    structureType,
    storeys: asNumber(projectDetails.storeys),
    totalCost: asNumber(backend.summary?.total_cost, phases.reduce((sum, p) => sum + p.subtotal, 0)),
    materialCost: asNumber(
      backend.summary?.material_cost,
      phases.reduce((sum, phase) => sum + phase.totals.materials, 0)
    ),
    labourCost: asNumber(
      backend.summary?.labour_cost,
      phases.reduce((sum, phase) => sum + phase.totals.labour, 0)
    ),
    equipmentCost: asNumber(
      backend.summary?.equipment_cost,
      phases.reduce((sum, phase) => sum + phase.totals.equipment, 0)
    ),
    otherCost: asNumber(
      backend.summary?.other_cost,
      phases.reduce((sum, phase) => sum + phase.totals.other, 0)
    ),
    phasesCount: asNumber(backend.summary?.phases_count, phases.length),
    phases,
    recommendations: {
      vendors: [],
      technicians: [],
    },
    other: asNumber(backend.summary?.other_cost),
    permits,
  };
}
