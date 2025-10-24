import React, { useState, useMemo } from "react";
import { ChevronDown, Info } from "lucide-react";
import { Tooltip } from  "../Tooltip"// adjust import if needed

interface VendorOption {
  name: string;
  price: number;
}

interface MaterialItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  defaultVendor: string;
  vendors: VendorOption[];
}

interface MaterialCategory {
  category: string;
  items: MaterialItem[];
}

interface SelectedMaterial {
  materialId: string;
  vendor: string;
  price: number;
}

interface MaterialSelectionStepProps {
  materialsData?: MaterialCategory[];
  onMaterialsSelected: (selected: SelectedMaterial[]) => void;
  onBack?: () => void;
}


// Dummy Data (auto-generated)
const dummyMaterials: MaterialCategory[] = [
  {
    category: "Foundation",
    items: [
      {
        id: "mat1",
        name: "Cement (50kg Bag)",
        quantity: 40,
        unit: "bags",
        defaultVendor: "AfriCem",
        vendors: [
          { name: "AfriCem", price: 700 },
          { name: "Savannah Cement", price: 720 },
          { name: "Bamburi Cement", price: 740 },
        ],
      },
      {
        id: "mat2",
        name: "Ballast (Tonne)",
        quantity: 5,
        unit: "tonnes",
        defaultVendor: "Nakuru Aggregates",
        vendors: [
          { name: "Nakuru Aggregates", price: 1500 },
          { name: "Machakos Stones", price: 1600 },
        ],
      },
    ],
  },
  {
    category: "Walling",
    items: [
      {
        id: "mat3",
        name: "Sand (Tonne)",
        quantity: 3,
        unit: "tonnes",
        defaultVendor: "River Sand Ltd",
        vendors: [
          { name: "River Sand Ltd", price: 1800 },
          { name: "Machakos Quarries", price: 1750 },
        ],
      },
      {
        id: "mat4",
        name: "Bricks (Pieces)",
        quantity: 2000,
        unit: "pcs",
        defaultVendor: "BrickWorks Kenya",
        vendors: [
          { name: "BrickWorks Kenya", price: 15 },
          { name: "Mavoko Bricks", price: 14 },
        ],
      },
    ],
  },
  {
    category: "Roofing",
    items: [
      {
        id: "mat5",
        name: "Iron Sheets (pcs)",
        quantity: 50,
        unit: "pcs",
        defaultVendor: "Royal Mabati",
        vendors: [
          { name: "Royal Mabati", price: 1350 },
          { name: "Imarisha Mabati", price: 1400 },
        ],
      },
    ],
  },
];

const MaterialSelectionStep: React.FC<MaterialSelectionStepProps> = ({
  materialsData = dummyMaterials,
  onMaterialsSelected,
  onBack
}) => {
  const [selectedVendors, setSelectedVendors] = useState<Record<string, string>>({});

  // Handle vendor selection
  const handleVendorChange = (materialId: string, vendorName: string) => {
    setSelectedVendors((prev) => ({ ...prev, [materialId]: vendorName }));
  };

  // Compute totals dynamically
  const totalCost = useMemo(() => {
    let total = 0;
    materialsData.forEach((cat) => {
      cat.items.forEach((item) => {
        const vendorName = selectedVendors[item.id] || item.defaultVendor;
        const vendor = item.vendors.find((v) => v.name === vendorName);
        if (vendor) total += vendor.price * item.quantity;
      });
    });
    return total;
  }, [selectedVendors, materialsData]);

  // Trigger parent callback on confirm
  const handleConfirm = () => {
    const selected: SelectedMaterial[] = [];
    materialsData.forEach((cat) => {
      cat.items.forEach((item) => {
        const vendorName = selectedVendors[item.id] || item.defaultVendor;
        const vendor = item.vendors.find((v) => v.name === vendorName);
        if (vendor) {
          selected.push({
            materialId: item.id,
            vendor: vendor.name,
            price: vendor.price * item.quantity,
          });
        }
      });
    });
    onMaterialsSelected(selected);
  };

  return (
    <section className="p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Select Materials & Vendors
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Compare prices and choose your preferred suppliers
        </p>
      </header>

      {/* Accordion for each category */}
      <div className="space-y-4">
        {materialsData.map((cat, index) => (
          <details
            key={index}
            className="border border-gray-200 dark:border-gray-700 rounded-lg"
            open={index === 0}
          >
            <summary className="flex justify-between items-center cursor-pointer p-3 font-medium text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
              {cat.category}
              <ChevronDown className="w-4 h-4" />
            </summary>

            <div className="p-4 space-y-3">
              {cat.items.map((item) => {
                const vendorName = selectedVendors[item.id] || item.defaultVendor;
                const vendor = item.vendors.find((v) => v.name === vendorName);

                return (
                  <div
                    key={item.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-gray-200 dark:border-gray-700 pb-3"
                  >
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        {item.name}
                        <Tooltip>
                          <Info className="w-4 h-4 text-gray-400" />
                          <span className="tooltip-text">Auto-calculated based on project size</span>
                        </Tooltip>
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.quantity} {item.unit}
                      </p>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                      <select
                        value={vendorName}
                        onChange={(e) =>
                          handleVendorChange(item.id, e.target.value)
                        }
                        className="border rounded-md px-3 py-1 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                      >
                        {item.vendors.map((v) => (
                          <option key={v.name} value={v.name}>
                            {v.name} - Ksh {v.price.toLocaleString()}
                          </option>
                        ))}
                      </select>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Total:{" "}
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          Ksh {(vendor ? vendor.price * item.quantity : 0).toLocaleString()}
                        </span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </details>
        ))}
      </div>

      {/* Footer with total summary */}
      <footer className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              ← Back
            </button>
          )}

          <button
            onClick={handleConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
          >
            Confirm Selection
          </button>
        </div>

        <p className="text-gray-700 dark:text-gray-300 font-medium">
          Total Estimated Cost:{" "}
          <span className="text-blue-600 dark:text-blue-400">
            Ksh {totalCost.toLocaleString()}
          </span>
        </p>
      </footer>

    </section>
  );
};

export default MaterialSelectionStep;
