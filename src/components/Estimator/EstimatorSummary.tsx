// import React from "react";
// import { motion } from "framer-motion";
// import { ArrowRight, Download, Edit3 } from "lucide-react";

// interface CategoryCost {
//   name: string;
//   cost: number;
// }

// interface EstimateSummaryProps {
//   data: {
//     projectName: string;
//     projectType: string;
//     location: string;
//     totalCost: number;
//     duration: string;
//     categories: CategoryCost[];
//   };
//   onViewBreakdown: () => void;
//   onEdit?: () => void;
//   onDownload?: () => void;
// }

// // Currency formatter
// const formatCurrency = (value: number) =>
//   `KSh ${value.toLocaleString("en-KE")}`;

// const EstimateSummary: React.FC<EstimateSummaryProps> = ({
//   data,
//   onViewBreakdown,
//   onEdit,
//   onDownload,
// }) => {
//   return (
//     <section className="p-4 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm my-4 space-y-6">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100">
//             Project Estimate Summary
//           </h2>
//           <p className="text-sm text-gray-500 dark:text-gray-400 my-2">
//             {data.projectName} • {data.projectType} • {data.location}
//           </p>
//         </div>
//         <button
//           onClick={onEdit}
//           className="flex  justify-center gap-2 px-3 py-2 text-sm font-medium bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800 transition"
//         >
//           <Edit3 size={16} />
//           Edit Details
//         </button>
//       </div>

//       {/* Total Cost Card */}
//       <motion.div
//         className="p-6 bg-brand-light dark:bg-brand-dark text-white rounded-xl shadow-md text-center"
//         initial={{ opacity: 0, y: 10 }}
//         animate={{ opacity: 1, y: 0 }}
//       >
//         <h3 className="text-lg md:text-xl font-medium mb-2">Total Estimated Cost</h3>
//         <p className="text-xl md:text-4xl font-bold">{formatCurrency(data.totalCost)}</p>
//         <p className="text-sm opacity-80 mt-1">
//           Based on standard materials and regional labor rates.
//         </p>
//       </motion.div>

