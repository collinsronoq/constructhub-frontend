import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface MaterialSelectionData {
  soilType?: "clay" | "sandy" | "rocky" | "murram";
  bathrooms?: number;
  foundation?: { type?: "strip" | "raft" | "pile" };
  walling?: { material?: "machine-cut stones" | "bricks" | "concrete blocks" | "interlocking" };
  roofing?: { roofingPreference?: "iron sheets" | "clay tiles" | "stone-coated" | "shingles" };
  finishing?: "basic" | "standard" | "premium";
}

export interface MaterialSelectionProps {
  initialData: MaterialSelectionData;
  onNext: (data: MaterialSelectionData) => void;
  onBack?: () => void;
}

const AccordionSection = ({ title, id, isOpen, toggle, children }: { title: string; id: string; isOpen: boolean; toggle: (id: string) => void; children: React.ReactNode }) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg mb-3 overflow-hidden">
    <button
      onClick={() => toggle(id)}
      type="button"
      className="w-full flex justify-between items-center p-4 bg-background-light dark:bg-background-dark hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      <span className="font-semibold text-sm md:text-base text-gray-800 dark:text-gray-100">{title}</span>
      {isOpen ? <ChevronUp /> : <ChevronDown />}
    </button>
    {isOpen && <div className="p-4 space-y-4">{children}</div>}
  </div>
);

const MaterialSelectionStep1: React.FC<MaterialSelectionProps> = ({ initialData, onNext, onBack }) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(["foundation", "walling", "roofing", "finishing"]);
  const [localData, setLocalData] = useState<MaterialSelectionData>(initialData || {});

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]));
  };

  const handleChange = (path: string, value: any) => {
    setLocalData((prev: any) => {
      const keys = path.split(".");
      const next = { ...prev };
      let current: any = next;
      keys.forEach((key, idx) => {
        if (idx === keys.length - 1) current[key] = value;
        else {
          current[key] = current[key] ? { ...current[key] } : {};
          current = current[key];
        }
      });
      return next;
    });
  };

  const handleSubmit = () => onNext(localData);

  return (
    <section className="max-w-3xl mx-auto">
      <h2 className="text-lg md:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Materials & Specs</h2>
      <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm mb-6">Tune core specifications to guide the estimate.</p>

      <AccordionSection title="Foundation" id="foundation" isOpen={expandedSections.includes("foundation")} toggle={toggleSection}>
        <div className="space-y-3">
          <label className="block text-xs md:text-base font-medium mb-1">Recommended foundation for your soil</label>
          <select
            value={localData.foundation?.type || ""}
            onChange={(e) => handleChange("foundation.type", e.target.value)}
            className="w-full border rounded-lg p-2 text-xs md:text-base dark:bg-background-dark dark:border-gray-700"
          >
            <option value="">Select type</option>
            <option value="strip">Strip (most common)</option>
            <option value="raft">Raft (weak soils)</option>
            <option value="pile">Pile (rocky/deep)</option>
          </select>
        </div>
      </AccordionSection>

      <AccordionSection title="Walling / Blockwork" id="walling" isOpen={expandedSections.includes("walling")} toggle={toggleSection}>
        <div className="space-y-3">
          <label className="block text-xs md:text-base font-medium mb-1">Wall material</label>
          <select
            value={localData.walling?.material || ""}
            onChange={(e) => handleChange("walling.material", e.target.value)}
            className="w-full border rounded-lg p-2 text-xs md:text-base dark:bg-background-dark dark:border-gray-700"
          >
            <option value="">Select</option>
            <option value="machine-cut stones">Machine-cut stones</option>
            <option value="concrete blocks">Concrete blocks</option>
            <option value="bricks">Bricks</option>
            <option value="interlocking">Interlocking blocks</option>
          </select>
        </div>
      </AccordionSection>

      <AccordionSection title="Roof Covering" id="roofing" isOpen={expandedSections.includes("roofing")} toggle={toggleSection}>
        <div className="space-y-3">
          <label className="block text-xs md:text-base font-medium mb-1">Roof covering</label>
          <select
            value={localData.roofing?.roofingPreference || ""}
            onChange={(e) => handleChange("roofing.roofingPreference", e.target.value)}
            className="w-full border rounded-lg p-2 text-xs md:text-base dark:bg-background-dark dark:border-gray-700"
          >
            <option value="">Select</option>
            <option value="iron sheets">Corrugated/Box profile</option>
            <option value="stone-coated">Stone-coated tiles</option>
            <option value="clay tiles">Clay tiles</option>
            <option value="shingles">Shingles</option>
          </select>
        </div>
      </AccordionSection>

      <AccordionSection title="Finishing" id="finishing" isOpen={expandedSections.includes("finishing")} toggle={toggleSection}>
        <div className="space-y-3">
          <label className="block text-xs md:text-base font-medium mb-1">Finish level</label>
          <select
            value={localData.finishing || ""}
            onChange={(e) => handleChange("finishing", e.target.value)}
            className="w-full border rounded-lg p-2 text-xs md:text-base dark:bg-background-dark dark:border-gray-700"
          >
            <option value="">Select</option>
            <option value="basic">Basic</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
          </select>
        </div>
      </AccordionSection>

      <div className="mt-6 flex justify-between">
        {onBack && (
          <button onClick={onBack} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm md:text-base">
            Back
          </button>
        )}
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm md:text-base"
        >
          Continue
        </button>
      </div>
    </section>
  );
};

export default MaterialSelectionStep1;
