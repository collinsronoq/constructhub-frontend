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


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { EstimationBreakdown } from "../../hooks/Estimator/useEstimationData";
import { ChevronDown, ChevronUp } from "lucide-react";
import VendorCard from "../VendorCard";
import TechnicianCard from "../TechnicianCard";


interface BreakdownProps {
  data: EstimationBreakdown;
  onBackToSummary?: () => void;
 
}

const BreakdownComponent: React.FC<BreakdownProps> = ({ data, onBackToSummary }) => {
  const [openPhase, setOpenPhase] = useState<string | null>(null);

  const togglePhase = (id: string) => {
    setOpenPhase((prev) => (prev === id ? null : id));
  };

  const formatCurrency = (val: number) =>
    `KSh ${val.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;

  

  const navigate = useNavigate();

  /** 🔎 Navigate to Vendor Profile */
  const handleViewTechnician = (technicianID: string) => {
    navigate("/technician/profile", { state: { id: technicianID } });
  };

  /** 🔎 Navigate to Technician Profile */
  const handleViewVendor = (vendorId: string) => {
    navigate("/vendor/profile", { state: { id: vendorId } });
  };
  
  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Project Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {data.projectTitle} – Detailed Breakdown
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Quality: {data.quality} • Floor Area: {data.floorArea} m²
        </p>
      </div>

      {/* Phases Section */}
      <div className="space-y-4">
        {data.phases.map((phase) => (
          <div
            key={phase.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 shadow-sm"
          >
            <div
              className="flex justify-between items-center p-4 cursor-pointer"
              onClick={() => togglePhase(phase.id)}
            >
              <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                {phase.title}
              </h3>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {formatCurrency(phase.subtotal)}
                </span>
                {openPhase === phase.id ? (
                  <ChevronUp size={18} className="text-gray-500" />
                ) : (
                  <ChevronDown size={18} className="text-gray-500" />
                )}
              </div>
            </div>

            {openPhase === phase.id && (
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
                {/* Materials */}
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Materials
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-2 py-1 text-left">Item</th>
                          <th className="px-2 py-1 text-right">Qty</th>
                          <th className="px-2 py-1 text-right">Unit Cost</th>
                          <th className="px-2 py-1 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {phase.materials.map((mat) => (
                          <tr key={mat.id} className="border-t dark:border-gray-700">
                            <td className="px-2 py-1">{mat.name}</td>
                            <td className="px-2 py-1 text-right">{mat.qty}</td>
                            <td className="px-2 py-1 text-right">
                              {formatCurrency(mat.unitCost)}
                            </td>
                            <td className="px-2 py-1 text-right font-medium">
                              {formatCurrency(mat.subtotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Labour */}
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Labour
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-2 py-1 text-left">Role</th>
                          <th className="px-2 py-1 text-right">Days</th>
                          <th className="px-2 py-1 text-right">Rate/Day</th>
                          <th className="px-2 py-1 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {phase.labour.map((lab) => (
                          <tr key={lab.id} className="border-t dark:border-gray-700">
                            <td className="px-2 py-1">{lab.role}</td>
                            <td className="px-2 py-1 text-right">{lab.days}</td>
                            <td className="px-2 py-1 text-right">
                              {formatCurrency(lab.ratePerDay)}
                            </td>
                            <td className="px-2 py-1 text-right font-medium">
                              {formatCurrency(lab.subtotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Technicians Roles */}
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Technicians & Labour Involved
                  </h4>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                    {phase.technicians.map((tech, idx) => (
                      <li key={idx}>{tech}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recommendations Section */}
      <div className="pt-6 border-t border-gray-300 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Recommended Vendors & Technicians
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Vendors */}
          <div>
            <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
              Vendors
            </h4>
            {data.recommendations.vendors.map((vendor) => (
              <VendorCard key={vendor.id} {...vendor} onViewProfile={() => handleViewVendor(vendor.id)} />
            ))}
          </div>

          {/* Technicians */}
          <div>
            <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
              Technicians
            </h4>
            {data.recommendations.technicians.map((technician) => (
              <TechnicianCard key={technician.id} {...technician} onViewProfile={() => handleViewTechnician(technician.id)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakdownComponent;
