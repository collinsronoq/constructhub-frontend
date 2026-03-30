import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {ResponsiveContainer,PieChart,Pie,Cell,Tooltip as ReTooltip,Legend,BarChart,Bar, XAxis, YAxis, CartesianGrid,} from "recharts";

import type { EstimationBreakdown } from "../../hooks/Estimator/types";
// import Recommendations from "../BuilderDashboard/Recommendations";
import { ChevronDown, ChevronUp, MapPin, FileText, Layers, Hammer, CopyPlus, BrickWall, House, LampCeiling, HousePlug, Paintbrush, Fence,} from "lucide-react";

// small palette
interface BreakdownnProps {
  data: EstimationBreakdown;
  onBackToSummary?: () => void;
}

function sumMaterials(phase: EstimationBreakdown["phases"][number]) {
  return phase.materials.reduce((sum, m) => sum + (m.subtotal || 0), 0);
}

function sumLabour(phase: EstimationBreakdown["phases"][number]) {
  return phase.labour.reduce((sum, l) => sum + (l.subtotal || 0), 0);
}

function sumOther(phase: EstimationBreakdown["phases"][number]) {
  return phase.otherCosts.reduce((sum, item) => sum + (item.amount || 0), 0);
}

function computeTotals(data: EstimationBreakdown) {
  const materialTotal = data.phases.reduce((sum, p) => sum + sumMaterials(p), 0);
  const labourTotal = data.phases.reduce((sum, p) => sum + sumLabour(p), 0);
  const otherTotal = data.phases.reduce((sum, p) => sum + sumOther(p), 0);
  return {
    materialTotal,
    labourTotal,
    otherTotal: otherTotal || data.other || 0,
    total: data.totalCost || materialTotal + labourTotal + otherTotal,
  };
}

function generateAIInsights(data: EstimationBreakdown) {
  const totals = computeTotals(data);
  const biggest = [...data.phases].sort((a, b) => b.subtotal - a.subtotal)[0];
  return {
    topCostPhase: biggest ? `${biggest.title} is the highest cost driver.` : "",
    materialVsLabour:
      totals.materialTotal > totals.labourTotal
        ? "Materials dominate the cost; consider material substitutions."
        : "Labour is significant; consider sequencing and crew efficiency.",
  };
}

function formatNumber(value?: number | null, suffix?: string) {
  if (value === null || value === undefined || Number.isNaN(value) || value <= 0) {
    return "N/A";
  }
  return suffix ? `${value} ${suffix}` : String(value);
}

