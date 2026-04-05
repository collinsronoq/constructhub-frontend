import { useEffect, useState } from "react";
import type { EstimationBreakdown } from "./types";

/**
 * Legacy mock loader for the estimator module. Uses the canonical EstimationBreakdown type.
 */
export const mockEstimationData: EstimationBreakdown = {
  projectTitle: "3-Bedroom Bungalow",
  floorArea: 130,
  quality: "Standard",
  bedrooms: 3,
  bathrooms: 2,
  structureType: "bungalow",
  storeys: 1,
  totalCost: 4950000,
  materialCost: 2800000,
  labourCost: 1500000,
  equipmentCost: 350000,
  otherCost: 300000,
  phasesCount: 0,
  phases: [],
  recommendations: { vendors: [], technicians: [] },
  other: 0,
  permits: [],
};

export function useEstimationData() {
  const [data, setData] = useState<EstimationBreakdown | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setData(mockEstimationData), 1500);
    return () => clearTimeout(timer);
  }, []);

  return { data, isLoading: !data, error: null };
}
