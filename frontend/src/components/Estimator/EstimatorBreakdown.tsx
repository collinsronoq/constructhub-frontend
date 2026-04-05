import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  BrickWall,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  CopyPlus,
  Fence,
  FileText,
  Hammer,
  HardHat,
  House,
  HousePlug,
  Info,
  LampCeiling,
  Layers,
  MapPin,
  Paintbrush,
  ShieldCheck,
} from "lucide-react";

import type { EstimationBreakdown } from "../../hooks/Estimator/types";
import { getPhaseDescription } from "./phaseDescriptions";

interface BreakdownProps {
  data: EstimationBreakdown;
  onBackToSummary?: () => void;
}

function formatCurrency(value: number): string {
  return `KSh ${Number(value || 0).toLocaleString()}`;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "N/A";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return Number.isFinite(value) ? value.toLocaleString() : "N/A";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "N/A";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function labelizeKey(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isNonEmptyObject(value: Record<string, unknown>): boolean {
  return Object.keys(value).length > 0;
}

function formatItemCount(count: number): string {
  return `${count} ${count === 1 ? "item" : "items"}`;
}

function EmptyState({ label }: { label: string }) {
  return <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>;
}

function PhaseTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: Array<Array<ReactNode>>;
}) {
  if (rows.length === 0) return <EmptyState label="No data" />;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs md:text-sm border border-gray-200 dark:border-gray-700">
        <thead className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-2 py-1 text-left whitespace-nowrap">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, rowIndex) => (
            <tr key={rowIndex} className="border-t border-gray-200 dark:border-gray-700">
              {cells.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-2 py-1 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PhaseSection({
  icon,
  title,
  summary,
  defaultOpen,
  children,
}: {
  icon: ReactNode;
  title: string;
  summary?: string;
  defaultOpen: boolean;
  children: ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
    >
      <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer px-3 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
          {icon}
          <span>{title}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
          {summary ? <span>{summary}</span> : null}
          <ChevronDown size={14} />
        </div>
      </summary>
      <div className="px-3 pb-3 pt-1">{children}</div>
    </details>
  );
}

export default function EstimatorBreakdown({ data, onBackToSummary }: BreakdownProps) {
  const [expandedPhases, setExpandedPhases] = useState<string[]>([]);

  const phaseIcons: Record<string, ReactNode> = useMemo(
    () => ({
      site_survey: <MapPin size={18} />,
      site_preparation: <CopyPlus size={18} />,
      site_preparation_and_earthworks: <CopyPlus size={18} />,
      foundation: <BrickWall size={18} />,
      superstructure: <House size={18} />,
      roofing: <HousePlug size={18} />,
      services: <LampCeiling size={18} />,
      services_first_fix: <LampCeiling size={18} />,
      services_second_fix: <LampCeiling size={18} />,
      finishes: <Paintbrush size={18} />,
      external_works: <Fence size={18} />,
    }),
    []
  );

  const onTogglePhase = (id: string) => {
    setExpandedPhases((prev) =>
      prev.includes(id) ? prev.filter((phaseId) => phaseId !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Estimate Breakdown</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Project: {data.projectTitle} - {formatCurrency(data.totalCost)}
          </p>
        </div>
        {onBackToSummary ? (
          <button
            onClick={onBackToSummary}
            className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-700"
          >
            Back to Summary
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">Floor Area</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {data.floorArea ? `${data.floorArea.toLocaleString()} sqm` : "N/A"}
          </div>
        </div>
        <div className="p-3 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">Storeys</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {data.storeys ? data.storeys.toLocaleString() : "N/A"}
          </div>
        </div>
        <div className="p-3 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">Structure</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {data.structureType ? labelizeKey(data.structureType) : "N/A"}
          </div>
        </div>
        <div className="p-3 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">Bedrooms</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {data.bedrooms ?? "N/A"}
          </div>
        </div>
        <div className="p-3 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">Bathrooms</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {data.bathrooms ?? "N/A"}
          </div>
        </div>
        <div className="p-3 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">Phases</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {data.phasesCount || data.phases.length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="p-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Cost</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(data.totalCost)}
          </div>
        </div>
        <div className="p-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">Materials</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(data.materialCost)}
          </div>
        </div>
        <div className="p-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">Labour</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(data.labourCost)}
          </div>
        </div>
        <div className="p-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">Equipment</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(data.equipmentCost)}
          </div>
        </div>
        <div className="p-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">Other Costs</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(data.otherCost)}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {data.phases.map((phase, index) => {
          const isOpen = expandedPhases.includes(phase.id);
          const narrative = getPhaseDescription(phase.id);
          const warningsCount = phase.warnings.length;
          const inputsCount = Object.keys(phase.inputsUsed).length;

          const materialsSummary = `${formatItemCount(phase.materials.length)} · ${formatCurrency(
            phase.totals.materials
          )}`;
          const labourSummary = `${formatItemCount(phase.labour.length)} · ${formatCurrency(
            phase.totals.labour
          )}`;
          const equipmentSummary = `${formatItemCount(phase.equipment.length)} · ${formatCurrency(
            phase.totals.equipment
          )}`;
          const quantitiesSummary = formatItemCount(phase.quantities.length);
          const otherCostsSummary = `${formatItemCount(phase.otherCosts.length)} · ${formatCurrency(
            phase.totals.other
          )}`;
          const metadataInputsSummary = `${labelizeKey(phase.metadata.confidence)} confidence · ${
            inputsCount === 1 ? "1 field" : `${inputsCount} fields`
          }`;

          return (
            <section
              key={phase.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            >
              <button
                type="button"
                onClick={() => onTogglePhase(phase.id)}
                className="w-full flex justify-between items-start gap-3 px-4 py-4 text-left"
              >
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-300 mt-1">
                    {phaseIcons[phase.id] || <Layers size={18} />}
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {phase.phaseName}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Phase {index + 1}</span>
                      {warningsCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                          <AlertTriangle size={12} />
                          {warningsCount} warning{warningsCount > 1 ? "s" : ""}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(phase.subtotal)}
                  </span>
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </button>

              {isOpen ? (
                <div className="px-4 pb-4 pt-2 space-y-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold mb-1 text-gray-900 dark:text-gray-100">
                      <House size={15} />
                      <span>Phase Scope & Outcome</span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300">{narrative.whatIsDone}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Outcome: <span className="font-medium">{narrative.outcome}</span>
                    </p>
                  </div>

                  <div className="rounded-md border border-gray-200 dark:border-gray-700 p-3 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      <Info size={14} />
                      <span>Assumptions, Warnings & Notes</span>
                    </div>

                    <div className="rounded border border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20 p-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-200 mb-1">
                        <AlertTriangle size={13} />
                        <span>Warnings</span>
                      </div>
                      {phase.warnings.length ? (
                        <ul className="list-disc list-inside text-xs space-y-1 text-amber-800 dark:text-amber-200">
                          {phase.warnings.map((entry) => (
                            <li key={entry}>{entry}</li>
                          ))}
                        </ul>
                      ) : (
                        <EmptyState label="No warnings" />
                      )}
                    </div>

                    <div className="rounded border border-gray-200 dark:border-gray-700 p-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        <Info size={13} />
                        <span>Assumptions</span>
                      </div>
                      {phase.assumptions.length ? (
                        <ul className="list-disc list-inside text-xs space-y-1 text-gray-700 dark:text-gray-300">
                          {phase.assumptions.map((entry) => (
                            <li key={entry}>{entry}</li>
                          ))}
                        </ul>
                      ) : (
                        <EmptyState label="No assumptions listed" />
                      )}
                    </div>

                    <div className="rounded border border-gray-200 dark:border-gray-700 p-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        <FileText size={13} />
                        <span>Notes</span>
                      </div>
                      {phase.notes.length ? (
                        <ul className="list-disc list-inside text-xs space-y-1 text-gray-700 dark:text-gray-300">
                          {phase.notes.map((entry) => (
                            <li key={entry}>{entry}</li>
                          ))}
                        </ul>
                      ) : (
                        <EmptyState label="No notes" />
                      )}
                    </div>
                  </div>

                  <PhaseSection
                    icon={<BrickWall size={16} />}
                    title="Materials"
                    summary={materialsSummary}
                    defaultOpen
                  >
                    <PhaseTable
                      headers={["Description", "Qty", "Unit Rate", "Total"]}
                      rows={phase.materials.map((item) => [
                        item.name,
                        `${item.qty.toLocaleString()} ${item.unit}`,
                        formatCurrency(item.unitCost),
                        <span className="font-semibold">{formatCurrency(item.subtotal)}</span>,
                      ])}
                    />
                  </PhaseSection>

                  <PhaseSection
                    icon={<Hammer size={16} />}
                    title="Labour"
                    summary={labourSummary}
                    defaultOpen
                  >
                    <PhaseTable
                      headers={["Description", "Days", "Rate/Day", "Total"]}
                      rows={phase.labour.map((item) => [
                        item.role,
                        item.days.toLocaleString(),
                        formatCurrency(item.ratePerDay),
                        <span className="font-semibold">{formatCurrency(item.subtotal)}</span>,
                      ])}
                    />
                  </PhaseSection>

                  <PhaseSection
                    icon={<HardHat size={16} />}
                    title="Equipment"
                    summary={equipmentSummary}
                    defaultOpen={false}
                  >
                    <PhaseTable
                      headers={["Description", "Qty", "Unit Rate", "Total"]}
                      rows={phase.equipment.map((item) => [
                        item.name,
                        `${item.qty.toLocaleString()} ${item.unit}`,
                        formatCurrency(item.unitCost),
                        <span className="font-semibold">{formatCurrency(item.subtotal)}</span>,
                      ])}
                    />
                  </PhaseSection>

                  <PhaseSection
                    icon={<ClipboardList size={16} />}
                    title="Quantities"
                    summary={quantitiesSummary}
                    defaultOpen={false}
                  >
                    <PhaseTable
                      headers={["Name", "Value", "Formula"]}
                      rows={phase.quantities.map((quantity) => [
                        quantity.name,
                        <span className="font-medium">
                          {quantity.value.toLocaleString()} {quantity.unit}
                        </span>,
                        quantity.formula ? (
                          <span className="text-[11px] text-gray-500 dark:text-gray-400">
                            {quantity.formula}
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400 dark:text-gray-500">N/A</span>
                        ),
                      ])}
                    />
                  </PhaseSection>

                  <PhaseSection
                    icon={<Fence size={16} />}
                    title="Other Costs"
                    summary={otherCostsSummary}
                    defaultOpen={false}
                  >
                    <PhaseTable
                      headers={["Description", "Amount"]}
                      rows={phase.otherCosts.map((item) => [
                        item.name,
                        <span className="font-semibold">{formatCurrency(item.amount)}</span>,
                      ])}
                    />
                  </PhaseSection>

                  <PhaseSection
                    icon={<ShieldCheck size={16} />}
                    title="Metadata / Inputs Used"
                    summary={metadataInputsSummary}
                    defaultOpen={false}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div className="p-3 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <div className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">
                          Metadata
                        </div>
                        <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                          <div>
                            <span className="font-medium">Version:</span> {phase.metadata.version}
                          </div>
                          <div>
                            <span className="font-medium">Pricing Source:</span>{" "}
                            {labelizeKey(phase.metadata.pricingSource)}
                          </div>
                          <div>
                            <span className="font-medium">Confidence:</span>{" "}
                            {labelizeKey(phase.metadata.confidence)}
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <div className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">
                          Inputs Used
                        </div>
                        {isNonEmptyObject(phase.inputsUsed) ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-xs border border-gray-200 dark:border-gray-700">
                              <thead className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                                <tr>
                                  <th className="px-2 py-1 text-left">Input</th>
                                  <th className="px-2 py-1 text-left">Value</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(phase.inputsUsed).map(([key, value]) => (
                                  <tr key={key} className="border-t border-gray-200 dark:border-gray-700">
                                    <td className="px-2 py-1">{labelizeKey(key)}</td>
                                    <td className="px-2 py-1">{formatValue(value)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <EmptyState label="No inputs metadata available" />
                        )}
                      </div>
                    </div>
                  </PhaseSection>
                </div>
              ) : null}
            </section>
          );
        })}
      </div>

      {data.permits.length > 0 ? (
        <div className="p-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Permits and Approvals
          </div>
          <div className="space-y-3">
            {data.permits.map((permit) => (
              <div
                key={permit.id}
                className="p-3 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {permit.name}
                  </div>
                  {permit.status ? (
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {labelizeKey(permit.status)}
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  {permit.cost !== null && permit.cost !== undefined ? (
                    <div>Cost: {formatCurrency(permit.cost)}</div>
                  ) : null}
                  {permit.durationDays ? <div>Duration: {permit.durationDays} days</div> : null}
                  {permit.where ? <div>Where: {permit.where}</div> : null}
                  {permit.significance ? <div>{permit.significance}</div> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
