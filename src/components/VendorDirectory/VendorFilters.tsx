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
      <div className="flex flex-col w-full md:w-1/3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category
        </label>
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
      </div>

      {/* Location */}
      <div className="flex flex-col w-full md:w-1/3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Location
        </label>
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
      </div>

      {/* Supplier Type */}
      <div className="flex flex-col w-full md:w-1/3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Supplier type
        </label>
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
      </div>

      {/* Sorting */}
      <div className="flex flex-col w-full md:w-1/3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Rating
        </label>
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
    </div>
  );
};

export default VendorFilters;
