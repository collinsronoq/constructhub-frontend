import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Download, Edit3 } from "lucide-react";

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
  };
  onViewBreakdown: () => void;
  onEdit?: () => void;
  onDownload?: () => void;
}

// Currency formatter
const formatCurrency = (value: number) =>
  `KSh ${value.toLocaleString("en-KE")}`;

const EstimateSummary: React.FC<EstimateSummaryProps> = ({
  data,
  onViewBreakdown,
  onEdit,
  onDownload,
}) => {
  return (
    <section className="p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm my-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Project Estimate Summary
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {data.projectName} • {data.projectType} • {data.location}
          </p>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800 transition"
        >
          <Edit3 size={16} />
          Edit Details
        </button>
      </div>

      {/* Total Cost Card */}
      <motion.div
        className="p-6 bg-blue-600 text-white rounded-xl shadow-md text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-xl font-medium mb-2">Total Estimated Cost</h3>
        <p className="text-4xl font-bold">{formatCurrency(data.totalCost)}</p>
        <p className="text-sm opacity-80 mt-1">
          Based on standard materials and regional labor rates.
        </p>
      </motion.div>

      {/* Category Breakdown */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Cost by Construction Stage
        </h4>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.categories.map((cat, index) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow transition"
            >
              <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                {cat.name}
              </h5>
              <p className="text-blue-600 dark:text-blue-400 font-semibold">
                {formatCurrency(cat.cost)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Project Insights */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Estimated Duration
          </p>
          <p className="text-gray-900 dark:text-gray-100 font-medium">
            {data.duration}
          </p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Material Source Region
          </p>
          <p className="text-gray-900 dark:text-gray-100 font-medium">
            {data.location}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6">
        <button
          onClick={onViewBreakdown}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
        >
          View Detailed Breakdown
          <ArrowRight size={18} />
        </button>
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          <Download size={18} />
          Download PDF
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
