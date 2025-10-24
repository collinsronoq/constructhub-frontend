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
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        Labour Cost Estimate
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
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
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-right">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
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
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          ← Back
        </button>
        <button
          onClick={() => onNext(labourData)}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
        >
          Proceed →
        </button>
      </div>
    </div>
  );
};

export default LabourCostStep;
