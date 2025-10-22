import React, { useState } from "react";

interface ProjectDetails {
  projectType: string;
  numFloors: number;
  totalArea: number;
  location: string;
  complexityLevel: string;
  description?: string;
}

interface ProjectDetailsStepProps {
  data: ProjectDetails;
  onChange: (data: ProjectDetails) => void;
  onNext: () => void;
}

const EstimatorProjectDetailsStep: React.FC<ProjectDetailsStepProps> = ({
  data,
  onChange,
  onNext,
}) => {
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: name === "numFloors" || name === "totalArea" ? Number(value) : value });
  };

  const handleNext = () => {
    if (!data.projectType || !data.totalArea || !data.location) {
      setError("Please fill in all required fields before proceeding.");
      return;
    }
    setError("");
    onNext();
  };

  return (
    <div className="p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Step 1 – Project Details</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        Provide essential project information to begin the estimation process.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Project Type *
          </label>
          <select
            name="projectType"
            value={data.projectType}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">Select Type</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Industrial">Industrial</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Location *
          </label>
          <select
            name="location"
            value={data.location}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">Select Location</option>
            <option value="Nakuru">Nakuru</option>
            <option value="Machakos">Machakos</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Number of Floors
          </label>
          <input
            type="number"
            name="numFloors"
            value={data.numFloors}
            onChange={handleChange}
            placeholder="e.g. 2"
            className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Total Area (m²) *
          </label>
          <input
            type="number"
            name="totalArea"
            value={data.totalArea}
            onChange={handleChange}
            placeholder="e.g. 200"
            className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Complexity Level
          </label>
          <select
            name="complexityLevel"
            value={data.complexityLevel}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">Select</option>
            <option value="Basic">Basic</option>
            <option value="Standard">Standard</option>
            <option value="Premium">Premium</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            name="description"
            value={data.description || ""}
            onChange={handleChange}
            rows={3}
            placeholder="Brief project description..."
            className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default EstimatorProjectDetailsStep;
