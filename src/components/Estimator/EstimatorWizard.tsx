// import React, { useState } from "react";
// import ProjectDetailsResidentialStep from "./EstimatorForms/EstimatorProjectDetails";
// // import MaterialSelectionStep from "../components/Estimator/MaterialSelectionStep";
// // import EstimateSummaryStep from "../components/Estimator/EstimateSummaryStep";

// export type EstimatorData = {
//   projectType?: "Residential" | "Commercial";
//   projectName?: string;
//   location?: { county: string; area: string; coordinates?: string };
//   land?: { size: string; soilType: string };
//   structure?: {
//     type: string;
//     bedrooms: number;
//     bathrooms: number;
//     optionalRooms: string[];
//   };
//   foundation?: string;
//   roofing?: string;
//   finishing?: string;
//   perimeterWall?: boolean;
//   // We’ll add these later:
//   // materials?: Material[];
//   // estimate?: EstimateSummary;
// };

// const EstimatorWizard: React.FC = () => {
//   const [step, setStep] = useState(1);
//   const [data, setData] = useState<EstimatorData>({
//     projectType: "Residential",
//   });

//   /** Updates state when a child step changes */
//   const handleUpdate = (updates: Partial<EstimatorData>) => {
//     setData((prev) => ({ ...prev, ...updates }));
//   };

//   /** Navigation handlers */
//   const handleNext = () => setStep((prev) => prev + 1);
//   const handleBack = () => setStep((prev) => Math.max(1, prev - 1));

//   /** Simulated submission for final step */
//   const handleSubmit = () => {
//     console.log("Final project data:", data);
//     alert("Estimate generated successfully (simulated)!");
//   };

//   /** Step indicator titles */
//   const steps = [
//     { id: 1, title: "Project Details" },
//     { id: 2, title: "Material Selection" },
//     { id: 3, title: "Estimate Summary" },
//   ];

//   return (
//     <div className="max-w-5xl mx-auto p-6 space-y-6">
//       {/* Stepper Header */}
//       <div className="flex items-center justify-between mb-4">
//         {steps.map((s) => (
//           <div key={s.id} className="flex-1 flex items-center">
//             <div
//               className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
//                 step === s.id
//                   ? "bg-blue-600 text-white"
//                   : step > s.id
//                   ? "bg-green-500 text-white"
//                   : "bg-gray-300 text-gray-800"
//               }`}
//             >
//               {s.id}
//             </div>
//             <span
//               className={`ml-2 text-sm ${
//                 step === s.id ? "text-blue-600 font-semibold" : "text-gray-500"
//               }`}
//             >
//               {s.title}
//             </span>
//             {s.id < steps.length && (
//               <div className="flex-1 h-[1px] bg-gray-300 mx-3 dark:bg-gray-700" />
//             )}
//           </div>
//         ))}
//       </div>

//       {/* Step Content */}
//       {step === 1 && (
//         <ProjectDetailsResidentialStep
//           data={data}
//           onUpdate={handleUpdate}
//           onNext={handleNext}
//         />
//       )}

//       {step === 2 && (
//         <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
//           <h2 className="text-lg font-semibold mb-4">
//             Material Selection (Coming Soon)
//           </h2>
//           <p className="text-gray-600 dark:text-gray-400 text-sm">
//             This section will allow users to pick materials based on project type.
//           </p>
//           <div className="flex justify-between mt-6">
//             <button
//               onClick={handleBack}
//               className="px-6 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600"
//             >
//               ← Back
//             </button>
//             <button
//               onClick={handleNext}
//               className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               Next →
//             </button>
//           </div>
//         </div>
//       )}

//       {step === 3 && (
//         <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
//           <h2 className="text-lg font-semibold mb-4">Estimate Summary</h2>
//           <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
//             {JSON.stringify(data, null, 2)}
//           </pre>
//           <div className="flex justify-between mt-6">
//             <button
//               onClick={handleBack}
//               className="px-6 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600"
//             >
//               ← Back
//             </button>
//             <button
//               onClick={handleSubmit}
//               className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//             >
//               Generate Estimate
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EstimatorWizard;

// import React, { useState } from "react";
// import ProjectDetailsResidentialStep from "./EstimatorForms/EstimatorProjectDetails";
// import MaterialSelectionStep from "./EstimatorMaterialList";
// import LabourEstimateStep from "./EstimatorLaborList";
// import EstimateSummary from "./EstimatorSummary";
// import EstimateBreakdown from "./EstimatorBreakdown";

