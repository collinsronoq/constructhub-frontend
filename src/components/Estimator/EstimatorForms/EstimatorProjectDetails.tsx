import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ProjectDetailsResidentialStepProps {
  initialData: {
    projectName?: string;
    location?: { county: string; area: string; coordinates?: string };
    land?: { size: string; soilType: string };
    structure?: {
      type: string;
      bedrooms: number;
      bathrooms: number;
      optionalRooms: string[];
    };
    foundation?: string;
    roofing?: string;
    finishing?: string;
    perimeterWall?: boolean;
  };
  onNext: (data: ProjectDetailsResidentialStepProps["initialData"]) => void;
}

const ProjectDetailsResidentialStep: React.FC<ProjectDetailsResidentialStepProps> = ({
  initialData,
  onNext,
}) => {
  const [expanded, setExpanded] = useState<string | null>("location");
  const [localData, setLocalData] = useState(initialData);

  const toggleSection = (section: string) => {
    setExpanded(expanded === section ? null : section);
  };

  const handleChange = (path: string, value: any) => {
    const newData = { ...localData };
    const keys = path.split(".");
    let current: any = newData;
    while (keys.length > 1) current = current[keys.shift()!];
    current[keys[0]] = value;
    setLocalData(newData);
  };

  const handleSubmit = () => {
    if (!localData.projectName || !localData.land?.size || !localData.structure?.type) {
      alert("Please fill in all required fields before proceeding.");
      return;
    }
    onNext(localData);
  };

  const AccordionSection = ({
    title,
    id,
    children,
  }: {
    title: string;
    id: string;
    children: React.ReactNode;
  }) => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg mb-3">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-t-lg"
      >
        <span className="font-semibold text-gray-800 dark:text-gray-100">{title}</span>
        {expanded === id ? <ChevronUp /> : <ChevronDown />}
      </button>
      {expanded === id && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );

  return (
    <section className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Project Details — Residential
      </h2>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
        Provide details about your project. Accurate details help ConstructHub create a realistic cost estimate.
      </p>

      {/* Project Info */}
      <AccordionSection title="Project Info" id="project">
        <div>
          <label className="block text-sm font-medium mb-1">Project Name *</label>
          <input
            type="text"
            value={localData.projectName || ""}
            onChange={(e) => handleChange("projectName", e.target.value)}
            className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700"
            placeholder="e.g., Rono Family Home"
          />
        </div>
      </AccordionSection>

      {/* Location */}
      <AccordionSection title="Location" id="location">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">County *</label>
            <select
              value={localData.location?.county || ""}
              onChange={(e) => handleChange("location.county", e.target.value)}
              className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="">Select County</option>
              <option value="Nakuru">Nakuru</option>
              <option value="Machakos">Machakos</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Specific Area</label>
            <input
              type="text"
              value={localData.location?.area || ""}
              onChange={(e) => handleChange("location.area", e.target.value)}
              className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700"
              placeholder="e.g., Syokimau, Pipeline"
            />
          </div>
        </div>
      </AccordionSection>

      {/* Land Details */}
      <AccordionSection title="Land Details" id="land">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Plot Size (sqm) *</label>
            <input
              type="number"
              value={localData.land?.size || ""}
              onChange={(e) => handleChange("land.size", e.target.value)}
              className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700"
              placeholder="e.g., 500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Soil Type</label>
            <select
              value={localData.land?.soilType || ""}
              onChange={(e) => handleChange("land.soilType", e.target.value)}
              className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="">Select Soil Type</option>
              <option value="Clay">Clay</option>
              <option value="Sandy">Sandy</option>
              <option value="Rocky">Rocky</option>
              <option value="Murram">Murram</option>
            </select>
          </div>
        </div>
      </AccordionSection>

      {/* ... other sections remain unchanged ... */}

      <div className="flex justify-end mt-6">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Next →
        </button>
      </div>
    </section>
  );
};

export default ProjectDetailsResidentialStep;
