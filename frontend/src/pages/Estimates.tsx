// import EstimatorWizard from "../components/Estimator/EstimatorWizard"

// const Estimates = () =>{
//   return (
//     <EstimatorWizard />
//   )
// }

// export default Estimates


import Estimations from "../components/Estimates/Estimates";
import { useEstimations } from "../hooks/Estimator/useEstimations";
import { useOutletContext } from "react-router-dom";
import type { DashboardOutletContext } from "../layouts/DashboardLayout";

const Estimates = () => {
  const { estimates, loading, error } = useEstimations();
  const { onAskEstimateSummary } = useOutletContext<DashboardOutletContext>();

  const mapped = estimates.map((e) => ({
    id: String(e.id),
    projectName: e.project_title || e.project_name || "Project",
    category: "Residential",
    estimatedCost: `KSh ${Number(e.total_cost || 0).toLocaleString()}`,
    dateCreated: e.created_at ? new Date(e.created_at).toLocaleDateString() : "",
    location: e.location || "N/A",
  }));

  return (
      <div className="p-4">
      {loading && <div className="text-gray-500 text-sm mb-2">Loading estimates...</div>}
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      <Estimations estimates={mapped} onAskEstimateSummary={onAskEstimateSummary} />
    </div>
  );
};

export default Estimates;
