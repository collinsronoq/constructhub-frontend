import React from "react";

interface VendorSortProps {
  sortBy: string;
  onSortChange: (sortKey: string) => void;
}

const VendorSort: React.FC<VendorSortProps> = ({ sortBy, onSortChange }) => {
  return (
    <div className="w-full md:w-auto mb-4 md:mb-0">
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="w-full md:w-48 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-xs md:text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="default">Sort By: Default</option>
        <option value="priceLowHigh">Price: Low → High</option>
        <option value="priceHighLow">Price: High → Low</option>
        <option value="availability">Availability</option>
        <option value="nameAZ">Name: A → Z</option>
        <option value="nameZA">Name: Z → A</option>
      </select>
    </div>
  );
};

export default VendorSort;
