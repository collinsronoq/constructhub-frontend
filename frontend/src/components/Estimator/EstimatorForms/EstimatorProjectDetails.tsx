import React, { useCallback, useState, memo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type SoilType = "clay" | "sandy" | "rocky" | "murram";
type StructureType = "bungalow" | "1.5-storey" | "2-storey" | "3-storey";
type RoofStyle = "pitched" | "flat";
type FinishLevel = "economy" | "standard" | "premium";

interface ProjectDetailsResidentialStepProps {
  initialData: {
    projectName?: string;
    location?: { county?: string; area?: string; coordinates?: string };
    land?: { size?: number; soilType?: SoilType };
    structure?: {
      type?: StructureType;
      bedrooms?: number;
      bathrooms?: number;
      rooms?: string[]; // e.g., ['kitchen', 'pantry']
      floorArea?: number;
      storeys?: number;
    };
    sewage?: {
      type?: "sewer" | "septic";
      septicSize?: number;
    };
    waterSupply?: "municipal" | "borehole" | "rainwater";
    security?: { wallHeight?: number; includeGate?: boolean; wallSecurity?: "wiremesh" | "electric-wire" };
    foundation?: string;
    roofing?: string;
    roofStyle?: RoofStyle;
    finishing?: FinishLevel;
    perimeterWall?: { include?: boolean; height?: number; lengthM?: number; includeGate?: boolean; wallSecurity?: "barbed-wire" | "electric-wire" | "hybrid" };
  };
  onNext: (data: ProjectDetailsResidentialStepProps["initialData"]) => void;
}

const landSizePresets = [
  { label: "50x100 ft (1/8 acre)", sqm: 465 },
  { label: "100x100 ft (1/4 acre)", sqm: 930 },
  { label: "1/2 acre", sqm: 2023 },
  { label: "1 acre", sqm: 4047 },
  { label: "Other (Enter sqm)", sqm: 0 }, // Custom
];

const ProjectDetailsResidentialStep: React.FC<ProjectDetailsResidentialStepProps> = ({ initialData, onNext }) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(["project", "location"]);
  const [localData, setLocalData] = useState(() => initialData || {});

  /* Toggle multiple sections open */
  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  }, []);

  /** Immutable deep update (safe nested state update) */
  const handleChange = useCallback((path: string, value: any) => {
    setLocalData((prev: any) => {
      const keys = path.split(".");
      const newData = { ...prev };
      let currPrev: any = prev;
      let currNew: any = newData;

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const last = i === keys.length - 1;
        if (last) {
          if (currPrev?.[key] === value) return prev; // no change, skip state update
          currNew[key] = value;
        } else {
          currNew[key] = currPrev?.[key] ? { ...currPrev[key] } : {};
          currNew = currNew[key];
          currPrev = currPrev?.[key];
        }
      }

      return newData;
    });
  }, []);

  const handleSubmit = () => onNext(localData);

  const AccordionSection = ({
    title,
    id,
    children,
  }: {
    title: string;
    id: string;
    children: React.ReactNode;
  }) => {
    const isOpen = expandedSections.includes(id);
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg mb-3 overflow-hidden">
        <button
          onClick={() => toggleSection(id)}
          type="button"
          className="w-full flex justify-between items-center p-4 bg-background-light dark:bg-background-dark hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <span className="font-semibold text-sm md:text-base text-gray-800 dark:text-gray-100">
            {title}
          </span>
          {isOpen ? <ChevronUp /> : <ChevronDown />}
        </button>
        {isOpen && <div className="p-4 space-y-4">{children}</div>}
      </div>
    );
  };

  return (
    <section className="max-w-3xl mx-auto">
      <h2 className="text-lg md:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Project Details – Residential
      </h2>
      
      <h2 className="text-lg md:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Let's Build Your Dream Home – Step by Step
      </h2>
      <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm mb-6">
        Start with the basics and watch your project take shape. We'll guide you through.
      </p>

      {/* Project Info */}
      <AccordionSection title="Project Info" id="project">
        <div>
          <p className="text-xs md:text-sm text-gray-500 mb-2">Give it a personal touch!</p>
          <label className="block text-xs md:text-base font-medium mb-1">Project Name *</label>
          
          <input
            type="text"
            value={localData.projectName ?? ""}
            onChange={(e) => handleChange("projectName", e.target.value)}
            className="w-full border rounded-lg p-2  dark:bg-background-dark dark:border-gray-700"
            placeholder="e.g., Rono Family Home"
          />
        </div>
      </AccordionSection>

      {/* Location */}
      <AccordionSection title="Location" id="location">
        <p className="text-xs md:text-sm text-gray-500 mb-2">Location affects costs and recommendations.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs md:text-base font-medium mb-1">County *</label>
            <select
              value={localData.location?.county || ""}
              onChange={(e) => handleChange("location.county", e.target.value)}
              className="w-full border rounded-lg p-2 text-xs md:text-base  dark:bg-background-dark dark:border-gray-700"
            >
              <option value="">Select County</option>
              <option value="Nakuru">Nakuru</option>
              <option value="Machakos">Machakos</option>
              <option value="Kajiado">Kajiado</option>
              <option value="Kiambu">Kiambu</option>
            </select>
          </div>
          <div>
            <label className="block text-xs md:text-base font-medium mb-1">Specific Area</label>
            <input
              type="text"
              value={localData.location?.area || ""}
              onChange={(e) => handleChange("location.area", e.target.value)}
              className="w-full border rounded-lg p-2 text-xs md:text-base  dark:bg-background-dark dark:border-gray-700"
              placeholder="e.g., Syokimau, Pipeline"
            />
          </div>
        </div>
      </AccordionSection>

      {/* Land Details */}
      <AccordionSection title="Land Details" id="land">
        <p className="text-xs md:text-sm text-gray-500 mb-2">Size and soil set the foundation.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            
            <label className="block text-xs md:text-base font-medium mb-1">Plot Size *</label>
            <select
              value={localData.land?.size ?? ""}
              onChange={(e) =>
                handleChange("land.size", e.target.value === "" ? undefined : Number(e.target.value))
              }
              className="w-full border rounded-lg text-xs md:text-sm p-2 bg-white dark:bg-background-dark mb-4"
            >
              <option value="">Select Size</option>
              {landSizePresets.map((p) => (
                <option key={p.label} value={p.sqm}>
                  {p.label}
                </option>
              ))}
              <option value="0">Other (Enter sqm)</option>
            </select>
            <div className={localData.land?.size === 0 ? "block" : "hidden"}>
              <input
                type="number"
                value={localData.land?.size ?? ""}
                onChange={(e) =>
                  handleChange("land.size", e.target.value === "" ? undefined : Number(e.target.value))
                }
                placeholder="Enter sqm"
                className="w-full border rounded-lg p-2 text-xs md:text-base bg-white dark:bg-background-dark dark:border-gray-700"
              />
            </div>
            
            
          </div>
          <div>
            <label className="block text-xs md:text-base font-medium mb-1">Soil Type</label>
            <select
              value={localData.land?.soilType || ""}
              onChange={(e) => handleChange("land.soilType", e.target.value)}
              className="w-full border rounded-lg p-2 text-xs md:text-base  dark:bg-background-dark dark:border-gray-700"
            >
              <option value="">Select Soil Type</option>
              <option value="clay">Clay</option>
              <option value="sandy">Sandy</option>
              <option value="rocky">Rocky</option>
              <option value="murram">Murram</option>
            </select>
          </div>
        </div>
      </AccordionSection>

      {/* project structure details */}
      <AccordionSection title="Structure Details" id="structure">
        <div className="space-y-4">
          <p className="text-xs md:text-sm text-gray-500 mb-2">How many floors and rooms? Let's shape it!</p>
          <div>
            <label className="block text-xs md:text-base font-medium mb-1">Structure Type *</label>
            <select
              value={localData.structure?.type || ""}
              onChange={(e) => handleChange("structure.type", e.target.value)}
              className="w-full border rounded-lg p-2 text-xs md:text-base dark:bg-background-dark"
            >
              <option value="">Select Type</option>
              <option value="bungalow">Bungalow (1 Floor)</option>
              <option value="1.5-storey">1.5 Storey</option>
              <option value="2-storey">2 Storey</option>
              <option value="3-storey">3 Storey</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs md:text-base font-medium mb-1">Bedrooms *</label>
              <select 
                value={localData.structure?.bedrooms ?? 3} 
                onChange={(e) => handleChange("structure.bedrooms", Number(e.target.value))}
                className="w-full border rounded-lg p-2 text-xs md:text-base dark:bg-background-dark"
              >
                {[1,2,3,4,5].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs md:text-base font-medium mb-1">Bathrooms *</label>
              <select 
                value={localData.structure?.bathrooms ?? 2} 
                onChange={(e) => handleChange("structure.bathrooms", Number(e.target.value))}
                className="w-full border rounded-lg p-2 text-xs md:text-base dark:bg-background-dark"
              >
                {[1,2,3,4,5].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label>Rooms *</label>
            <div className="grid grid-cols-2 gap-2">
              {['kitchen', 'living room', 'dining area'].map(room => (
                <div key={room} className="flex items-center space-x-2 text-xs md:text-base">
                  <input 
                    type="checkbox" 
                    checked 
                    disabled 
                    
                  />
                  <label htmlFor="number of rooms">{room.charAt(0).toUpperCase() + room.slice(1)} (Essential)</label> 
                </div>
              ))}
              {['pantry', 'family room', 'study', 'guest bedroom', 'laundry', 'office'].map(room => (
                <div key={room} className="flex items-center space-x-2 text-xs md:text-base">
                  <input
                    type="checkbox"
                    checked={(localData.structure?.rooms || []).includes(room)}
                    onChange={(e) => {
                      const rooms = localData.structure?.rooms || [];
                      handleChange("structure.rooms", e.target.checked ? [...rooms, room] : rooms.filter(r => r !== room));
                    }}
                  /> 
                  <label htmlFor="non-essential rooms">
                    {room.charAt(0).toUpperCase() + room.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AccordionSection>

      {/* Foundation */}
      <AccordionSection title="Foundation Details" id="foundation">
        <div>
          <label className="block text-xs md:text-base font-medium mb-1">Foundation Type</label>
          <select
            value={localData.foundation || ""}
            onChange={(e) => handleChange("foundation", e.target.value)}
            className="w-full border rounded-lg p-2 text-xs md:text-base dark:bg-background-dark dark:border-gray-700"
          >
            <option value="">Select Foundation</option>
            <option value="Strip">Strip Foundation</option>
            <option value="Raft">Raft Foundation</option>
            <option value="Pile">Pile Foundation</option>
          </select>
        </div>
      </AccordionSection>

      {/* Roofing */}
      <AccordionSection title="Roofing Preferences" id="roofing">
        <p className="text-xs md:text-sm text-gray-500 mb-2">choose your roofing style</p>
        <div>
          <label className="block text-xs md:text-base font-medium mb-1">Roof Style</label>
          <select
            value={localData.roofStyle || ""}
            onChange={(e) => handleChange("roofStyle", e.target.value)}
            className="w-full border rounded-lg p-2 text-xs md:text-base dark:bg-background-dark dark:border-gray-700"
          >
            <option value="">Select Style</option>
            <option value="pitched">Pitched (Gable/Hip)</option>
            <option value="flat">Flat (Slab)</option>
          </select>
        </div>
      </AccordionSection>
        
      

      {/* Finishing */}
      <AccordionSection title="Finishing" id="finishing">
        <div>
          <label className="block text-xs md:text-base font-medium mb-1">
            Finishing Preference
          </label>
          <select
            value={localData.finishing || ""}
            onChange={(e) => handleChange("finishing", e.target.value)}
            className="w-full border rounded-lg p-2 text-xs md:text-base dark:bg-background-dark dark:border-gray-700"
          >
            <option value="">Select Level</option>
            <option value="Basic">Basic</option>
            <option value="Standard">Standard</option>
            <option value="Luxury">Luxury</option>
          </select>
        </div>
      </AccordionSection>

      {/* Perimeter Wall */}
      <AccordionSection title="Perimeter Wall" id="perimeterWall">
        <div className="space-y-2">
          <p className="text-xs text-gray-500 mb-2">Add boundaries for peace of mind.</p>
          <div className="flex items-center space-x-2">
            <input
              id="perimeterWall"
              type="checkbox"
              checked={localData.perimeterWall?.include || false}
              onChange={(e) => handleChange("perimeterWall.include", e.target.checked)}
              className="w-4 h-4"
            />
            <label
              htmlFor="perimeterWall"
              className="text-xs md:text-base text-gray-700 dark:text-gray-300"
            >
              Include Perimeter Wall in Estimate
            </label>
          </div>
          
          
          <div className={localData.perimeterWall?.include ? "block space-y-2" : "hidden"}>
            <label className="block text-xs md:text-base font-medium mb-1">Wall Height (ft)</label>
            <select
              value={localData.perimeterWall?.height ?? 6}
              onChange={(e) => handleChange("perimeterWall.height", Number(e.target.value))}
              className="w-full border rounded-lg p-2 text-xs md:text-base dark:bg-background-dark dark:border-gray-700"
            >
              <option value={6}>6 ft</option>
              <option value={8}>8 ft</option>
              <option value={10}>10 ft</option>
              <option value={12}>12 ft</option>
              <option value={14}>14 ft</option>
              <option value={16}>16 ft</option>
            </select>
            <label className="block text-xs md:text-base font-medium my-2">Wall Security</label>
            <select
              value={localData.perimeterWall?.wallSecurity || "barbed-wire"}
              onChange={(e) => handleChange("perimeterWall.wallSecurity", e.target.value)}
              className="w-full border rounded-lg p-2 text-xs md:text-base dark:bg-background-dark dark:border-gray-700"
            >
              <option value="barbed-wire">barbed wire</option>
              <option value="electric-wires">electric fence</option>
              <option value="hybrid">electric fence and barbed wire</option>
              
            </select>
          </div>
          
        </div>
        
      </AccordionSection>
      
      {/* sewage */}
      <AccordionSection title="Sewage System" id="sewage">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              id="sewer"
              type="radio"
              checked={localData.sewage?.type === 'sewer'}
              className="w-3 h-3"
              onChange={() => handleChange("sewage.type", 'sewer')}
            />
            <label 
              htmlFor="sewer"
              className="text-sm md:text-base text-gray-700 dark:text-gray-300"
            >
              Near Sewer Line
            </label>
           
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              id="septic"
              type="radio"
              checked={localData.sewage?.type === 'septic'}
              onChange={() => handleChange("sewage.type", 'septic')}
            />
            <label htmlFor="septic" className="text-sm md:text-base text-gray-700 dark:text-gray-300">
              Build Septic Tank
            </label>
          </div>
          
          <div className={localData.sewage?.type === 'septic' ? "flex items-center space-x-2" : "hidden"}>
            <label 
              htmlFor="septic size" 
              className="text-sm md:text-base text-gray-700 dark:text-gray-300"
            >
              Septic Size (cubic m) - Optional
            </label>
            <input 
              id="septic-size"
              type="number" 
              value={localData.sewage?.septicSize ?? ''} 
              onChange={(e) => handleChange("sewage.septicSize", e.target.value === "" ? undefined : Number(e.target.value))} 
              className="w-full border rounded-lg p-2 text-xs md:text-base dark:bg-background-dark dark:border-gray-700" 
              placeholder="e.g., 500"  
            />
            
          </div>
        </div>
      </AccordionSection>

      {/* Next Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 text-xs md:text-base rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Next →
        </button>
      </div>
    </section>
  );
};

export default memo(ProjectDetailsResidentialStep);
