import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProjectDetailsResidentialStep from "./EstimatorForms/EstimatorProjectDetails";
import MaterialSelectionStep1 from "./EstimatorForms/EstimatorMaterialSelection";
import type { MaterialSelectionProps } from "./EstimatorForms/EstimatorMaterialSelection";
import EstimatorReviewStep from "./EstimatorReviewStep";
import EstimateSummary from "./EstimatorSummary";
import EstimatorBreakdown from "./EstimatorBreakdown";
import { useEstimationWizard } from "../../hooks/useEstimationWizard";
import { mapEstimationDetailToBreakdown } from "../../hooks/Estimator/estimationMapper";
import type { EstimationRequest } from "../../services/api/estimationTypes";

export type WizardStep =
  | "projectDetails"
  | "materialSelection1"
  | "labourEstimate"
  | "summary"
  | "breakdown";

interface ProjectDetailsData {
  projectName?: string;
  location?: { county?: string; area?: string; coordinates?: string };
  land?: { size?: number; soilType?: "clay" | "sandy" | "rocky" | "murram" };
  structure?: {
    type?: "bungalow" | "1.5-storey" | "2-storey" | "3-storey";
    bedrooms?: number;
    bathrooms?: number;
    rooms?: string[];
    floorArea?: number;
    storeys?: number;
  };
  roofStyle?: "pitched" | "flat";
  finishing?: string;
  perimeterWall?: { include?: boolean; lengthM?: number; includeGate?: boolean };
}

const steps: { id: WizardStep; label: string }[] = [
  { id: "projectDetails", label: "Project Details" },
  { id: "materialSelection1", label: "Materials" },
  { id: "labourEstimate", label: "Labour" },
  { id: "summary", label: "Summary" },
  { id: "breakdown", label: "Breakdown" },
];

const EstimatorWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<WizardStep>("projectDetails");
  const [projectDetails, setProjectDetails] = useState<ProjectDetailsData>({});
  const [selectedMaterials1, setSelectedMaterials1] = useState<MaterialSelectionProps["initialData"]>();
  const { request, updateSection, submit, submitting, result, error } = useEstimationWizard();
  const [localResult, setLocalResult] = useState(result);
  const uiBreakdown = useMemo(
    () =>
      localResult
        ? mapEstimationDetailToBreakdown(localResult, {
            request,
            projectName: projectDetails.projectName,
            landSize: projectDetails.land?.size,
            finishing: projectDetails.finishing,
          })
        : null,
    [localResult, request, projectDetails]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const goToNextStep = () => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    if (currentIndex < steps.length - 1) setCurrentStep(steps[currentIndex + 1].id);
  };

  const goToPreviousStep = () => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    if (currentIndex > 0) setCurrentStep(steps[currentIndex - 1].id);
  };

  const handleGenerateEstimate = async () => {
    try {
      const res = await submit();
      setLocalResult(res);
      setCurrentStep("summary");
    } catch (e) {
      // error handled via hook state
    }
  };

  const stepContent = useMemo(() => {
    const mapStructureType = (t?: string): EstimationRequest["superstructure"]["structure_type"] => {
      switch (t) {
        case "2-storey":
          return "two_storey";
        case "3-storey":
          return "three_storey";
        default:
          return "bungalow";
      }
    };

    const mapRoofCover = (pref?: string) => {
      if (pref === "stone-coated") return "stone_coated_tiles";
      if (pref === "clay tiles") return "clay_tiles";
      return "corrugated_mabati";
    };

    const mapWalling = (material?: string) => {
      if (material === "bricks") return "burnt_bricks";
      if (material === "concrete blocks" || material === "machine-cut stones") return "concrete_blocks";
      return request.superstructure.blockwork_type;
    };

    switch (currentStep) {
      case "projectDetails":
        return (
          <ProjectDetailsResidentialStep
            initialData={projectDetails}
            onNext={(data) => {
              setProjectDetails(data);
              // map to backend payload
              updateSection("project_name", data.projectName || "Project");
              updateSection("site_survey", {
                ...request.site_survey,
                plot_size_sqm: Number(data.land?.size || request.site_survey.plot_size_sqm || 1),
                location: data.location?.area || data.location?.county || request.site_survey.location,
              });
              updateSection("site_preparation", {
                ...request.site_preparation,
                plot_size_sqm: Number(data.land?.size || request.site_preparation.plot_size_sqm || 1),
              });
              updateSection("foundation", {
                ...request.foundation,
                soil_type: data.land?.soilType || request.foundation.soil_type || "murram",
                foundation_type: request.foundation.foundation_type || "strip",
                footprint_sqm: Number(data.land?.size || request.foundation.footprint_sqm || 1),
              });
              updateSection("superstructure", {
                ...request.superstructure,
                land_size_sqm: Number(data.land?.size || request.superstructure.land_size_sqm || 1),
                structure_type: mapStructureType(data.structure?.type),
                bedrooms: data.structure?.bedrooms || request.superstructure.bedrooms || 1,
                bathrooms: data.structure?.bathrooms || request.superstructure.bathrooms || 1,
                finishing_level:
                  data.finishing === "premium" ? "luxury" : data.finishing === "economy" ? "standard" : (data.finishing as any) || request.superstructure.finishing_level || "standard",
                declared_floor_area_sqm: data.structure?.floorArea || request.superstructure.declared_floor_area_sqm,
              });
              updateSection("roofing", {
                ...request.roofing,
                building_footprint_sqm: Number(data.land?.size || request.roofing.building_footprint_sqm || 1),
                roof_type: data.roofStyle === "flat" ? "flat" : request.roofing.roof_type,
                storeys: data.structure?.storeys || (data.structure?.type === "3-storey" ? 3 : data.structure?.type === "2-storey" ? 2 : 1),
              });
              updateSection("finishes", {
                ...request.finishes,
                total_floor_area_sqm: data.structure?.floorArea || Number(data.land?.size || request.finishes.total_floor_area_sqm || 0),
                finishing_level:
                  data.finishing === "premium" ? "luxury" : data.finishing === "economy" ? "standard" : (data.finishing as any) || request.finishes.finishing_level || "standard",
              });
              updateSection("external_works", {
                ...request.external_works,
                perimeter_wall_length_m: data.perimeterWall?.include ? data.perimeterWall.lengthM || 0 : request.external_works.perimeter_wall_length_m,
                include_gate: data.perimeterWall?.include ? data.perimeterWall.includeGate || false : request.external_works.include_gate,
              });
              goToNextStep();
            }}
          />
        );
      case "materialSelection1":
        return (
          <MaterialSelectionStep1
            initialData={{
              ...selectedMaterials1,
              soilType: projectDetails.land?.soilType,
              bathrooms: projectDetails.structure?.bathrooms || 2,
            }}
            onNext={(data) => {
              setSelectedMaterials1(data);
              if (data.foundation?.type) {
                updateSection("foundation", { ...request.foundation, foundation_type: data.foundation.type });
              }
              if (data.walling?.material) {
                updateSection("superstructure", { ...request.superstructure, blockwork_type: mapWalling(data.walling.material) });
              }
              if (data.roofing?.roofingPreference) {
                updateSection("roofing", { ...request.roofing, roof_covering: mapRoofCover(data.roofing.roofingPreference) });
              }
              if (data.finishing) {
                const level = data.finishing === "premium" ? "luxury" : data.finishing === "basic" ? "standard" : data.finishing;
                updateSection("finishes", { ...request.finishes, finishing_level: level as any });
                updateSection("superstructure", { ...request.superstructure, finishing_level: level as any });
              }
              // Basic services defaults based on rooms/baths
              const sockets = Math.max(8, (projectDetails.structure?.bedrooms || 1) * 4);
              const lighting = Math.max(8, (projectDetails.structure?.rooms?.length || 4) * 2);
              const plumbing = Math.max(4, (projectDetails.structure?.bathrooms || 1) * 2);
              const floorArea =
                Number(
                  projectDetails.structure?.floorArea ||
                    projectDetails.land?.size ||
                    request.services_first_fix.floor_area_sqm ||
                    0
                ) || 0;
              updateSection("services_first_fix", {
                ...request.services_first_fix,
                floor_area_sqm: floorArea,
                socket_points: sockets,
                lighting_points: lighting,
                plumbing_points: plumbing,
              });
              updateSection("services_second_fix", {
                ...request.services_second_fix,
                floor_area_sqm: floorArea,
                switches: sockets,
                sockets,
                light_fittings: lighting,
                sanitary_fixtures: projectDetails.structure?.bathrooms || 1,
              });
              goToNextStep();
            }}
            onBack={goToPreviousStep}
          />
        );
      case "labourEstimate":
        return (
          <EstimatorReviewStep
            projectDetails={{
              structureType: projectDetails.structure?.type || "Bungalow",
              floorArea: Number(projectDetails.land?.size || 100),
              quality: projectDetails.finishing || "Standard",
              roofStyle: projectDetails.roofStyle,
              location: request.site_survey.location,
            }}
            onBack={goToPreviousStep}
            onNext={() => {
              handleGenerateEstimate();
            }}
          />
        );
      case "summary":
        return (
          uiBreakdown && (
            <EstimateSummary
              data={{
                projectName: uiBreakdown.projectTitle,
                projectType: projectDetails.structure?.type || "Residential",
                location: request.site_survey.location || "N/A",
                totalCost: uiBreakdown.totalCost,
                duration: "",
                categories: uiBreakdown.phases.map((p) => ({
                  name: p.title,
                  cost: p.subtotal,
                })),
                materialCost: uiBreakdown.phases.reduce(
                  (sum, p) => sum + p.materials.reduce((mSum, m) => mSum + m.subtotal, 0),
                  0
                ),
                laborCost: uiBreakdown.phases.reduce(
                  (sum, p) => sum + p.labour.reduce((lSum, l) => lSum + l.subtotal, 0),
                  0
                ),
                avgKenyaCost: 0,
                potentialSavings: 0,
                keyChoices: [],
              }}
              onViewBreakdown={() => setCurrentStep("breakdown")}
              onEdit={() => setCurrentStep("projectDetails")}
              onDownload={() => alert("PDF export coming soon")}
            />
          )
        );
      case "breakdown":
        return (
          uiBreakdown && <EstimatorBreakdown data={uiBreakdown} onBackToSummary={() => setCurrentStep("summary")} />
        );
      default:
        return null;
    }
  }, [currentStep, projectDetails, selectedMaterials1, request, localResult, uiBreakdown]);

  return (
    <div className="mx-auto mb-8 mt-4 p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-md space-y-6">
      <div className="relative flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = steps.findIndex((s) => s.id === currentStep) > index;
          return (
            <div key={step.id} className="flex flex-col items-center relative w-full">
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-3 left-1/2 w-full h-1 ${
                    isCompleted ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"
                  }`}
                  style={{ zIndex: 0 }}
                />
              )}
              <div
                className={`z-10 flex items-center justify-center md:w-6 md:h-6 w-4 h-4 rounded-full text-xs md:text-base border-2 ${
                  isActive
                    ? "border-blue-600 bg-blue-600 text-white"
                    : isCompleted
                    ? "border-blue-600 bg-blue-500 text-white"
                    : "border-gray-300 dark:border-gray-600 text-gray-400"
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  isActive ? "text-blue-600" : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {submitting && <p className="text-blue-600 text-sm">Generating estimate...</p>}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
        >
          {stepContent}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default EstimatorWizard;
