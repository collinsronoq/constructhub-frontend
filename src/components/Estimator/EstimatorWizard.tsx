// src/components/Estimator/EstimatorWizard.tsx
import React, { useState } from "react";
import { useEstimatorForm } from "../../hooks/Estimator/useEsimatorForm";
import EstimatorProjectDetailsStep from "./EstimatorForms/EstimatorProjectDetails";

const EstimatorWizard: React.FC = () => {
  const { formState, updateProjectDetails } = useEstimatorForm();
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleBack = () => setCurrentStep((prev) => prev - 1);

  return (
    <section className="p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-md my-8 space-y-6">
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Construction Cost Estimator
      </h1>

      {currentStep === 1 && (
        <EstimatorProjectDetailsStep
          data={formState.projectDetails}
          onChange={updateProjectDetails}
          onNext={handleNext}
        />
      )}

      {currentStep > 1 && (
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>Step {currentStep} coming soon...</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-md"
          >
            Back
          </button>
        </div>
      )}
    </section>
  );
};

export default EstimatorWizard;
