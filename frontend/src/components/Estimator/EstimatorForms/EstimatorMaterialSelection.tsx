
import { ChevronDown, ChevronUp } from "lucide-react";
import type React from "react";
import { useState } from "react";



export interface MaterialSelectionProps {
  initialData: {
    
    soilType?: 'clay' | 'sandy' | 'rocky' | 'murram';  // For foundation suggestions
    bathrooms: number;  // For plumbing qty hints

    foundation?: {
      type: 'strip' | 'raft' | 'pile';
      cementBrand?: 'Bamburi' | 'Ndovu' | 'Savannah';  // Common per search
    };

    walling?: {
      material: 'machine-cut stones' | 'bricks' | 'concrete blocks' | 'interlocking';
      quality: 'economy' | 'standard' | 'premium';
    };

    flooring?:{
      material: 'tiles' | 'wooden tiles' | 'epoxy';
      quality: 'economy' | 'standard' | 'premium';
    }

    doorsWindows?:{
      material: 'wooden' | 'aluminium' | 'uPVC';
      quality: 'economy' | 'standard' | 'premium';
      count?: number;
       
    }

    roofing?: {
      roofStyle?: 'pitched' | 'flat';
      roofingPreference?: 'iron sheets' | 'clay tiles' | 'stone-coated' | 'shingles';  // Pitched
      waterProofing?: 'bitumen' | 'concrete sealant';  // Flat
      
    };

    plumbing?: {
      pipes: 'PVC' | 'GI' | 'PPR';
      fittingsQuality: 'basic' | 'standard' | 'premium';
    };

    electrical?: {
      wiring: 'single-phase' | 'three-phase' | 'hybrid';
      fixtures: 'basic' | 'smart' | 'hybrid';
    };
    finishing?: 'basic' | 'standard' | 'premium';  // Global, but could expand

    finishingDetails?:{
      paintType: 'acrylic' | 'emersion' | 'weather-guard';
      plasterType: 'gypsum' | 'lime' | 'cement-based';
    }
  
  }
  
  onNext: (data: MaterialSelectionProps["initialData"]) => void;
  onBack?: () => void;  // New: Optional back handler
}


