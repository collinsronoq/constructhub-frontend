// import React, { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { ChevronDown, ChevronUp } from "lucide-react";

// interface BreakdownItem {
//   material: string;
//   quantity: number;
//   unit: string;
//   unitCost: number;
//   totalCost: number;
//   vendor?: string;
// }

// interface BreakdownCategory {
//   name: string;
//   materials: BreakdownItem[];
//   laborCost: number;
//   subtotal: number;
// }

// interface EstimateBreakdownProps {
//   breakdown: BreakdownCategory[];
//   total: number;
//   onBackToSummary: () => void;
// }

// const EstimateBreakdown: React.FC<EstimateBreakdownProps> = ({
//   breakdown,
//   total,
//   onBackToSummary,
// }) => {
//   const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

//   const toggleCategory = (name: string) => {
//     setExpandedCategory((prev) => (prev === name ? null : name));
//   };

//   const formatCurrency = (val: number) => `KSh ${val.toLocaleString()}`;

//   return (
//     <section className="p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
//           Detailed Estimate Breakdown
//         </h2>
//         <button
//           onClick={onBackToSummary}
//           className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
//         >
//           ← Back to Summary
//         </button>
//       </div>

//       {/* Breakdown Categories */}
//       {breakdown.map((category) => {
//         const percentage = ((category.subtotal / total) * 100).toFixed(1);

//         return (
//           <div
//             key={category.name}
//             className="border rounded-lg border-gray-200 dark:border-gray-700 overflow-hidden"
//           >
//             {/* Header */}
//             <button
//               onClick={() => toggleCategory(category.name)}
//               className="w-full flex justify-between items-center bg-gray-100 dark:bg-gray-800 px-4 py-3 text-left"
//             >
//               <div className="flex flex-col">
//                 <span className="font-medium text-gray-900 dark:text-gray-100">
//                   {category.name}
//                 </span>
//                 <span className="text-xs text-gray-500 dark:text-gray-400">
//                   {percentage}% of total cost
//                 </span>
//               </div>
//               {expandedCategory === category.name ? (
//                 <ChevronUp className="text-gray-500" />
//               ) : (
//                 <ChevronDown className="text-gray-500" />
//               )}
//             </button>

//             {/* Expanded Content */}
//             <AnimatePresence>
//               {expandedCategory === category.name && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: "auto" }}
//                   exit={{ opacity: 0, height: 0 }}
//                   transition={{ duration: 0.3 }}
//                   className="p-4 bg-white dark:bg-gray-900"
//                 >
//                   {/* Table */}
//                   <div className="overflow-x-auto">
//                     <table className="min-w-full border-collapse text-sm">
//                       <thead>
//                         <tr className="text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
//                           <th className="p-2 text-left">Material</th>
//                           <th className="p-2 text-left">Quantity</th>
//                           <th className="p-2 text-left">Unit</th>
//                           <th className="p-2 text-left">Unit Cost</th>
//                           <th className="p-2 text-left">Total Cost</th>
//                           <th className="p-2 text-left">Vendor</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {category.materials.map((item, index) => (
//                           <tr
//                             key={index}
//                             className="border-b border-gray-100 dark:border-gray-800"
//                           >
//                             <td className="p-2 text-gray-800 dark:text-gray-200">
//                               {item.material}
//                             </td>
//                             <td className="p-2">{item.quantity}</td>
//                             <td className="p-2">{item.unit}</td>
//                             <td className="p-2">{formatCurrency(item.unitCost)}</td>
//                             <td className="p-2 font-medium text-blue-600 dark:text-blue-400">
//                               {formatCurrency(item.totalCost)}
//                             </td>
//                             <td className="p-2 text-gray-600 dark:text-gray-400">
//                               {item.vendor || "—"}
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>

//                   {/* Subtotals */}
//                   <div className="flex justify-between mt-4 text-sm">
//                     <span className="text-gray-700 dark:text-gray-300">
//                       Labor Cost:
//                     </span>
//                     <span className="font-semibold text-gray-900 dark:text-gray-100">
//                       {formatCurrency(category.laborCost)}
//                     </span>
//                   </div>

//                   <div className="flex justify-between mt-1 text-sm">
//                     <span className="text-gray-700 dark:text-gray-300">
//                       Subtotal (Materials + Labor):
//                     </span>
//                     <span className="font-semibold text-blue-600 dark:text-blue-400">
//                       {formatCurrency(category.subtotal)}
//                     </span>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>
//         );
//       })}

