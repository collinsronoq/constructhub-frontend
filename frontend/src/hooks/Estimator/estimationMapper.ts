import type { EstimationDetail, EstimationRequest } from "../../services/api/estimationTypes";
import type { EstimationBreakdown } from "./types";

export interface EstimationMeta {
  request?: EstimationRequest;
  projectName?: string | null;
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
  const projectDetails = backend.project_details ?? {};
  const phases = (backend.breakdown || []).map((phase: any, idx: number) => {
    const phaseKey = String(phase.phase_id ?? phase.phase ?? phase.name ?? `phase-${idx}`);
    const phaseTitle = String(
      phase.phase_name ?? phase.name ?? phase.phase_id ?? phase.phase ?? `Phase ${idx + 1}`
    );

    const materials = (phase.materials || []).map((m: any, i: number) => {
      const qty = Number(m.quantity ?? m.qty ?? m.amount ?? 0);
      const unitCost = Number(m.unit_cost ?? m.unit_rate ?? m.unitPrice ?? 0);
      const subtotal = Number(
        m.total ?? m.subtotal ?? m.cost ?? (isFinite(qty) && isFinite(unitCost) ? qty * unitCost : 0)
      );
      return {
        id: `${phaseKey}-mat-${i}`,
        name: m.name ?? m.description ?? m.material ?? m.item ?? `Material ${i + 1}`,
        qty,
        unit: m.unit ?? m.unit_type ?? "",
        unitCost,
        subtotal,
      };
    });

    const labour = (phase.labour ?? phase.labor ?? []).map((l: any, i: number) => {
      const days = Number(
        l.days ??
          l.duration_days ??
          l.duration ??
          ((l.unit === "day" || l.unit === "days") ? l.quantity : 0)
      );
      const ratePerDay = Number(l.rate_per_day ?? l.unit_rate ?? l.daily_rate ?? l.rate ?? 0);
      const subtotal = Number(
        l.total ?? l.subtotal ?? l.cost ?? (isFinite(days) && isFinite(ratePerDay) ? days * ratePerDay : 0)
      );
      return {
        id: `${phaseKey}-lab-${i}`,
        role: l.role ?? l.title ?? l.description ?? "Labour",
        days,
        ratePerDay,
        subtotal,
      };
    });

    const otherCosts = (phase.other_costs ?? phase.otherCosts ?? []).map((o: any, i: number) => {
      const amount = Number(
        o.amount ??
          o.total ??
          o.cost ??
          ((Number(o.quantity ?? 0) || 0) * (Number(o.unit_rate ?? 0) || 0))
      );
      return {
        id: `${phaseKey}-other-${i}`,
        name: o.name ?? o.label ?? o.description ?? `Other Cost ${i + 1}`,
        amount,
      };
    });

    // Transitional compatibility: UI has no dedicated equipment section yet.
    // Fold equipment into "other costs" so rendered totals remain coherent.
    const equipmentAsOther = (phase.equipment ?? []).map((e: any, i: number) => {
      const amount = Number(
        e.total ??
          e.cost ??
          ((Number(e.quantity ?? 0) || 0) * (Number(e.unit_rate ?? 0) || 0))
      );
      return {
        id: `${phaseKey}-equipment-${i}`,
        name: `Equipment: ${e.description ?? e.name ?? e.item_code ?? `Item ${i + 1}`}`,
        amount,
      };
    });
    const mergedOtherCosts = [...otherCosts, ...equipmentAsOther];

    const materialTotal = materials.reduce(
      (sum: number, m: { subtotal?: number }) => sum + (m.subtotal ?? 0),
      0
    );
    const labourTotal = labour.reduce(
      (sum: number, l: { subtotal?: number }) => sum + (l.subtotal ?? 0),
      0
    );
    const otherTotal = mergedOtherCosts.reduce((sum: number, o: { amount?: number }) => sum + (o.amount ?? 0), 0);
    const subtotal = Number(
      phase.totals?.phase_total ?? phase.subtotal ?? phase.total ?? materialTotal + labourTotal + otherTotal
    );

    return {
      id: phaseKey,
      title: phaseTitle.replace(/_/g, " "),
      materials,
      labour,
      otherCosts: mergedOtherCosts,
      technicians: (phase.technicians ?? phase.roles ?? []).map((t: any) => t?.name ?? t?.role ?? String(t)),
      subtotal,
    };
  });

  const floorArea =
    Number(
      projectDetails.floor_area_sqm ??
        request?.finishes.floor_area_sqm ??
        request?.services_second_fix.floor_area_sqm ??
        request?.services_first_fix.floor_area_sqm ??
        request?.foundation.floor_area_sqm ??
        request?.superstructure.declared_floor_area_sqm ??
        0
    ) || 0;

  const bedrooms = request?.superstructure.bedrooms ?? projectDetails.bedrooms;
  const bathrooms = request?.superstructure.bathrooms ?? projectDetails.bathrooms;
  const structureType = request?.superstructure.structure_type ?? projectDetails.structure_type;

  const permits = (backend.permits || []).map((permit: any, idx: number) => ({
    id: String(permit?.id ?? `permit-${idx}`),
    name: permit?.name ?? `Permit ${idx + 1}`,
    cost: permit?.cost ?? null,
    where: permit?.where ?? null,
    significance: permit?.significance ?? null,
    durationDays: permit?.duration_days ?? permit?.durationDays ?? null,
    status: permit?.status ?? null,
  }));

  return {
    projectTitle: meta?.projectName ?? request?.project_name ?? projectDetails.project_name ?? "Project",
    floorArea,
    quality: request?.superstructure.finishing_level ?? projectDetails.finishing_level ?? meta?.finishing ?? "Standard",
    bedrooms,
    bathrooms,
    structureType,
    totalCost: Number(backend.summary?.total_cost ?? phases.reduce((sum, p) => sum + (p.subtotal || 0), 0)),
    phases,
    recommendations: {
      vendors: [],
      technicians: [],
    },
    other: Number(
      backend.summary?.other_cost ??
        phases.reduce(
          (sum, p) =>
            sum +
            p.otherCosts.reduce(
              (phaseSum: number, item: { amount: number }) => phaseSum + item.amount,
              0
            ),
          0
        )
    ),
    permits,
  };
}
