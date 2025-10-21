import React from "react";

interface MarketplaceFiltersProps {
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedLocation: string;
  onLocationChange: (value: string) => void;
  showVerifiedOnly: boolean;
  onVerifiedToggle: (value: boolean) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

const MarketplaceFilters: React.FC<MarketplaceFiltersProps> = ({
  selectedCategory,
  onCategoryChange,
  selectedLocation,
  onLocationChange,
  showVerifiedOnly,
  onVerifiedToggle,
  sortBy,
  onSortChange,
}) => {
  const categories = ["All", "Building Materials", "Roofing", "Electrical", "Paints"];
  const locations = ["All", "Nakuru", "Machakos"];
  const sortOptions = [
    { value: "default", label: "Default" },
    { value: "priceLowHigh", label: "Price: Low → High" },
    { value: "priceHighLow", label: "Price: High → Low" },
    { value: "nameAZ", label: "Name: A → Z" },
    { value: "nameZA", label: "Name: Z → A" },
  ];

  return (
    <div className="flex flex-wrap gap-3 sm:gap-6 md:gap-8 items-center bg-surface-light dark:bg-surface-dark p-4 rounded-xl justify-start">
      {/* Category */}
      <div className="flex flex-col text-xs md:text-base space-y-2">
        <h4>Category</h4>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      

      {/* Location */}
      <div className="flex flex-col text-xs md:text-base space-y-2">
        <h4>location</h4>
        <select
          value={selectedLocation}
          onChange={(e) => onLocationChange(e.target.value)}
          className="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200"
        >
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>
      

      {/* Verified Only Toggle */}
      <label className="flex gap-2 text-sm md:text-base text-gray-700 dark:text-gray-300 cursor-pointer">
        <input
          type="checkbox"
          checked={showVerifiedOnly}
          onChange={(e) => onVerifiedToggle(e.target.checked)}
          className="accent-blue-600"
        />
        Verified Vendors Only
      </label>

      {/* Sort */}
      <div className="flex flex-col text-xs md:text-base space-y-2">
        <h4>Sort by</h4>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
    </div>
  );
};

export default MarketplaceFilters;