//       {/* Total Summary */}
//       <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 text-right">
//         <p className="text-gray-700 dark:text-gray-200 text-lg font-semibold">
//           Total Project Estimate:{" "}
//           <span className="text-blue-700 dark:text-blue-300">
//             {formatCurrency(total)}
//           </span>
//         </p>
//       </div>
//     </section>
//   );
// };

// export default EstimateBreakdown;


// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import type { EstimationBreakdown } from "../../hooks/Estimator/useEstimationData";
// import { ChevronDown, ChevronUp } from "lucide-react";
// import VendorCard from "../VendorCard";
// import TechnicianCard from "../TechnicianCard";


// interface BreakdownProps {
//   data: EstimationBreakdown;
//   onBackToSummary?: () => void;
 
// }

// const BreakdownComponent: React.FC<BreakdownProps> = ({ data, onBackToSummary }) => {
//   const [openPhase, setOpenPhase] = useState<string | null>(null);

//   const togglePhase = (id: string) => {
//     setOpenPhase((prev) => (prev === id ? null : id));
//   };

//   const formatCurrency = (val: number) =>
//     `KSh ${val.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;

  

//   const navigate = useNavigate();

//   /** 🔎 Navigate to Vendor Profile */
//   const handleViewTechnician = (technicianID: string) => {
//     navigate("/technician/profile", { state: { id: technicianID } });
//   };

//   /** 🔎 Navigate to Technician Profile */
//   const handleViewVendor = (vendorId: string) => {
//     navigate("/vendor/profile", { state: { id: vendorId } });
//   };
  
//   return (
//     <div className="space-y-6 p-4 md:p-8">
//       {/* Project Header */}
//       <div>
//         <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
//           {data.projectTitle} – Detailed Breakdown
//         </h2>
//         <p className="text-gray-600 dark:text-gray-400 text-sm">
//           Quality: {data.quality} • Floor Area: {data.floorArea} m²
//         </p>
//       </div>

//       {/* Phases Section */}
//       <div className="space-y-4">
//         {data.phases.map((phase) => (
//           <div
//             key={phase.id}
//             className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 shadow-sm"
//           >
//             <div
//               className="flex justify-between items-center p-4 cursor-pointer"
//               onClick={() => togglePhase(phase.id)}
//             >
//               <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">
//                 {phase.title}
//               </h3>
//               <div className="flex items-center gap-3">
//                 <span className="font-semibold text-blue-600 dark:text-blue-400">
//                   {formatCurrency(phase.subtotal)}
//                 </span>
//                 {openPhase === phase.id ? (
//                   <ChevronUp size={18} className="text-gray-500" />
//                 ) : (
//                   <ChevronDown size={18} className="text-gray-500" />
//                 )}
//               </div>
//             </div>

//             {openPhase === phase.id && (
//               <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
//                 {/* Materials */}
//                 <div>
//                   <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
//                     Materials
//                   </h4>
//                   <div className="overflow-x-auto">
//                     <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700">
//                       <thead className="bg-gray-50 dark:bg-gray-800">
//                         <tr>
//                           <th className="px-2 py-1 text-left">Item</th>
//                           <th className="px-2 py-1 text-right">Qty</th>
//                           <th className="px-2 py-1 text-right">Unit Cost</th>
//                           <th className="px-2 py-1 text-right">Subtotal</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {phase.materials.map((mat) => (
//                           <tr key={mat.id} className="border-t dark:border-gray-700">
//                             <td className="px-2 py-1">{mat.name}</td>
//                             <td className="px-2 py-1 text-right">{mat.qty}</td>
//                             <td className="px-2 py-1 text-right">
//                               {formatCurrency(mat.unitCost)}
//                             </td>
//                             <td className="px-2 py-1 text-right font-medium">
//                               {formatCurrency(mat.subtotal)}
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>

