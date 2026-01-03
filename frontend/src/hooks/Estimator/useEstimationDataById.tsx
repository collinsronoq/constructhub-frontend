import { useEffect, useState } from "react";
import { fetchEstimationById } from "../../services/api/estimations";
import { mockEstimationData } from "./useEstimationData";
import type { EstimationBreakdown } from "./types";
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
      .then((payload) =>
        setData(
          mapEstimationDetailToBreakdown(payload as any, {
            projectName: (payload as any)?.project_title || (payload as any)?.project_name,
          })
        )
      )
      .catch((err) => {
        setData(null);
        setError(err);
      })
      .finally(() => setIsLoading(false));
  }, [id, shouldUseMock]);

  return { data, isLoading, error };
}
