import { useEffect, useState } from "react";
import { apiFetch } from "../services/api/client";
import type { VendorCardProps } from "../components/VendorCard";
import type { TechnicianCardProps } from "../components/TechnicianCard";

interface RecommendationsResponse {
  vendors: VendorCardProps[];
  technicians: TechnicianCardProps[];
}

export function useRecommendations(useMock?: boolean) {
  const [data, setData] = useState<RecommendationsResponse>({ vendors: [], technicians: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shouldUseMock = useMock ?? import.meta.env.VITE_USE_MOCKS === "true";

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      if (shouldUseMock) {
        setData({ vendors: [], technicians: [] });
      } else {
        const res = await apiFetch<RecommendationsResponse>("/recommendations", { method: "GET" });
        setData(res);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [shouldUseMock]);

  return { ...data, loading, error, refetch: load };
}