//                 {/* Labour */}
//                 <div>
//                   <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
//                     Labour
//                   </h4>
//                   <div className="overflow-x-auto">
//                     <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700">
//                       <thead className="bg-gray-50 dark:bg-gray-800">
//                         <tr>
//                           <th className="px-2 py-1 text-left">Role</th>
//                           <th className="px-2 py-1 text-right">Days</th>
//                           <th className="px-2 py-1 text-right">Rate/Day</th>
//                           <th className="px-2 py-1 text-right">Subtotal</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {phase.labour.map((lab) => (
//                           <tr key={lab.id} className="border-t dark:border-gray-700">
//                             <td className="px-2 py-1">{lab.role}</td>
//                             <td className="px-2 py-1 text-right">{lab.days}</td>
//                             <td className="px-2 py-1 text-right">
//                               {formatCurrency(lab.ratePerDay)}
//                             </td>
//                             <td className="px-2 py-1 text-right font-medium">
//                               {formatCurrency(lab.subtotal)}
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>

//                 {/* Technicians Roles */}
//                 <div>
//                   <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
//                     Technicians & Labour Involved
//                   </h4>
//                   <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
//                     {phase.technicians.map((tech, idx) => (
//                       <li key={idx}>{tech}</li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>

//       {/* Recommendations Section */}
//       <div className="pt-6 border-t border-gray-300 dark:border-gray-700">
//         <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
//           Recommended Vendors & Technicians
//         </h3>
//         <div className="grid md:grid-cols-2 gap-4">
//           {/* Vendors */}
//           <div>
//             <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
//               Vendors
//             </h4>
//             {data.recommendations.vendors.map((vendor) => (
//               <VendorCard key={vendor.id} {...vendor} onViewProfile={() => handleViewVendor(vendor.id)} />
//             ))}
//           </div>

//           {/* Technicians */}
//           <div>
//             <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
//               Technicians
//             </h4>
//             {data.recommendations.technicians.map((technician) => (
//               <TechnicianCard key={technician.id} {...technician} onViewProfile={() => handleViewTechnician(technician.id)} />
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BreakdownComponent;

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import type { EstimationBreakdown } from "../../hooks/Estimator/useEstimationData";
import VendorCard from "../VendorCard";
import TechnicianCard from "../TechnicianCard";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  FileText,
  Layers,
  BrushCleaning,
  Hammer,
  Plus,
  SquarePlus,
  CopyPlus,
  ClipboardPlus,
} from "lucide-react";

/**
 * BreakdownRich component
 *
 * - Props: `data: EstimationBreakdown`
 * - Uses Recharts for visuals
 * - Tailwind for styling
 */

// small palette
interface BreakdownnProps {
  data: EstimationBreakdown;
  onBackToSummary?: () => void;
 
}
const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

// type BreakdownProps = { data: EstimationBreakdown };