const MaterialSelectionStep1: React.FC<MaterialSelectionProps> = ({
  initialData,
  onNext,
  onBack,
}) =>{
  const [localData, setLocalData] = useState(initialData || {});
  const [expandedSections, setExpandedSections] = useState<string[]>([]);


  /* Toggle multiple sections open */
  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  /**  Immutable deep update (safe nested state update) */
  const handleChange = (path: string, value: any) => {
    setLocalData((prev: any) => {
      const keys = path.split(".");
      const newData = { ...prev };
      let current: any = newData;

      keys.forEach((key, idx) => {
        if (idx === keys.length - 1) {
          current[key] = value;
        } else {
          current[key] = current[key] ? { ...current[key] } : {};
          current = current[key];
        }
      });

      return newData;
    });
  };

  const handleSubmit = () => {
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
      <h2 className="text-lg md:text-2xl font-semibold mb-4">
        Customize Your Materials
      </h2>
      <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm mb-6">
        Choose preferences for each phase. We'll use these for a tailored estimate.
      </p>

      {/* 1. Foundation (Conditional on soilType) */}
      <AccordionSection title="Foundation: Build a Strong Base" id="foundation">
        <p className="text-xs text-gray-500 mb-2">Suggested for {initialData.soilType || 'your soil'}: {initialData.soilType === 'rocky' ? 'Pile for stability' : 'Strip/Raft'}.</p>
        <div className="space-y-4">
          <select
            value={localData.foundation?.type || ""}
            onChange={(e) => handleChange("foundation.type", e.target.value)}
            className="w-full border rounded-lg p-2 text-xs md:text-base  dark:bg-background-dark dark:border-gray-700"
          >
            <option value="">Select Type</option>
            <option value="strip">Strip (Shallow, KES ~50K/sqm)</option>
            <option value="raft">Raft (For soft soil, KES ~70K/sqm)</option>
            <option value="pile">Pile (Deep/rocky, KES ~100K/sqm)</option>
          </select>
          <select
            value={localData.foundation?.cementBrand || ""}
            onChange={(e) => handleChange("foundation.cementBrand", e.target.value)}
            className="w-full border rounded-lg p-2 text-xs md:text-base  dark:bg-background-dark dark:border-gray-700"
          >
            <option value="">Cement Brand (Optional)</option>
            <option value="Bamburi">Bamburi (Durable)</option>
            <option value="Ndovu">Ndovu (Affordable)</option>
            <option value="Savannah">Savannah (Eco-friendly)</option>
          </select>
        </div>
      </AccordionSection>

      {/* 2. Walling */}
      <AccordionSection title="Walling: Raise the Walls" id="walling">
        <p className="text-xs text-gray-500 mb-2">Common in Kenya: Stones for strength.</p>
        <div className="space-y-4">
          <select
            value={localData.walling?.material || ""}
            onChange={(e) => handleChange("walling.material", e.target.value)}
            className="w-full border rounded-lg p-2 text-xs md:text-base  dark:bg-background-dark dark:border-gray-700"
          >
            <option value="">Select Material</option>
            <option value="machine-cut stones">Machine-Cut Stones (KES 25/pc)</option>
            <option value="bricks">Bricks (Clay/Interlocking, KES 10-20/pc)</option>
            <option value="concrete blocks">Concrete Blocks (KES 30/pc)</option>
          </select>
          <select
            value={localData.walling?.quality || ""}
            onChange={(e) => handleChange("walling.quality", e.target.value)}
            className="w-full border rounded-lg p-2 text-xs md:text-base  dark:bg-background-dark dark:border-gray-700"
          >
            <option value="">Quality</option>
            <option value="economy">Economy</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
          </select>
        </div>
      </AccordionSection>

      {/* 3. Roofing */}
      <AccordionSection title="Roofing Preference" id="roofing">
        <div className="space-y-4">
          <select
            value={localData.roofing?.roofStyle || ""}
            onChange={(e) => handleChange("roofing.roofStyle", e.target.value)}
            className="w-full border rounded-lg p-2 text-xs md:text-base  dark:bg-background-dark dark:border-gray-700"
          >
            <option value="">Select Roof Style</option>
            <option value="pitched">Pitched (Gable/Hip)</option>
            <option value="flat">Flat (Slab)</option>
          </select>
          {localData.roofing?.roofStyle === 'pitched' && (
            <div>
              <label>Material</label>
              <select 
                value={localData.roofing?.roofingPreference || ""}
                onChange={(e) => handleChange("roofing.roofingPreference", e.target.value)}
                className="w-full border rounded-lg p-2 text-xs md:text-base  dark:bg-background-dark dark:border-gray-700"
              >
                <option value="">Select Material</option>
                <option value="iron sheets">Iron Sheets (Mabati)</option>
                <option value="clay tiles">Clay Tiles</option>
                <option value="stone-coated">Stone-Coated</option>
                <option value="shingles">Shingles</option>
              </select>
            </div>
          )}
          {localData.roofing?.roofStyle === 'flat' && (
            <div>
              <label>Waterproofing Type</label>
              <select 
                value={localData.roofing?.waterProofing || ""}
                onChange={(e) => handleChange("roofing.waterProofing", e.target.value)}
                className="w-full border rounded-lg p-2 text-xs md:text-base  dark:bg-background-dark dark:border-gray-700"
              >
                <option value="">Select Waterproofing</option>
                <option value="bitumen">Bitumen Membrane</option>
                <option value="concrete sealant">Concrete Slab with Sealant</option>
              </select>
            </div>
          )}
        </div>
      </AccordionSection>

      {/* 4. Plumbing */}
      <AccordionSection title="Plumbing: Flow and Function" id="plumbing">
        <p className="text-xs text-gray-500 mb-2">Based on {initialData.bathrooms || 2} bathrooms: Suggest {initialData.bathrooms > 3 ? 'PPR for durability' : 'PVC'}.</p>
        <div className="space-y-4">
          <select
            value={localData.plumbing?.pipes || ""}
            onChange={(e) => handleChange("plumbing.pipes", e.target.value)}
            className="w-full border rounded-lg p-2 text-xs md:text-base  dark:bg-background-dark dark:border-gray-700"
          >
            <option value="">Pipes</option>
            <option value="PVC">PVC (Affordable, KES 100/m)</option>
            <option value="GI">GI (Galvanized Iron, KES 200/m)</option>
            <option value="PPR">PPR (Heat-resistant, KES 150/m)</option>
          </select>
          <select
            value={localData.plumbing?.fittingsQuality || ""}
            onChange={(e) => handleChange("plumbing.fittingsQuality", e.target.value)}
            className="w-full border rounded-lg p-2 text-xs md:text-base  dark:bg-background-dark dark:border-gray-700"
          >
            <option value="">Fittings Quality</option>
            <option value="basic">Basic</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
          </select>
        </div>
      </AccordionSection>

      {/* 5. Electrical */}
      <AccordionSection title="Electrical: Power Your Home" id="electrical">
        <p className="text-xs text-gray-500 mb-2">For residential: Single-phase usually sufficient.</p>
        <div className="space-y-4">
          <select
            value={localData.electrical?.wiring || ""}
            onChange={(e) => handleChange("electrical.wiring", e.target.value)}
            className="w-full border rounded-lg p-2 text-xs md:text-base  dark:bg-background-dark dark:border-gray-700"
          >
            <option value="">Wiring Type</option>
            <option value="single-phase">Single-Phase (Standard)</option>
            <option value="three-phase">Three-Phase (Heavy appliances)</option>
            <option value="hybrid">Both Single and Three phase</option>
          </select>
          <select
            value={localData.electrical?.fixtures || ""}
            onChange={(e) => handleChange("electrical.fixtures", e.target.value)}
            className="w-full border rounded-lg p-2 text-xs md:text-base  dark:bg-background-dark dark:border-gray-700"
          >
            <option value="">Fixtures</option>
            <option value="basic">Basic (Switches/Sockets)</option>
            <option value="smart">Smart (Home automation)</option>
            <option value="hybrid">Basic and Smart integrated</option>
          </select>
        </div>
      </AccordionSection>

      {/* 6. Flooring (New) */}
      <AccordionSection title="Flooring: Step in Style" id="flooring">
        <p className="text-xs text-gray-500 mb-2">Choose durable options for high-traffic areas.</p>
        <div className="space-y-4">
          <select
            value={localData.flooring?.material || ""}
            onChange={(e) => handleChange("flooring.material", e.target.value)}
            className="w-full border rounded-lg p-2 text-xs md:text-base  dark:bg-background-dark dark:border-gray-700"
          >
            <option value="">Select Material</option>
            <option value="ceramic tiles">Ceramic Tiles (KES 500/sqm)</option>
            <option value="porcelain tiles">Porcelain Tiles (KES 800/sqm)</option>
            <option value="laminate">Laminate Flooring (KES 600/sqm)</option>
            <option value="epoxy">Epoxy (KES 1,000/sqm)</option>
            <option value="wooden">Wooden (Hardwood, KES 1,200/sqm)</option>
          </select>
          <select
            value={localData.flooring?.quality || ""}
            onChange={(e) => handleChange("flooring.quality", e.target.value)}
            className="w-full border rounded-lg p-2 text-xs md:text-base  dark:bg-background-dark dark:border-gray-700"
          >
            <option value="">Quality</option>
            <option value="economy">Economy</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
          </select>
        </div>
      </AccordionSection>

      {/* 7. Doors & Windows (New) */}
      <AccordionSection title="Doors & Windows: Let the Light In" id="doorsWindows">
        <p className="text-xs text-gray-500 mb-2">Suggested count based on rooms: {initialData.bathrooms + 4 || 6} windows/doors.</p>
        <div className="space-y-4">
          <select
            value={localData.doorsWindows?.material || ""}
            onChange={(e) => handleChange("doorsWindows.material", e.target.value)}
            className="w-full border rounded-lg p-2 text-xs md:text-base  dark:bg-background-dark dark:border-gray-700"
          >
            <option value="">Select Material</option>
            <option value="wooden">Wooden (KES 5,000-10,000/unit)</option>
            <option value="aluminum">Aluminum (KES 8,000-15,000/unit)</option>
            <option value="steel">Steel (KES 6,000-12,000/unit)</option>
            <option value="uPVC">uPVC (KES 7,000-14,000/unit)</option>
          </select>
          <select
            value={localData.doorsWindows?.quality || ""}
            onChange={(e) => handleChange("doorsWindows.quality", e.target.value)}
            className="w-full border rounded-lg p-2 text-xs md:text-base  dark:bg-background-dark dark:border-gray-700"
          >
            <option value="">Quality</option>
            <option value="economy">Economy</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
          </select>
          <input
            type="number"
            value={localData.doorsWindows?.count || ""}
            onChange={(e) => handleChange("doorsWindows.count", Number(e.target.value))}
            placeholder="Total Units (Optional, auto-suggested)"
            className="w-full border rounded-lg p-2 text-xs md:text-base  dark:bg-background-dark dark:border-gray-700"
          />
        </div>
      </AccordionSection>

      {/* 8. Finishing (Extended with Painting/Plastering) */}
      <AccordionSection title="Finishing: The Final Touch" id="finishing">
        <p className="text-xs text-gray-500 mb-2">Overall level—details like paints/tiles/plaster.</p>
        <div className="space-y-4">
          <select
            value={localData.finishing || ""}
            onChange={(e) => handleChange("finishing", e.target.value)}
            className="w-full border rounded-lg p-2 text-xs md:text-base dark:bg-background-dark dark:border-gray-700"
          >
            <option value="">Select Level</option>
            <option value="basic">Basic</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
          </select>
          <select
            value={localData.finishingDetails?.paintType || ""}
            onChange={(e) => handleChange("finishingDetails.paintType", e.target.value)}
            className="w-full border rounded-lg p-2 text-xs md:text-base dark:bg-background-dark dark:border-gray-700"
          >
            <option value="">Paint Type (Interior/Exterior)</option>
            <option value="acrylic">Acrylic (KES 2,000/20L)</option>
            <option value="emulsion">Emulsion (KES 1,500/20L)</option>
            <option value="weather-guard">Weather-Guard (KES 2,500/20L)</option>
          </select>
          <select
            value={localData.finishingDetails?.plasterType || ""}
            onChange={(e) => handleChange("finishingDetails.plasterType", e.target.value)}
            className="w-full border rounded-lg p-2 text-xs md:text-base dark:bg-background-dark dark:border-gray-700"
          >
            <option value="">Plaster Type</option>
            <option value="gypsum">Gypsum (Smooth, KES 500/bag)</option>
            <option value="lime">Lime (Breathable, KES 400/bag)</option>
            <option value="cement-based">Cement-Based (Durable, KES 600/bag)</option>
          </select>
          {/* <select
            value={localData.finishingDetails?.paintBrand || ""}
            onChange={(e) => handleChange("finishingDetails.paintBrand", e.target.value)}
            className="w-full border rounded-lg p-2 text-xs md:text-base dark:bg-background-dark dark:border-gray-700"
          >
            <option value="">Paint Brand (Optional)</option>
            <option value="Sadolin">Sadolin</option>
            <option value="Dulux">Dulux</option>
            <option value="Crown">Crown</option>
          </select> */}
        </div>
      </AccordionSection>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        {onBack && (
          <button
            onClick={onBack}
            className="bg-gray-300 text-gray-800 text-xs md:text-base px-6 py-2 rounded-lg font-medium hover:bg-gray-400 transition"
          >
            ← Back
          </button>
        )}
        <button
          onClick={handleSubmit}
          // disabled={!isValid()}
          className="bg-blue-600 text-white text-xs md:text-base px-6 py-2 rounded-lg font-medium transition"
        >
          Next →
        </button>
      </div>
    </section>
    
  )
  
}

export default MaterialSelectionStep1