// export type WizardStep =
//   | "projectDetails"
//   | "materialSelection"
//   | "labourEstimate"
//   | "summary"
//   | "breakdown";

// const EstimatorWizard: React.FC = () => {
//   /** 🧠 Step Management */
//   const [currentStep, setCurrentStep] = useState<WizardStep>("projectDetails");

//   /** 📦 Data States */
//   const [projectDetails, setProjectDetails] = useState<any>({});
//   const [selectedMaterials, setSelectedMaterials] = useState<any[]>([]);
//   const [labourData, setLabourData] = useState<any>({});
//   const [estimateData, setEstimateData] = useState<any>(null);

//   /** 🚀 Handlers for navigation */
//   const goToNextStep = () => {
//     setCurrentStep((prev) => {
//       if (prev === "projectDetails") return "materialSelection";
//       if (prev === "materialSelection") return "labourEstimate";
//       if (prev === "labourEstimate") return "summary";
//       return prev;
//     });
//   };

//   const goToPreviousStep = () => {
//     setCurrentStep((prev) => {
//       if (prev === "materialSelection") return "projectDetails";
//       if (prev === "labourEstimate") return "materialSelection";
//       if (prev === "summary") return "labourEstimate";
//       if (prev === "breakdown") return "summary";
//       return prev;
//     });
//   };

//   const handleGenerateEstimate = () => {
//     // Simulate API or calculation logic
//     const dummyEstimate = {
//       total: 193000,
//       breakdown: [
//         {
//           name: "Foundation",
//           materials: [
//             { material: "Cement", quantity: 50, unit: "bags", unitCost: 700, totalCost: 35000, vendor: "ABC Hardware" },
//             { material: "Sand", quantity: 10, unit: "tons", unitCost: 1800, totalCost: 18000, vendor: "Njoro Quarry" },
//           ],
//           laborCost: 45000,
//           subtotal: 98000,
//         },
//         {
//           name: "Roofing",
//           materials: [
//             { material: "Roof Sheets", quantity: 30, unit: "pcs", unitCost: 1500, totalCost: 45000, vendor: "BuildMart" },
//             { material: "Timber", quantity: 50, unit: "pcs", unitCost: 400, totalCost: 20000, vendor: "Timba Ltd" },
//           ],
//           laborCost: 30000,
//           subtotal: 95000,
//         },
//       ],
//     };
//     setEstimateData(dummyEstimate);
//     setCurrentStep("summary");
//   };

//   return (
//     <div className="max-w-5xl mx-auto my-8 p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm space-y-6">
//       {currentStep === "projectDetails" && (
//         <ProjectDetailsResidentialStep
//           initialData={projectDetails}
//           onNext={(data) => {
//             setProjectDetails(data);
//             goToNextStep();
//           }}
//         />
//       )}

//       {currentStep === "materialSelection" && (
//         <MaterialSelectionStep
//           onMaterialsSelected={(selected) => {
//             setSelectedMaterials(selected);
//             goToNextStep();
//           }}
//         />
//       )}

//       {currentStep === "labourEstimate" && (
//         <LabourEstimateStep
//           projectDetails={{
//             structureType: projectDetails.structure?.type || "Bungalow",
//             floorArea: Number(projectDetails.land?.size || 100),
//             quality: projectDetails.finishing || "Standard",
//           }}
//           onBack={goToPreviousStep}
//           onNext={(labourData) => {
//             setLabourData(labourData);
//             goToNextStep();
//           }}
//         />
//       )}


//       {currentStep === "summary" && estimateData && (
//         <EstimateSummary
//           data={{
//             projectName: projectDetails.projectName || "Unnamed Project",
//             projectType: projectDetails.structure?.type || "Residential",
//             location: `${projectDetails.location?.county || "N/A"}${
//               projectDetails.location?.area ? ` - ${projectDetails.location.area}` : ""
//             }`,
//             totalCost: estimateData.total || 0,
//             duration:
//               estimateData.total > 1000000
//                 ? "6–8 months"
//                 : estimateData.total > 500000
//                 ? "4–6 months"
//                 : "2–4 months",
//             categories: estimateData.breakdown.map((b: any) => ({
//               name: b.name,
//               cost: b.subtotal,
//             })),
//           }}
//           onViewBreakdown={() => setCurrentStep("breakdown")}
//           onEdit={() => setCurrentStep("projectDetails")}
//           onDownload={() => alert("PDF download will be available soon")}
//         />
//       )}


