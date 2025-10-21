import React from "react";

interface TechnicianFiltersProps {
  selectedSkill: string;
  selectedLocation: string;
  showVerifiedOnly: boolean;
  onSkillChange: (skill: string) => void;
  onLocationChange: (location: string) => void;
  onVerifiedToggle: (checked: boolean) => void;
}

// ✅ Predefined filter options
const SKILLS = [
  "Electrical Engineer",
  "Plumber",
  "Mason",
  "Carpenter",
  "Painter",
  "Welder",
  "Tiler",
  "Roofing Specialist",
];

const LOCATIONS = ["All", "Nakuru", "Machakos"];

const TechnicianFilters: React.FC<TechnicianFiltersProps> = ({
  selectedSkill,
  selectedLocation,
  showVerifiedOnly,
  onSkillChange,
  onLocationChange,
  onVerifiedToggle,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-surface-light dark:bg-surface-dark p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Skill Filter */}
      <div className="flex flex-col w-full md:w-1/3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Skill / Specialization
        </label>
        <select
          value={selectedSkill}
          onChange={(e) => onSkillChange(e.target.value)}
          className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Skills</option>
          {SKILLS.map((skill) => (
            <option key={skill} value={skill}>
              {skill}
            </option>
          ))}
        </select>
      </div>

      {/* Location Filter */}
      <div className="flex flex-col w-full md:w-1/3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Location
        </label>
        <select
          value={selectedLocation}
          onChange={(e) => onLocationChange(e.target.value)}
          className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
        >
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* Verified Toggle */}
      <div className="flex items-center gap-2 mt-2 md:mt-6">
        <input
          type="checkbox"
          id="verified"
          checked={showVerifiedOnly}
          onChange={(e) => onVerifiedToggle(e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label
          htmlFor="verified"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Show verified only
        </label>
      </div>
    </div>
  );
};

export default TechnicianFilters;
