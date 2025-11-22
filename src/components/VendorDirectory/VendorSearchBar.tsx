// src/components/VendorDirectory/VendorSearchBar.tsx
import React from "react";

interface VendorSearchBarProps {
  query: string;
  onChange: (value: string) => void;
}

const VendorSearchBar: React.FC<VendorSearchBarProps> = ({ query, onChange }) => {
  return (
    <input
      type="text"
      value={query}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search vendors by name, category or location..."
      className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-900
                 text-gray-700 dark:text-gray-200 focus:outline-none
                 focus:ring-2 focus:ring-blue-500"
    />
  );
};

export default VendorSearchBar;