function formatCurrency(val: number) {
  return `KSh ${val.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
}

function sumMaterials(phase: EstimationBreakdown["phases"][number]) {
  return phase.materials.reduce((s, m) => s + (m.subtotal || 0), 0);
}
function sumLabour(phase: EstimationBreakdown["phases"][number]) {
  return phase.labour.reduce((s, l) => s + (l.subtotal || 0), 0);
}

function computeTotals(data: EstimationBreakdown) {
  const totals = data.phases.reduce(
    (acc, p) => {
      const mats = sumMaterials(p);
      const labs = sumLabour(p);
      acc.materials += mats;
      acc.labour += labs;
      acc.overall += p.subtotal || mats + labs;
      acc.phases.push({ id: p.id, title: p.title, subtotal: p.subtotal || mats + labs, materials: mats, labour: labs });
      return acc;
    },
    {
      materials: 0,
      labour: 0,
      overall: 0,
      other: 0,
      phases: [] as Array<{ id: string; title: string; subtotal: number; materials: number; labour: number }>,
    }
  );
  // other = overall - (materials + labour) (should be zero if phase.subtotal is mats+lab)
  totals.other = Math.max(0, totals.overall - (totals.materials + totals.labour));
  return totals;
}

/** Generate a few AI-insight style messages from numbers (dynamic logic) */
function generateAIInsights(data: EstimationBreakdown) {
  const totals = computeTotals(data);
  const insights: string[] = [];

  // proportions
  const matPct = (totals.materials / totals.overall) * 100 || 0;
  const labPct = (totals.labour / totals.overall) * 100 || 0;

  insights.push(
    `Materials account for ${matPct.toFixed(0)}% of project cost; labour accounts for ${labPct.toFixed(0)}%.`
  );

  // highest phase
  const topPhase = totals.phases.reduce((a, b) => (b.subtotal > a.subtotal ? b : a), totals.phases[0]);
  if (topPhase) {
    const pct = ((topPhase.subtotal / totals.overall) * 100).toFixed(0);
    insights.push(`${topPhase.title} is the largest cost driver at ${pct}% (${formatCurrency(topPhase.subtotal)}).`);
  }

  // finishing suggestion
  const finishes = data.phases.find((p) => p.id === "finishes");
  if (finishes) {
    const finishingPct = ((finishes.subtotal / totals.overall) * 100) || 0;
    if (finishingPct > 0 && finishingPct > 0.25 * 100) {
      insights.push(
        `Finishes are ${finishingPct.toFixed(0)}% of your budget. Consider reviewing tile and cabinetry specs to save costs.`
      );
    } else {
      insights.push(`Finishes are within expected range.`);
    }
  }

  // contingency suggestion
  const contingency = totals.overall * 0.05;
  insights.push(`Recommended contingency (5%): ${formatCurrency(Math.round(contingency))}.`);

  return insights;
}

/** Phase-level AI insight (simple heuristics) */
function phaseInsight(phase: EstimationBreakdown["phases"][number], totalsOverall: number) {
  const mats = sumMaterials(phase);
  const labs = sumLabour(phase);
  const ratio = mats / Math.max(1, labs);
  const insights: string[] = [];
  if (mats > labs) {
    insights.push("Materials cost dominates this phase — check material specifications & quantities.");
  } else {
    insights.push("Labour cost dominates — consider efficiency or labour rate negotiation.");
  }
  // long lead items
  const longLead = phase.materials.filter((m) => /truss|timber|cabinet|window|door/i.test(m.name));
  if (longLead.length) insights.push("Some items have longer lead times — order early (e.g., trusses, cabinets).");

  // percent
  const pct = ((phase.subtotal / totalsOverall) * 100).toFixed(0);
  insights.push(`${phase.title} is ${pct}% of total cost.`);
  return insights;
}

/** Simple permit list (could be driven from backend later) */
const defaultPermits = [
  {
    id: "permit-county",
    name: "County Building Permit",
    cost: 45000,
    where: "County Lands & Physical Planning Office",
    significance: "Required to legally begin construction. Submit drawings & site plan.",
    required: true,
    durationDays: 14,
  },
  {
    id: "permit-nca",
    name: "NCA Registration (if applicable)",
    cost: 10000,
    where: "National Construction Authority portal",
    significance: "Recommend contractor registration and project compliance.",
    required: false,
    durationDays: 7,
  },
  {
    id: "permit-nema",
    name: "NEMA Clearance (if needed)",
    cost: 25000,
    where: "NEMA offices / portal",
    significance: "Environmental assessment for sensitive sites.",
    required: false,
    durationDays: 21,
  },
  {
    id: "permit-electrical",
    name: "Electrical Compliance Certificate (KENYA)",
    cost: 8000,
    where: "Kenya Power / ERB certified inspector",
    significance: "Required before energizing electrical installations.",
    required: true,
    durationDays: 3,
  },
];

export default function BreakdownRich({ data, onBackToSummary }: BreakdownnProps) {
  const [openPhase, setOpenPhase] = useState<string | null>(null);

  const totals = useMemo(() => computeTotals(data), [data]);
  const aiInsights = useMemo(() => generateAIInsights(data), [data]);

  // chart data
  const pieData = [
    { name: "Materials", value: totals.materials },
    { name: "Labour", value: totals.labour },
    { name: "Other", value: totals.other || 0 },
  ];

  const barData = totals.phases.map((p) => ({
    name: p.title.length > 12 ? p.title.slice(0, 12) + "..." : p.title,
    cost: Math.round(p.subtotal),
  }));

  const togglePhase = (id: string) => setOpenPhase((prev) => (prev === id ? null : id));

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* ===== SUMMARY TOP ===== */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="col-span-2 bg-white dark:bg-gray-900 border rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {data.projectTitle} — Project Summary
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Floor Area: {data.floorArea} m² • Quality: {data.quality}
              </p>
            </div>
            <div className="text-right">
              <div className="text-base font-medium text-gray-500 dark:text-gray-400">Total Estimated Cost</div>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(totals.overall)}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cost/m²: {formatCurrency(Math.round(totals.overall / data.floorArea))}</div>
            </div>
          </div>

          <div className="mt-4 grid md:grid-cols-3 gap-8 py-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="flex flex-row align-middle gap-2">
                <ClipboardPlus size={15}/>
                <div className="text-sm text-gray-500 dark:text-gray-400">Materials</div>
              </div>
              
              <div className="text-lg font-semibold">{formatCurrency(totals.materials)}</div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="flex flex-row align-middle gap-2">
                <Hammer size={15}/>
                <div className="text-sm text-gray-500 dark:text-gray-400">Labour</div>
              </div>
              <div className="text-lg font-semibold">{formatCurrency(totals.labour)}</div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="flex flex-row align-middle gap-2">
                <CopyPlus size={15}/>
                <div className="text-sm text-gray-500 dark:text-gray-400">Other</div>
              </div>
              <div className="text-lg font-semibold">{formatCurrency(totals.other)}</div>
            </div>
          </div>

          {/* charts row */}
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div className="w-full h-full bg-white dark:bg-gray-900 p-3 rounded border">
              <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-4">Cost Distribution</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ReTooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="w-full  bg-white dark:bg-gray-900 p-3 rounded border">
              <h4 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-4">Phase Cost Comparison</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <ReTooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="cost" fill={COLORS[0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* AI insights */}
          {/* <div className="mt-4 border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">AI Insights</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
              {aiInsights.map((ins, i) => (
                <li key={i}>{ins}</li>
              ))}
            </ul>
          </div> */}
        </div>

        {/* Right column summary + actions */}
        <div className="bg-white dark:bg-gray-900 border rounded-lg p-4 shadow-sm">
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200">Quick Totals</h4>
          <div className="mt-3 space-y-3">
            <div className="flex justify-between">
              <div className=" text-gray-600 dark:text-gray-400">Materials</div>
              <div className="font-medium">{formatCurrency(totals.materials)}</div>
            </div>
            <div className="flex justify-between">
              <div className=" text-gray-600 dark:text-gray-400">Labour</div>
              <div className="font-medium">{formatCurrency(totals.labour)}</div>
            </div>
            <div className="flex justify-between">
              <div className=" text-gray-600 dark:text-gray-400">Other</div>
              <div className="font-medium">{formatCurrency(totals.other)}</div>
            </div>
            <div className="border-t pt-3 mb-10 flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-300">Grand Total</div>
                <div className="text-lg font-bold text-blue-600">{formatCurrency(totals.overall)}</div>
              </div>
              <div>
                <button className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm">Export PDF</button>
              </div>
            </div>
            {/* AI insights */}
            <div className="mt-6 border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">AI Insights</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                {aiInsights.map((ins, i) => (
                  <li key={i}>{ins}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ===== PHASES ACCORDION ===== */}
      <div className="space-y-3">
        {data.phases.map((phase) => {
          const mats = sumMaterials(phase);
          const labs = sumLabour(phase);
          return (
            <div key={phase.id} className="bg-white dark:bg-gray-900 border rounded-lg shadow-sm overflow-hidden">
              <div
                className="flex items-center justify-between bg-background-light dark:bg-surface-dark p-4 cursor-pointer"
                onClick={() => togglePhase(phase.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                    {/* choose icon by id roughly */}
                    {phase.id.includes("foundation") ? <Layers size={18} /> : phase.id.includes("roof") ? <BrushCleaning size={18} /> : <FileText size={18} />}
                  </span>
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200">{phase.title}</div>
                    <div className="text-xs text-gray-500">{phase.technicians.join(" • ")}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* mini bar: proportion of overall */}
                  <div className="text-right mr-2">
                    <div className="text-sm font-medium text-blue-600">{formatCurrency(phase.subtotal)}</div>
                    <div className="text-xs text-gray-500">{Math.round((phase.subtotal / totals.overall) * 100)}%</div>
                  </div>
                  {openPhase === phase.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {openPhase === phase.id && (
                <div className="p-4 border-t dark:border-gray-800">
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* materials table */}
                    <div className="col-span-2">
                      <h5 className="font-medium text-gray-700 dark:text-gray-200">Materials</h5>
                      <div className="overflow-x-auto mt-2">
                        <table className="min-w-full text-sm">
                          <thead className="text-xs text-gray-500">
                            <tr>
                              <th className="text-left px-2 py-1">Item</th>
                              <th className="text-right px-2 py-1">Qty</th>
                              <th className="text-right px-2 py-1">Unit Cost</th>
                              <th className="text-right px-2 py-1">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {phase.materials.map((m) => (
                              <tr key={m.id} className="border-t">
                                <td className="px-2 py-1">{m.name}</td>
                                <td className="px-2 py-1 text-right">{m.qty} {m.unit}</td>
                                <td className="px-2 py-1 text-right">{formatCurrency(m.unitCost)}</td>
                                <td className="px-2 py-1 text-right font-medium">{formatCurrency(m.subtotal)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* labour */}
                      <h5 className="font-medium text-gray-700 dark:text-gray-200 mt-4">Labour</h5>
                      <div className="overflow-x-auto mt-2">
                        <table className="min-w-full text-sm">
                          <thead className="text-xs text-gray-500">
                            <tr>
                              <th className="text-left px-2 py-1">Role</th>
                              <th className="text-right px-2 py-1">Days</th>
                              <th className="text-right px-2 py-1">Rate/Day</th>
                              <th className="text-right px-2 py-1">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {phase.labour.map((l) => (
                              <tr key={l.id} className="border-t">
                                <td className="px-2 py-1">{l.role}</td>
                                <td className="px-2 py-1 text-right">{l.days}</td>
                                <td className="px-2 py-1 text-right">{formatCurrency(l.ratePerDay)}</td>
                                <td className="px-2 py-1 text-right font-medium">{formatCurrency(l.subtotal)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="col-span-1">
                      {/* phase pie */}
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <h6 className="text-sm font-medium text-gray-700 dark:text-gray-200">Materials vs Labour</h6>
                        <div className="h-28 mt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: "Materials", value: mats },
                                  { name: "Labour", value: labs },
                                ]}
                                dataKey="value"
                                outerRadius={50}
                                innerRadius={20}
                                paddingAngle={2}
                                label={(entry) => `${entry.name}`}
                              >
                                <Cell fill={COLORS[0]} />
                                <Cell fill={COLORS[1]} />
                              </Pie>
                              <ReTooltip formatter={(v: number) => formatCurrency(v)} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Phase total: <span className="font-medium">{formatCurrency(phase.subtotal)}</span>
                        </div>
                      </div>

                      {/* technicians */}
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <h6 className="text-sm font-medium text-gray-700 dark:text-gray-200">Technicians & Roles</h6>
                        <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
                          {phase.technicians.map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                      </div>

                      {/* phase AI insights */}
                      <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                        <h6 className="text-sm font-medium text-gray-800 dark:text-gray-200">Phase Insight</h6>
                        <ul className="mt-2 text-xs text-gray-600 dark:text-gray-300 space-y-1">
                          {phaseInsight(phase, totals.overall).map((ins, i) => (
                            <li key={i}>• {ins}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ===== PERMITS SECTION ===== */}
      <div className="bg-white dark:bg-gray-900 border rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={18} />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Permits & Legal Requirements</h3>
          </div>
          <div className="text-sm text-gray-500">Important — resolve early</div>
        </div>

        <div className="mt-4 grid md:grid-cols-4 gap-3">
          {defaultPermits.map((p) => (
            <div key={p.id} className="p-3 border rounded bg-gray-50 dark:bg-gray-800">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.where}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{formatCurrency(p.cost)}</div>
                  <div className="text-xs text-gray-500">{p.durationDays} days</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">{p.significance}</div>
              <div className="mt-3">
                <button className="text-xs px-2 py-1 bg-blue-600 text-white rounded">Get details</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== RECOMMENDATIONS ===== */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 border rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <FileText size={18} />
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">Recommended Vendors (nearby)</h4>
          </div>
          <div className="mt-3 space-y-2">
            {data.recommendations.vendors.map((v) => (
              <div key={v.id}>
                {/* vendor card — uses your existing component */}
                <VendorCard {...v} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <BrushCleaning size={18} />
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">Recommended Technicians (nearby)</h4>
          </div>
          <div className="mt-3 space-y-2">
            {data.recommendations.technicians.map((t) => (
              <div key={t.id}>
                <TechnicianCard {...t} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== FINAL AI SUMMARY ===== */}
      <div className="bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-900 border rounded-lg p-4">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Project Recommendations</h4>
        <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          <ul className="list-disc list-inside space-y-1">
            {aiInsights.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
