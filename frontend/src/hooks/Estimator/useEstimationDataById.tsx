import { useEffect, useState } from "react";
import type { EstimationBreakdown } from "./useEstimationData";
import { mockEstimationData } from "./useEstimationData";

export function useEstimationById(id?: string, useMock?: boolean) {
  const [data, setData] = useState<EstimationBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // prefer explicit param; fall back to env var VITE_USE_MOCKS
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
      // simulate network latency
      const t = setTimeout(() => {
        setData(mockEstimationData);
        setIsLoading(false);
      }, 250);
      return () => clearTimeout(t);
    }

    // real fetch path (falls back to mock on failure)
    fetch(`/api/estimations/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch estimate");
        return res.json();
      })
      .then((payload: EstimationBreakdown) => setData(payload))
      .catch((err) => {
        // fallback to mock so UI still works in dev
        setData(mockEstimationData);
        setError(err);
      })
      .finally(() => setIsLoading(false));
  }, [id, shouldUseMock]);

  return { data, isLoading, error };
}