//       {currentStep === "breakdown" && estimateData && (
//         <EstimateBreakdown
//           breakdown={estimateData.breakdown}
//           total={estimateData.total}
//           onBackToSummary={() => setCurrentStep("summary")}
//         />
//       )}

      
//     </div>
//   );
// };

// export default EstimatorWizard;

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProjectDetailsResidentialStep from "./EstimatorForms/EstimatorProjectDetails";
import MaterialSelectionStep1 from "./EstimatorForms/EstimatorMaterialSelection";
import type { MaterialSelectionProps } from "./EstimatorForms/EstimatorMaterialSelection"
// import MaterialSelectionStep from "./EstimatorMaterialList";
import LabourCostStep from "./EstimatorLaborList";
import EstimateSummary from "./EstimatorSummary";
import EstimatorBreakdown from "./EstimatorBreakdown";
import { useEstimationData } from "../../hooks/Estimator/useEstimationData";

export type WizardStep =
  | "projectDetails"
  | "materialSelection1"
  // | "materialSelection"
  | "labourEstimate"
  | "summary"
  | "breakdown";



interface ProjectDetailsData {
  projectName?: string;
  location?: { county?: string; area?: string; coordinates?: string };
  land?: { size?: number; soilType?: 'clay' | 'sandy' | 'rocky' | 'murram'};
  
  structure?: {
    type?: 'bungalow' | '1.5-storey' | '2-storey' | '3-storey';
    bedrooms?: number;
    bathrooms?: number;
    rooms?: string[];  // e.g., ['kitchen', 'pantry']
  };
  sewage?: {
    type?: 'sewer' | 'septic';
    septicSize?: number;  // Optional
  };
  waterSupply?: 'municipal' | 'borehole' | 'rainwater';  // New
  
  security?: { wallHeight?: number; includeGate?: boolean; wallSecurity?: 'wiremesh' | 'electric-wire' };  // Extend existing
  

  foundation?: string;
  roofing?: string;
  roofStyle?: 'pitched' | 'flat';
  finishing?: string;
  perimeterWall?: { include?: boolean; height?: number; wallSecurity?: 'barbed-wire' | 'electric-wire' | 'hybrid' };
  // perimeterWall?: boolean;
}

const steps: { id: WizardStep; label: string }[] = [
  { id: "projectDetails", label: "Project Details" },
  { id: "materialSelection1", label: "Materials1" },
  // { id: "materialSelection", label: "Materials" },
  { id: "labourEstimate", label: "Labour" },
  { id: "summary", label: "Summary" },
  { id: "breakdown", label: "Breakdown" },
];

const EstimatorWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<WizardStep>("projectDetails");

  // 📦 State storage for all sections
  const [projectDetails, setProjectDetails] = useState<ProjectDetailsData>({});
  // const [selectedMaterials, setSelectedMaterials] = useState<any[]>([]);
  const [selectedMaterials1, setSelectedMaterials1] = useState<MaterialSelectionProps['initialData']>();
  const [labourData, setLabourData] = useState<any>({});
  const [estimateData, setEstimateData] = useState<any>(null);
  const { data, isLoading } = useEstimationData();

  /** Scroll to top whenever step changes */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  /** Navigation handlers */
  const goToNextStep = () => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    if (currentIndex < steps.length - 1) setCurrentStep(steps[currentIndex + 1].id);
  };

  const goToPreviousStep = () => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    if (currentIndex > 0) setCurrentStep(steps[currentIndex - 1].id);
  };

  /** Dummy backend calculation for MVP */
  const handleGenerateEstimate = () => {
    const dummyEstimate = {
      total: 193000,
      breakdown: [
        {
          name: "Foundation",
          materials: [
            { material: "Cement", quantity: 50, unit: "bags", unitCost: 700, totalCost: 35000, vendor: "ABC Hardware" },
            { material: "Sand", quantity: 10, unit: "tons", unitCost: 1800, totalCost: 18000, vendor: "Njoro Quarry" },
          ],
          laborCost: 45000,
          subtotal: 98000,
        },
        {
          name: "Roofing",
          materials: [
            { material: "Roof Sheets", quantity: 30, unit: "pcs", unitCost: 1500, totalCost: 45000, vendor: "BuildMart" },
            { material: "Timber", quantity: 50, unit: "pcs", unitCost: 400, totalCost: 20000, vendor: "Timba Ltd" },
          ],
          laborCost: 30000,
          subtotal: 95000,
        },
      ],
    };
    setEstimateData(dummyEstimate);
    setCurrentStep("summary");
  };

  const stepContent = useMemo(() => {
    switch (currentStep) {
      case "projectDetails":
        return (
          <ProjectDetailsResidentialStep
            initialData={projectDetails}
            onNext={(data) => {
              setProjectDetails(data);
              goToNextStep();
            }}
          />
        );
      // case "materialSelection":
      //   return (
      //     <MaterialSelectionStep
      //       onMaterialsSelected={(selected) => {
      //         setSelectedMaterials(selected);
      //         goToNextStep();
      //       }}
      //     />
      //   );
      
      case "materialSelection1":  // Updated: Use MaterialSelectionStep1
        return (
          <MaterialSelectionStep1
            initialData={{
              ...selectedMaterials1,  // Preserve any prior selections
              soilType: projectDetails.land?.soilType,  // Pre-fill from Step 1
              bathrooms: projectDetails.structure?.bathrooms || 2,  // Pre-fill
              roofing: projectDetails.roofStyle? {roofStyle: projectDetails.roofStyle }: undefined
            }}
            onNext={(data) => {
              setSelectedMaterials1(data);  // Store updated materials
              goToNextStep();
            }}
            onBack={goToPreviousStep}  // New: Back navigation
          />
        );
      case "labourEstimate":
        return (
          <LabourCostStep
            projectDetails={{
              structureType: projectDetails.structure?.type || "Bungalow",
              floorArea: Number(projectDetails.land?.size || 100),
              quality: projectDetails.finishing || "Standard",
            }}
            onBack={goToPreviousStep}
            onNext={(data) => {
              setLabourData(data);
              handleGenerateEstimate();
            }}
          />
        );
      case "summary":
        return (
          estimateData && (
            <EstimateSummary
              data={{
                projectName: projectDetails.projectName || "Unnamed Project",
                projectType: projectDetails.structure?.type || "Residential",
                location: `${projectDetails.location?.county || "N/A"}${
                  projectDetails.location?.area ? ` - ${projectDetails.location.area}` : ""
                }`,
                totalCost: estimateData.total,
                duration:
                  estimateData.total > 1000000
                    ? "6–8 months"
                    : estimateData.total > 500000
                    ? "4–6 months"
                    : "2–4 months",
                categories: estimateData.breakdown.map((b: any) => ({
                  name: b.name,
                  cost: b.subtotal,
                })),
                materialCost: 1000000,
                laborCost: 500000,
                avgKenyaCost: 400000, // Mock/search-based avg
                potentialSavings: 350000,   // Calc from optimizations
                keyChoices: ["trying something"], 
              }}
              onViewBreakdown={() => setCurrentStep("breakdown")}
              onEdit={() => setCurrentStep("projectDetails")}
              onDownload={() => alert("PDF export coming soon")}
            />
          )
        );
      case "breakdown":
        return (
          estimateData && (
            <EstimatorBreakdown
              data={data!}
              
              onBackToSummary={() => setCurrentStep("summary")}
            />
          )
        );
        

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-600 dark:text-gray-300">
        <div className="animate-spin border-4 border-blue-400 border-t-transparent rounded-full w-10 h-10 mb-3"></div>
        Fetching detailed breakdown...
      </div>
    );

      default:
        return null;
    }
  }, [currentStep, projectDetails, selectedMaterials1, labourData, estimateData]);

  return (
    <div className="max-w-5xl mx-auto mb-8 mt-4 p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-md space-y-6">

      {/* 🧭 Stepper Progress Bar */}
      <div className="relative flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = steps.findIndex((s) => s.id === currentStep) > index;
          return (
            <div key={step.id} className="flex flex-col items-center relative w-full">
              {/* Line */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-3 left-1/2 w-full h-1 ${
                    isCompleted ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"
                  }`}
                  style={{ zIndex: 0 }}
                />
              )}
              {/* Step Circle */}
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

      {/* 🪶 Step Content with Animation */}
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

