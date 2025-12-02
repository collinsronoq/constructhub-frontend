// src/hooks/useEstimatorForm.ts
import { useState } from "react";

export interface ProjectDetails {
  projectType: string;
  numFloors: number;
  totalArea: number;
  location: string;
  complexityLevel: string;
  description?: string;
}

export interface EstimatorFormState {
  projectDetails: ProjectDetails;
  materials: any[];
  estimate: any | null;
}

export function useEstimatorForm() {
  const [formState, setFormState] = useState<EstimatorFormState>({
    projectDetails: {
      projectType: "",
      numFloors: 1,
      totalArea: 0,
      location: "",
      complexityLevel: "",
      description: "",
    },
    materials: [],
    estimate: null,
  });

  const updateProjectDetails = (data: Partial<ProjectDetails>) => {
    setFormState((prev) => ({
      ...prev,
      projectDetails: { ...prev.projectDetails, ...data },
    }));
  };

  const updateMaterials = (materials: any[]) => {
    setFormState((prev) => ({ ...prev, materials }));
  };

  const setEstimate = (estimate: any) => {
    setFormState((prev) => ({ ...prev, estimate }));
  };

  return {
    formState,
    updateProjectDetails,
    updateMaterials,
    setEstimate,
  };
}
