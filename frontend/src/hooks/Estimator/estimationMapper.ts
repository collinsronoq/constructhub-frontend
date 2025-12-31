import type { EstimationDetail, EstimationRequest } from "../../services/api/estimationTypes";
import type { EstimationBreakdown } from "./useEstimationData";

export interface EstimationMeta {
  request?: EstimationRequest;
  projectName?: string | null;
  landSize?: number | null;
  finishing?: string | null;
}

/**
 * Normalize backend EstimationDetail into the UI-friendly EstimationBreakdown shape.
 */
export function mapEstimationDetailToBreakdown(
  backend: EstimationDetail,
  meta?: EstimationMeta
): EstimationBreakdown {
  const request = meta?.request;
  const phases = (backend.breakdown || []).map((phase: any, idx: number) => {
    const materials = (phase.materials || []).map((m: any, i: number) => {
      const qty = Number(m.quantity ?? m.qty ?? m.amount ?? 0);
      const unitCost = Number(m.unit_cost ?? m.unitPrice ?? 0);
      const subtotal = Number(
        m.total ?? m.subtotal ?? m.cost ?? (isFinite(qty) && isFinite(unitCost) ? qty * unitCost : 0)
      );
      return {
        id: `${phase.phase ?? phase.name ?? "phase"}-mat-${i}`,
        name: m.name ?? m.material ?? m.item ?? `Material ${i + 1}`,
        qty,
        unit: m.unit ?? m.unit_type ?? "",
        unitCost,
        subtotal,
      };
    });

    const labour = (phase.labour ?? phase.labor ?? []).map((l: any, i: number) => {
      const days = Number(l.days ?? l.duration_days ?? l.duration ?? 0);
      const ratePerDay = Number(l.rate_per_day ?? l.daily_rate ?? l.rate ?? 0);
      const subtotal = Number(
        l.total ?? l.subtotal ?? l.cost ?? (isFinite(days) && isFinite(ratePerDay) ? days * ratePerDay : 0)
      );
      return {
        id: `${phase.phase ?? phase.name ?? "phase"}-lab-${i}`,
        role: l.role ?? l.title ?? "Labour",
        days,
        ratePerDay,
        subtotal,
      };
    });

    const materialTotal = materials.reduce((sum, m) => sum + (m.subtotal || 0), 0);
    const labourTotal = labour.reduce((sum, l) => sum + (l.subtotal || 0), 0);
    const subtotal = Number(phase.totals?.phase_total ?? phase.subtotal ?? phase.total ?? materialTotal + labourTotal);

    return {
      id: (phase.phase ?? phase.name ?? `phase-${idx}`).toString(),
      title: (phase.phase ?? phase.name ?? `Phase ${idx + 1}`).replace(/_/g, " "),
      materials,
      labour,
      technicians: (phase.technicians ?? phase.roles ?? []).map((t: any) => t?.name ?? t?.role ?? String(t)),
      subtotal,
    };
  });

  const floorArea =
    Number(
      request?.superstructure.declared_floor_area_sqm ??
        request?.superstructure.land_size_sqm ??
        meta?.landSize ??
        0
    ) || 1;

  return {
    projectTitle: meta?.projectName ?? request?.project_name ?? "Project",
    floorArea,
    quality: request?.superstructure.finishing_level ?? meta?.finishing ?? "Standard",
    totalCost: Number(backend.summary?.total_cost ?? phases.reduce((sum, p) => sum + (p.subtotal || 0), 0)),
    phases,
    recommendations: {
      vendors: [],
      technicians: [],
    },
    other: Number(backend.summary?.other_cost ?? 0),
  };
}
