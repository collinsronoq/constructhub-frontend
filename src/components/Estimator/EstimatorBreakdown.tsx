import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

interface BreakdownItem {
  material: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  vendor?: string;
}

interface BreakdownCategory {
  name: string;
  materials: BreakdownItem[];
  laborCost: number;
  subtotal: number;
}

interface EstimateBreakdownProps {
  breakdown: BreakdownCategory[];
  total: number;
  onBackToSummary: () => void;
}

const EstimateBreakdown: React.FC<EstimateBreakdownProps> = ({
  breakdown,
  total,
  onBackToSummary,
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (name: string) => {
    setExpandedCategory((prev) => (prev === name ? null : name));
  };

  const formatCurrency = (val: number) => `KSh ${val.toLocaleString()}`;

  return (
    <section className="p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Detailed Estimate Breakdown
        </h2>
        <button
          onClick={onBackToSummary}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          ← Back to Summary
        </button>
      </div>

      {/* Breakdown Categories */}
      {breakdown.map((category) => {
        const percentage = ((category.subtotal / total) * 100).toFixed(1);

        return (
          <div
            key={category.name}
            className="border rounded-lg border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Header */}
            <button
              onClick={() => toggleCategory(category.name)}
              className="w-full flex justify-between items-center bg-gray-100 dark:bg-gray-800 px-4 py-3 text-left"
            >
              <div className="flex flex-col">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {category.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {percentage}% of total cost
                </span>
              </div>
              {expandedCategory === category.name ? (
                <ChevronUp className="text-gray-500" />
              ) : (
                <ChevronDown className="text-gray-500" />
              )}
            </button>

            {/* Expanded Content */}
            <AnimatePresence>
              {expandedCategory === category.name && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 bg-white dark:bg-gray-900"
                >
                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-sm">
                      <thead>
                        <tr className="text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                          <th className="p-2 text-left">Material</th>
                          <th className="p-2 text-left">Quantity</th>
                          <th className="p-2 text-left">Unit</th>
                          <th className="p-2 text-left">Unit Cost</th>
                          <th className="p-2 text-left">Total Cost</th>
                          <th className="p-2 text-left">Vendor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.materials.map((item, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-100 dark:border-gray-800"
                          >
                            <td className="p-2 text-gray-800 dark:text-gray-200">
                              {item.material}
                            </td>
                            <td className="p-2">{item.quantity}</td>
                            <td className="p-2">{item.unit}</td>
                            <td className="p-2">{formatCurrency(item.unitCost)}</td>
                            <td className="p-2 font-medium text-blue-600 dark:text-blue-400">
                              {formatCurrency(item.totalCost)}
                            </td>
                            <td className="p-2 text-gray-600 dark:text-gray-400">
                              {item.vendor || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Subtotals */}
                  <div className="flex justify-between mt-4 text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      Labor Cost:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(category.laborCost)}
                    </span>
                  </div>

                  <div className="flex justify-between mt-1 text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      Subtotal (Materials + Labor):
                    </span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrency(category.subtotal)}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Total Summary */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 text-right">
        <p className="text-gray-700 dark:text-gray-200 text-lg font-semibold">
          Total Project Estimate:{" "}
          <span className="text-blue-700 dark:text-blue-300">
            {formatCurrency(total)}
          </span>
        </p>
      </div>
    </section>
  );
};

export default EstimateBreakdown;