function formatLabel(value?: string | null) {
  if (!value) return "N/A";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export default function EstimatorBreakdown({ data, onBackToSummary }: BreakdownnProps) {
  console.info("[EstimatorBreakdown] received data", data);
  const totals = computeTotals(data);
  const insights = generateAIInsights(data);
  const [expandedPhases, setExpandedPhases] = useState<string[]>([]);
  // const [selectedPhase, setSelectedPhase] = useState<string | null>(null);

  const phaseIcons: Record<string, ReactNode> = {
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
  };

  const onTogglePhase = (id: string) => {
    setExpandedPhases((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const chartData = useMemo(
    () =>
      data.phases.map((p) => ({
        name: p.title,
        value: p.subtotal,
        materials: sumMaterials(p),
        labour: sumLabour(p),
        other: sumOther(p),
      })),
    [data.phases]
  );

  const colors = ["#1e3a8a", "#0ea5e9", "#34d399", "#f97316", "#f59e0b", "#ef4444", "#8b5cf6", "#22c55e"];
  const legendRows = useMemo(() => {
    const half = Math.ceil(chartData.length / 2);
    return [chartData.slice(0, half), chartData.slice(half)];
  }, [chartData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Estimate Breakdown</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Project: {data.projectTitle}</p>
        </div>
        {onBackToSummary && (
          <button
            onClick={onBackToSummary}
            className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-700"
          >
            Back to Summary
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-3 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">Bedrooms</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {formatNumber(data.bedrooms)}
          </div>
        </div>
        <div className="p-3 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">Bathrooms</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {formatNumber(data.bathrooms)}
          </div>
        </div>
        <div className="p-3 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">Floor Area</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {formatNumber(data.floorArea, "sqm")}
          </div>
        </div>
        <div className="p-3 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">Structure Type</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {formatLabel(data.structureType)}
          </div>
        </div>
        <div className="p-3 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">Quality</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {formatLabel(data.quality)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Cost</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            KSh {totals.total.toLocaleString()}
          </div>
        </div>
        <div className="p-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">Materials</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            KSh {totals.materialTotal.toLocaleString()}
          </div>
        </div>
        <div className="p-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">Labour</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            KSh {totals.labourTotal.toLocaleString()}
          </div>
        </div>
        <div className="p-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">Other Costs</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            KSh {totals.otherTotal.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Cost by Phase</div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {chartData.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
                  ))}
                </Pie>
                <ReTooltip />
                <Legend verticalAlign="top" height={0} content={() => null} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300">
            {legendRows.map((row, idx) => (
              <div key={idx} className="space-y-1">
                {row.map((item, i) => {
                  const color = colors[(idx * legendRows[0].length + i) % colors.length];
                  return (
                    <div key={item.name} className="flex items-center space-x-2">
                      <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                      <span className="truncate">{item.name}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-80">
          <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Cost Composition by Phase</div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <ReTooltip />
                <Legend />
                <Bar dataKey="materials" stackId="a" fill="#0ea5e9" name="Materials" />
                <Bar dataKey="labour" stackId="a" fill="#f59e0b" name="Labour" />
                <Bar dataKey="other" stackId="a" fill="#34d399" name="Other Costs" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex space-x-4 text-xs text-gray-700 dark:text-gray-300">
            <div className="flex items-center space-x-2">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#0ea5e9" }} />
              <span className="truncate">Materials</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#f59e0b" }} />
              <span className="truncate">Labour</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#34d399" }} />
              <span className="truncate">Other Costs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="p-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Quick Insights</div>
        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
          {insights.topCostPhase && <li>{insights.topCostPhase}</li>}
          {insights.materialVsLabour && <li>{insights.materialVsLabour}</li>}
        </ul>
      </div>


      {/* Phases */}
      <div className="space-y-3">
        {data.phases.map((phase, idx) => {
          const isOpen = expandedPhases.includes(phase.id);
          const matTotal = sumMaterials(phase);
          const labTotal = sumLabour(phase);
          const otherTotal = sumOther(phase);
          return (
            <div key={phase.id} className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
              <button
                type="button"
                onClick={() => onTogglePhase(phase.id)}
                className="w-full flex justify-between items-center px-4 py-3"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-blue-600 dark:text-blue-300">
                    {phaseIcons[phase.id] || <Layers size={18} />}
                  </span>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{phase.title}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Phase {idx + 1}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-700 dark:text-gray-300">
                  <span>Subtotal: KSh {phase.subtotal.toLocaleString()}</span>
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  {/* Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center space-x-2">
                      <Layers size={18} />
                      <div>
                        <div className="text-xs text-gray-500">Materials</div>
                        <div className="font-semibold">KSh {matTotal.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="p-3 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center space-x-2">
                      <Hammer size={18} />
                      <div>
                        <div className="text-xs text-gray-500">Labour</div>
                        <div className="font-semibold">KSh {labTotal.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="p-3 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center space-x-2">
                      <Fence size={18} />
                      <div>
                        <div className="text-xs text-gray-500">Other Costs</div>
                        <div className="font-semibold">KSh {otherTotal.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="p-3 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center space-x-2">
                      <FileText size={18} />
                      <div>
                        <div className="text-xs text-gray-500">Subtotal</div>
                        <div className="font-semibold">KSh {phase.subtotal.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Materials */}
                  <div>
                    <div className="flex items-center space-x-2 text-sm font-semibold mb-2">
                      <BrickWall size={16} />
                      <span>Materials</span>
                    </div>
                    {phase.materials.length === 0 && <div className="text-xs text-gray-500">No materials</div>}
                    {phase.materials.length > 0 && (
                      <div className="overflow-auto">
                        <table className="min-w-full text-xs md:text-sm border border-gray-200 dark:border-gray-700">
                          <thead className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                            <tr>
                              <th className="px-2 py-1 text-left">Name</th>
                              <th className="px-2 py-1 text-left">Qty</th>
                              <th className="px-2 py-1 text-left">Unit Cost</th>
                              <th className="px-2 py-1 text-left">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {phase.materials.map((m) => (
                              <tr key={m.id} className="border-t border-gray-200 dark:border-gray-700">
                                <td className="px-2 py-1">{m.name}</td>
                                <td className="px-2 py-1">
                                  {m.qty} {m.unit}
                                </td>
                                <td className="px-2 py-1">KSh {m.unitCost.toLocaleString()}</td>
                                <td className="px-2 py-1 font-semibold">KSh {m.subtotal.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Labour */}
                  <div>
                    <div className="flex items-center space-x-2 text-sm font-semibold mb-2">
                      <Hammer size={16} />
                      <span>Labour</span>
                    </div>
                    {phase.labour.length === 0 && <div className="text-xs text-gray-500">No labour</div>}
                    {phase.labour.length > 0 && (
                      <div className="overflow-auto">
                        <table className="min-w-full text-xs md:text-sm border border-gray-200 dark:border-gray-700">
                          <thead className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                            <tr>
                              <th className="px-2 py-1 text-left">Role</th>
                              <th className="px-2 py-1 text-left">Days</th>
                              <th className="px-2 py-1 text-left">Rate/Day</th>
                              <th className="px-2 py-1 text-left">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {phase.labour.map((l) => (
                              <tr key={l.id} className="border-t border-gray-200 dark:border-gray-700">
                                <td className="px-2 py-1">{l.role}</td>
                                <td className="px-2 py-1">{l.days}</td>
                                <td className="px-2 py-1">KSh {l.ratePerDay.toLocaleString()}</td>
                                <td className="px-2 py-1 font-semibold">KSh {l.subtotal.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 text-sm font-semibold mb-2">
                      <Fence size={16} />
                      <span>Other Costs</span>
                    </div>
                    {phase.otherCosts.length === 0 && <div className="text-xs text-gray-500">No other costs</div>}
                    {phase.otherCosts.length > 0 && (
                      <div className="overflow-auto">
                        <table className="min-w-full text-xs md:text-sm border border-gray-200 dark:border-gray-700">
                          <thead className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                            <tr>
                              <th className="px-2 py-1 text-left">Name</th>
                              <th className="px-2 py-1 text-left">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {phase.otherCosts.map((item) => (
                              <tr key={item.id} className="border-t border-gray-200 dark:border-gray-700">
                                <td className="px-2 py-1">{item.name}</td>
                                <td className="px-2 py-1 font-semibold">KSh {item.amount.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      
      {data.permits.length > 0 && (
        <div className="p-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Permits and Approvals</div>
          <div className="space-y-3">
            {data.permits.map((permit) => (
              <div
                key={permit.id}
                className="p-3 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{permit.name}</div>
                  {permit.status && (
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {formatLabel(permit.status)}
                    </span>
                  )}
                </div>
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  {permit.cost !== null && permit.cost !== undefined && (
                    <div>Cost: KSh {Number(permit.cost).toLocaleString()}</div>
                  )}
                  {permit.durationDays ? <div>Duration: {permit.durationDays} days</div> : null}
                  {permit.where ? <div>Where: {permit.where}</div> : null}
                  {permit.significance ? <div>{permit.significance}</div> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Recommendations</div>
          {/* <Recommendations vendorData={data.recommendations.vendors} technicianData={data.recommendations.technicians} /> */}
        </div>
        <div className="p-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 space-y-2">
          <div className="flex items-center space-x-2 text-sm font-semibold">
            <Fence size={16} />
            <span>Other</span>
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Other costs: KSh {totals.otherTotal.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
