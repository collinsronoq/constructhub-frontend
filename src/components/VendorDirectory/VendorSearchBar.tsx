import React from "react";
import { Search } from "lucide-react";

interface VendorSearchBarProps {
  query: string;
  onChange: (value: string) => void;
}

const VendorSearchBar: React.FC<VendorSearchBarProps> = ({ query, onChange }) => {
  return (
    <div className="relative w-full md:w-3/4">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
      <input
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search vendors by name, category or location..."
        className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default VendorSearchBar;
