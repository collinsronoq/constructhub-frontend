import { useEffect, useState } from "react";
import { fetchEstimations } from "../../services/api/estimations";
import type { EstimationListItem } from "../../services/api/estimationTypes";

export function useEstimations(useMock?: boolean) {
  const [data, setData] = useState<EstimationListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shouldUseMock = useMock ?? import.meta.env.VITE_USE_MOCKS === "true";

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      if (shouldUseMock) {
        setData([]);
      } else {
        const res = await fetchEstimations();
        setData(res);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load estimates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [shouldUseMock]);

  return { estimates: data, loading, error, refetch: load };
}
