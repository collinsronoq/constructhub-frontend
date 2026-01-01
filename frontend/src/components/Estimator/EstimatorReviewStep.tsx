import React from "react";
import { Info } from "lucide-react";

interface ReviewProps {
  projectDetails: {
    structureType: string;
    floorArea: number;
    quality: string;
    roofStyle?: string;
    location?: string;
  };
  onNext: () => void;
  onBack: () => void;
}

const EstimatorReviewStep: React.FC<ReviewProps> = ({ projectDetails, onNext, onBack }) => {
  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100">Review & Generate</h2>
      <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
        Confirm the key project details before generating the full estimate. Labour/material costs will be calculated by the backend.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase text-gray-500">Structure</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200">{projectDetails.structureType}</div>
            </div>
            <Info size={16} className="text-gray-400" />
          </div>
        </div>

        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
          <div className="text-xs uppercase text-gray-500">Floor Area (sqm)</div>
          <div className="font-semibold text-gray-800 dark:text-gray-200">{Math.round(projectDetails.floorArea)}</div>
        </div>

        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
          <div className="text-xs uppercase text-gray-500">Finish Level</div>
          <div className="font-semibold text-gray-800 dark:text-gray-200">{projectDetails.quality}</div>
        </div>

        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
          <div className="text-xs uppercase text-gray-500">Roof Style</div>
          <div className="font-semibold text-gray-800 dark:text-gray-200">{projectDetails.roofStyle || "Not set"}</div>
        </div>

        {projectDetails.location && (
          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
            <div className="text-xs uppercase text-gray-500">Location</div>
            <div className="font-semibold text-gray-800 dark:text-gray-200">{projectDetails.location}</div>
          </div>
        )}
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">What happens next</h3>
        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
          We’ll send your inputs to the estimator service to quantify materials and labour for all phases, then return a detailed summary and breakdown.
        </p>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm md:text-base"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition text-sm md:text-base"
        >
          Generate Estimate
        </button>
      </div>
    </div>
  );
};

export default EstimatorReviewStep;
