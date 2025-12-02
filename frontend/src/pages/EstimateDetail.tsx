import { useParams, useNavigate } from "react-router-dom";
import BreakdownRich from "../components/Estimator/EstimatorBreakdown";
import { useEstimationById } from "../hooks/Estimator/useEstimationDataById";

export default function EstimateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // replace with your actual data loader/hook
  const { data, isLoading: loading, error } = useEstimationById(id, true)

  if (loading) return <div className="p-6">Loading…</div>;
  if (error || !data) return <div className="p-6">Estimate not found</div>;

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="mb-2 text-sm text-white p-2 rounded-lg bg-blue-600">← Back</button>
      <BreakdownRich data={data} onBackToSummary={() => navigate(-1)} />
    </div>
  );
}