//       {/* Category Breakdown */}
//       <div>
//         <h4 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-4">
//           Cost by Construction Stage
//         </h4>
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {data.categories.map((cat, index) => (
//             <motion.div
//               key={cat.name}
//               initial={{ opacity: 0, y: 15 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.05 }}
//               className="p-4 bg-background-light dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow transition"
//             >
//               <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
//                 {cat.name}
//               </h5>
//               <p className="text-blue-600 dark:text-blue-400 font-semibold">
//                 {formatCurrency(cat.cost)}
//               </p>
//             </motion.div>
//           ))}
//         </div>
//       </div>

//       {/* Project Insights */}
//       <div className="grid sm:grid-cols-2 gap-4">
//         <div className="p-4 bg-background-light dark:bg-background-dark border rounded-lg">
//           <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
//             Estimated Duration
//           </p>
//           <p className="text-gray-900 dark:text-gray-100 font-medium">
//             {data.duration}
//           </p>
//         </div>
//         <div className="p-4 bg-background-light dark:bg-background-dark  border rounded-lg">
//           <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
//             Material Source Region
//           </p>
//           <p className="text-gray-900 dark:text-gray-100 font-medium">
//             {data.location}
//           </p>
//         </div>
//         {/* add nore fields here */}
//       </div>

//       {/* Actions */}
//       <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6">
//         <button
//           onClick={onDownload}
//           className="flex items-center gap-2 px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
//         >
//           <Download size={18} />
//           Download PDF
//         </button>
//         <button
//           onClick={onViewBreakdown}
//           className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
//         >
//           View Detailed Breakdown
//           <ArrowRight size={18} />
//         </button>
        
//       </div>

//       {/* Disclaimer */}
//       <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
//         ⚠️ This is an estimated cost based on average market prices. Actual costs may vary depending
//         on materials, vendor rates, and construction conditions.
//       </p>
//     </section>
//   );
// };

// export default EstimateSummary;

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Download, Edit3, AlertCircle, Timer, BrickWall, Wrench, HandCoins } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';  // Add: yarn add recharts

interface CategoryCost {
  name: string;
  cost: number;
}

interface EstimateSummaryProps {
  data: {
    projectName: string;
    projectType: string;
    location: string;
    totalCost: number;
    duration: string;
    categories: CategoryCost[];
    // New: For more insights
    materialCost: number;
    laborCost: number;
    avgKenyaCost: number;  // Mock/search-based avg
    potentialSavings: number;  // Calc from optimizations
    keyChoices: string[];  // e.g., ["Premium finishing", "3-Storey"]
  };
  onViewBreakdown: () => void;
  onEdit?: () => void;
  onDownload?: () => void;
}

// Colors for pie chart
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899'];

const formatCurrency = (value: number) =>
  `KSh ${value.toLocaleString("en-KE")}`;

const EstimateSummary: React.FC<EstimateSummaryProps> = ({
  data,
  onViewBreakdown,
  onEdit,
  onDownload,
}) => {
  const total = data.totalCost;
  const chartData = data.categories.map(cat => ({ name: cat.name, value: cat.cost }));

  return (
    <section className="p-4 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm my-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Project Estimate Summary
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 my-2">
            {data.projectName} • {data.projectType} • {data.location}
          </p>
        </div>
        <button
          onClick={onEdit}
          className="flex justify-center gap-2 px-3 py-2 text-sm font-medium bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800 transition"
        >
          <Edit3 size={16} />
          Edit Details
        </button>
      </div>

      {/* Total Cost Card */}
      <motion.div
        className="p-6 bg-brand-light dark:bg-brand-dark text-white rounded-xl shadow-md text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-lg md:text-xl font-medium mb-2">Total Estimated Cost</h3>
        <p className="text-xl md:text-4xl font-bold">{formatCurrency(total)}</p>
        <p className="text-sm opacity-80 mt-1">
          Compared to Kenya average: {formatCurrency(data.avgKenyaCost)} (Yours {total > data.avgKenyaCost ? 'higher' : 'lower'} by {formatCurrency(Math.abs(total - data.avgKenyaCost))})
        </p>
      </motion.div>

      {/* Category Breakdown with Pie Chart */}
      <div>
        <h4 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-4">
          Cost by Construction Stage
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="col-span-2 md:col-span-1">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={formatCurrency} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="col-span-2 md:col-span-1 grid gap-4">
            {data.categories.map((cat, index) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-background-light dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow transition"
              >
                <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                  {cat.name}
                </h5>
                <p className="text-blue-600 dark:text-blue-400 font-semibold">
                  {formatCurrency(cat.cost)} ({((cat.cost / total) * 100).toFixed(1)}%)
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Project Insights - Expanded  //doing this at 3:00 am */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-4 bg-background-light dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex flex-nowrap gap-2">
            <Timer size={16} />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Estimated Duration
            </p>
          </div>
          
          <p className="text-gray-900 dark:text-gray-100 font-medium">
            {data.duration}
          </p>
        </div>
        <div className="p-4 bg-background-light dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex flex-nowrap gap-2 ">
            <BrickWall size={16} />
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Material
            </p>
            
          </div>
          <p className="text-gray-900 dark:text-gray-100 font-medium">
            Materials: {formatCurrency(data.materialCost)} ({((data.materialCost / total) * 100).toFixed(1)}%) 
          </p>
          
        </div>
        <div className="p-4 bg-background-light dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex flex-nowrap gap-2">
            <Wrench size={16} />
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Labor
            </p>
          </div>
          
          <p className="text-gray-900 dark:text-gray-100 font-medium">
            Labor: {formatCurrency(data.laborCost)} ({((data.laborCost / total) * 100).toFixed(1)}%)
          </p>
        </div>
        <div className="p-4 bg-background-light dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex flex-nowrap  gap-2">
            <HandCoins size={16} />
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Potential Savings
            </p>
          </div>
          <p className="text-gray-900 dark:text-gray-100 font-medium flex items-center gap-2">
            {formatCurrency(data.potentialSavings)}
            <AlertCircle size={16} className="text-yellow-500" aria-label="E.g., by choosing local vendors or economy options" />
          </p>
        </div>
        <div className="p-4 bg-background-light dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-lg col-span-2 lg:col-span-3">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Key Choices Impacting Cost
          </p>
          <ul className="text-sm text-gray-900 dark:text-gray-100 list-disc pl-4">
            {data.keyChoices.map(choice => <li key={choice}>{choice}</li>)}
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6">
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          <Download size={18} />
          Download PDF
        </button>
        <button
          onClick={onViewBreakdown}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
        >
          View Detailed Breakdown
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
        ⚠️ This is an estimated cost based on average market prices. Actual costs may vary depending
        on materials, vendor rates, and construction conditions.
      </p>
    </section>
  );
};

export default EstimateSummary;