import React, { useEffect, useState } from "react";
import { Info } from "lucide-react";

interface LabourBreakdown {
  foundation: number;
  walls: number;
  roofing: number;
  finishing: number;
  misc: number;
  total: number;
}

interface LabourCostStepProps {
  projectDetails: {
    structureType: string;
    floorArea: number;
    quality: string;
  };
  onNext: (labourData: LabourBreakdown) => void;
  onBack: () => void;
}

const LabourCostStep: React.FC<LabourCostStepProps> = ({
  projectDetails,
  onNext,
  onBack,
}) => {
  const [labourData, setLabourData] = useState<LabourBreakdown | null>(null);
  const [loading, setLoading] = useState(true);

  /** 🧠 Simulate backend-based labour estimate */
  useEffect(() => {
    setLoading(true);

    // Dummy delay to mimic API response time
    const timer = setTimeout(() => {
      const baseRate =
        projectDetails.quality === "Premium"
          ? 1200
          : projectDetails.quality === "Standard"
          ? 900
          : 700;

      const foundation = baseRate * 0.25 * projectDetails.floorArea;
      const walls = baseRate * 0.3 * projectDetails.floorArea;
      const roofing = baseRate * 0.2 * projectDetails.floorArea;
      const finishing = baseRate * 0.2 * projectDetails.floorArea;
      const misc = baseRate * 0.05 * projectDetails.floorArea;

      const total =
        foundation + walls + roofing + finishing + misc;

      setLabourData({
        foundation,
        walls,
        roofing,
        finishing,
        misc,
        total,
      });
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [projectDetails]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-600 dark:text-gray-300">
        <div className="animate-spin border-4 border-blue-400 border-t-transparent rounded-full w-10 h-10 mb-3"></div>
        Calculating labour estimates...
      </div>
    );
  }

  if (!labourData) return null;

  const formatCurrency = (val: number) =>
    `KSh ${val.toLocaleString("en-KE", {
      maximumFractionDigits: 0,
    })}`;

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100">
        Labour Cost Estimate
      </h2>
      <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
        Below is an estimated breakdown of labour costs based on your project details.
      </p>

      {/* Breakdown Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {Object.entries(labourData)
          .filter(([key]) => key !== "total")
          .map(([category, value]) => (
            <div
              key={category}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-800 dark:text-gray-200 capitalize flex items-center gap-2">
                  {category}
                  <Info
                    size={16}
                    className="text-gray-400 cursor-pointer"
                    role="img"
                    aria-label=
                    {
                      category === "foundation"
                        ? "Includes excavation, footing, and foundation setup."
                        : category === "walls"
                        ? "Covers wall construction, plastering, and reinforcement."
                        : category === "roofing"
                        ? "Covers truss setup, roofing sheets, and labour."
                        : category === "finishing"
                        ? "Covers tiling, painting, and interior finishes."
                        : "Miscellaneous includes site preparation, cleaning, etc."
                    }
                  />
                </h3>
                <p className="font-semibold text-blue-600 dark:text-blue-400">
                  {formatCurrency(value)}
                </p>
              </div>
            </div>
          ))}
      </div>

      {/* Total */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg md:text-right flex flex-nowrap">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">
          Total Labour Cost:
          <span className="ml-2 text-blue-600 dark:text-blue-400">
            {formatCurrency(labourData.total)}
          </span>
        </h3>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-xs md:text-base rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          ← Back
        </button>
        <button
          onClick={() => onNext(labourData)}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-base rounded-md transition"
        >
          Proceed →
        </button>
      </div>
    </div>
  );
};

export default LabourCostStep;


// import React, { useEffect, useState, useMemo } from "react";
// import { Info } from "lucide-react";
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';  // Add recharts: yarn add recharts

// interface LabourBreakdown {
//   foundation: { cost: number; days: number; rate: number };
//   walls: { cost: number; days: number; rate: number };
//   roofing: { cost: number; days: number; rate: number };
//   plumbing: { cost: number; days: number; rate: number };
//   electrical: { cost: number; days: number; rate: number };
//   finishing: { cost: number; days: number; rate: number };
//   misc: { cost: number; days: number; rate: number };
//   total: number;
// }

// interface LabourCostStepProps {
//   projectDetails: {
//     structureType: string;
//     floorArea: number;
//     quality: string;
//     // Add from previous steps (e.g., for ties)
//     bathrooms: number;
//     roofingStyle?: 'pitched' | 'flat';
//   };
//   onNext: (labourData: LabourBreakdown) => void;
//   onBack: () => void;
// }

// const LabourCostStep: React.FC<LabourCostStepProps> = ({
//   projectDetails,
//   onNext,
//   onBack,
// }) => {
//   const [labourData, setLabourData] = useState<LabourBreakdown | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [overrides, setOverrides] = useState<Partial<Record<keyof LabourBreakdown, { days?: number; rate?: number }>>>({});  // For user edits

//   /** Calc logic (mock backend) - Use projectDetails + overrides */
//   const calculatedData = useMemo(() => {
//     const baseRate = projectDetails.quality === "Premium" ? 1200 : projectDetails.quality === "Standard" ? 900 : 700;  // Skilled rate/day
//     const unskilledRate = baseRate * 0.6;  // 60% for helpers
//     const complexityFactor = projectDetails.structureType.includes('storey') ? 1.2 : 1.0;  // +20% for multi-storey
//     const area = projectDetails.floorArea;

//     // Base days estimates (per search: e.g., foundation 10-20 days for 500sqm bungalow)
//     const baseDays = {
//       foundation: area / 50,  // e.g., 10 days for 500sqm
//       walls: area / 40,
//       roofing: area / 60 * (projectDetails.roofingStyle === 'flat' ? 1.1 : 1.0),  // Flat slightly more
//       plumbing: projectDetails.bathrooms * 3,  // 3 days/bathroom
//       electrical: area / 80,
//       finishing: area / 50,
//       misc: area / 100,  // Cleanup/supervision
//     };

//     const breakdown: LabourBreakdown = Object.fromEntries(
//       Object.entries(baseDays).map(([key, days]) => {
//         const ov = overrides[key as keyof LabourBreakdown] || {};
//         const finalDays = ov.days ?? days;
//         const finalRate = ov.rate ?? (['foundation', 'walls', 'roofing'].includes(key) ? baseRate : unskilledRate);  // Skilled for structural
//         const cost = finalDays * finalRate * complexityFactor;
//         return [key, { cost, days: finalDays, rate: finalRate }];
//       })
//     ) as unknown as LabourBreakdown;

//     breakdown.total = Object.values(breakdown).reduce((sum, item) => sum + (typeof item === 'object' ? item.cost : 0), 0);

//     return breakdown;
//   }, [projectDetails, overrides]);

//   useEffect(() => {
//     // Simulate API delay
//     const timer = setTimeout(() => {
//       setLabourData(calculatedData);
//       setLoading(false);
//     }, 1500);
//     return () => clearTimeout(timer);
//   }, [calculatedData]);

//   // Override handler
//   const handleOverride = (category: keyof LabourBreakdown, field: 'days' | 'rate', value: number) => {
//     setOverrides(prev => ({
//       ...prev,
//       [category]: { ...prev[category], [field]: value },
//     }));
//   };

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center py-12 text-gray-600 dark:text-gray-300">
//         <div className="animate-spin border-4 border-blue-400 border-t-transparent rounded-full w-10 h-10 mb-3"></div>
//         Calculating labour estimates...
//       </div>
//     );
//   }

//   if (!labourData) return null;

//   const formatCurrency = (val: number) =>
//     `KSh ${val.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;

//   const chartData = Object.entries(labourData).filter(([key]) => key !== 'total').map(([key, value]) => ({
//     name: key.charAt(0).toUpperCase() + key.slice(1),
//     cost: value.cost,
//   }));

//   return (
//     <div className="space-y-6 p-4">
//       <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
//         Labour Cost Estimate
//       </h2>
//       <p className="text-sm text-gray-600 dark:text-gray-400">
//         Estimated breakdown based on your project. Edit days/rates if needed.
//       </p>

//       {/* Chart for Visuals */}
//       <ResponsiveContainer width="100%" height={200}>
//         <BarChart data={chartData}>
//           <XAxis dataKey="name" tick={{ fontSize: 12 }} />
//           <YAxis tickFormatter={formatCurrency} />
//           <Tooltip formatter={formatCurrency} />
//           <Bar dataKey="cost" fill="#3b82f6" />
//         </BarChart>
//       </ResponsiveContainer>

//       {/* Breakdown with Overrides */}
//       <div className="grid md:grid-cols-2 gap-4">
//         {Object.entries(labourData)
//           .filter(([key]) => key !== "total")
//           .map(([category, { cost, days, rate }]) => (
//             <div
//               key={category}
//               className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
//             >
//               <div className="flex justify-between items-center mb-2">
//                 <h3 className="font-medium text-gray-800 dark:text-gray-200 capitalize flex items-center gap-2">
//                   {category}
//                   <Info
//                     size={16}
//                     className="text-gray-400 cursor-pointer"
//                     aria-label={  // Tooltip concept: Use native title for simple hints
//                       category === "foundation"
//                         ? "Includes excavation, footing (10-20 days typical)."
//                         : category === "walls"
//                         ? "Masonry, plastering (15-25 days)."
//                         : category === "roofing"
//                         ? "Truss setup, covering (10-15 days)."
//                         : category === "plumbing"
//                         ? "Piping, fixtures (5-10 days)."
//                         : category === "electrical"
//                         ? "Wiring, installations (5-10 days)."
//                         : category === "finishing"
//                         ? "Tiling, painting (10-15 days)."
//                         : "Site prep, cleanup (5 days)."
//                     }
//                   />
//                 </h3>
//                 <p className="font-semibold text-blue-600 dark:text-blue-400">
//                   {formatCurrency(cost)}
//                 </p>
//               </div>
//               <div className="space-y-2 text-sm">
//                 <div className="flex items-center gap-2">
//                   <label>Days:</label>
//                   <input
//                     type="number"
//                     value={days}
//                     onChange={(e) => handleOverride(category as keyof LabourBreakdown, 'days', Number(e.target.value))}
//                     className="w-20 border p-1 rounded"
//                     min={1}
//                   />
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <label>Rate/Day:</label>
//                   <input
//                     type="number"
//                     value={rate}
//                     onChange={(e) => handleOverride(category as keyof LabourBreakdown, 'rate', Number(e.target.value))}
//                     className="w-24 border p-1 rounded"
//                     min={500}
//                     step={100}
//                   />
//                 </div>
//               </div>
//             </div>
//           ))}
//       </div>

//       {/* Total */}
//       <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-right">
//         <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
//           Total Labour Cost:
//           <span className="ml-2 text-blue-600 dark:text-blue-400">
//             {formatCurrency(labourData.total)}
//           </span>
//         </h3>
//       </div>

//       {/* Technician Recommendations (Mock) */}
//       <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
//         <h3 className="font-medium mb-2">Recommended Technicians</h3>
//         <ul className="text-sm space-y-1">
//           <li>Mason (NCA Certified): John Doe, KES 1,200/day - Contact: 07XX XXX XXX</li>
//           <li>Electrician (EPRA): Jane Smith, KES 1,500/day - Nearby Syokimau</li>
//           <li>More: View Directory →</li>
//         </ul>
//       </div>

//       {/* Navigation */}
//       <div className="flex justify-between pt-6">
//         <button
//           onClick={onBack}
//           className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
//         >
//           ← Back
//         </button>
//         <button
//           onClick={() => onNext(labourData)}
//           className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
//         >
//           Proceed →
//         </button>
//       </div>
//     </div>
//   );
// };

// export default LabourCostStep;
