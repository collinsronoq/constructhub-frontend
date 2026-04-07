import React from "react";
import EstimateCard from "../Estimates/EstimateCard";
import type { EstimateCardProps } from "../Estimates/EstimateCard";
import { useNavigate } from "react-router-dom";

interface EstimationSummaryProps {
  estimates: EstimateCardProps[];
  onViewAll?: () => void;
  onAskEstimateSummary?: (estimate: { id: string; projectName: string; location: string }) => void;
  loading?: boolean;
  error?: string | null;
}

const RecentEstimations: React.FC<EstimationSummaryProps> = ({
  estimates,
  onViewAll,
  onAskEstimateSummary,
  loading,
  error,
}) => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
      return;
    }
    navigate("/estimates");
  };

  return (
    <section className="p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Estimations</h2>
        <button onClick={handleViewAll} className="text-sm text-blue-600 hover:underline">
          View all
        </button>
      </div>

      {loading && <div className="text-gray-500 text-sm mb-2">Loading...</div>}
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pb-8">
        {estimates.length > 0 ? (
          estimates.map((estimate) => (
            <EstimateCard key={estimate.id} {...estimate} onAskAiSummary={onAskEstimateSummary} />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 dark:text-gray-400">
            No estimates yet. Start your first estimation!
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentEstimations;
