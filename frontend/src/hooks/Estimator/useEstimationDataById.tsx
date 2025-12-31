import { useEffect, useState } from "react";
import { fetchEstimationById } from "../../services/api/estimations";
import { mockEstimationData, type EstimationBreakdown } from "./useEstimationData";
import { mapEstimationDetailToBreakdown } from "./estimationMapper";

export function useEstimationById(id?: string, useMock?: boolean) {
  const [data, setData] = useState<EstimationBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const shouldUseMock = useMock ?? (import.meta.env.VITE_USE_MOCKS === "true");

  useEffect(() => {
    if (!id) {
      setData(null);
      setIsLoading(false);
      setError(new Error("Missing id"));
      return;
    }

    setIsLoading(true);
    setError(null);

    if (shouldUseMock) {
      const t = setTimeout(() => {
        setData(mockEstimationData);
        setIsLoading(false);
      }, 250);
      return () => clearTimeout(t);
    }

    fetchEstimationById(id)
      .then((payload) => setData(mapEstimationDetailToBreakdown(payload)))
      .catch((err) => {
        setData(mockEstimationData);
        setError(err);
      })
      .finally(() => setIsLoading(false));
  }, [id, shouldUseMock]);

  return { data, isLoading, error };
}
