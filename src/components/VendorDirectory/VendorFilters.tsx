// src/components/VendorDirectory/VendorFilters.tsx
import React from "react";

interface VendorFiltersProps {
  selectedCategory: string;
  onCategoryChange: (value: string) => void;

  selectedLocation: string;
  onLocationChange: (value: string) => void;

  selectedSupplierType: string;
  onSupplierTypeChange: (value: string) => void;

  sortBy: string;
  onSortChange: (value: string) => void;
}

const VendorFilters: React.FC<VendorFiltersProps> = ({
  selectedCategory,
  onCategoryChange,

  selectedLocation,
  onLocationChange,

  selectedSupplierType,
  onSupplierTypeChange,

  sortBy,
  onSortChange,
}) => {
  const categories = [
    "All",
    "Cement & Aggregates",
    "Timber",
    "Roofing",
    "Plumbing",
    "Electrical",
    "Finishes",
    "Steel",
    "Hardware General",
  ];

  const supplierTypes = ["All", "Retail", "Wholesale", "Distributor"];

  const locations = ["All", "Nakuru", "Nairobi", "Machakos", "Kiambu"];

  const sortingOptions = ["Highest Rated", "Alphabetical"];

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Category */}
      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-900"
      >
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {/* Location */}
      <select
        value={selectedLocation}
        onChange={(e) => onLocationChange(e.target.value)}
        className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-900"
      >
        {locations.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>

      {/* Supplier Type */}
      <select
        value={selectedSupplierType}
        onChange={(e) => onSupplierTypeChange(e.target.value)}
        className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-900"
      >
        {supplierTypes.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      {/* Sorting */}
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-900"
      >
        {sortingOptions.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
};

export default VendorFilters;
