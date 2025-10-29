import { ChevronDown, ChevronUp } from "lucide-react";
import type React from "react";
import { useState } from "react";



interface MaterialSelectionProps {
  initialData: {
    finishing?: 'economy' | 'standard' | 'premium';
    roofingpreference?: 'Iron Sheets' | 'Clay Tiles' | 'Stone Coated';
    roofStyle?: 'pitched' | 'flat';
  }
  

}


const MaterialSelectionStep: React.FC<MaterialSelectionProps> = ({
  initialData,
  onNext,
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
      <AccordionSection title="Roofing Preference" id="roofing">
        {/* move this to the material sections */}
        {localData.roofStyle === 'pitched' && (
          <div>
            <label>Material</label>
            <select onChange={(e) => handleChange("roofing.material", e.target.value)}>
              <option>Iron Sheets (Mabati)</option>
              <option>Clay Tiles</option>
              <option>Stone-Coated</option>
            </select>
          </div>
        )}
        {localData.roofStyle === 'flat' && (
          <div>
            <label>Waterproofing Type</label>
            <select onChange={(e) => handleChange("roofing.waterproofing", e.target.value)}>
              <option>Bitumen Membrane</option>
              <option>Concrete Slab with Sealant</option>
            </select>
          </div>
        )}
      </AccordionSection>
    </section>
    
  )
  
}