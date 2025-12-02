import React from "react";
import { Search } from "lucide-react";

interface MarketplaceSearchBarProps {
  query: string;
  onChange: (value: string) => void;
}

const MarketplaceSearchBar: React.FC<MarketplaceSearchBarProps> = ({ query, onChange }) => {
  return (
    <div className="flex items-center w-full md:w-1/3 bg-surface-light dark:bg-surface-dark border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm px-3 py-2">
      <input
        type="text"
        placeholder="Search materials or vendors..."
        value={query}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-gray-800 dark:text-gray-200 outline-none placeholder-gray-400 text-xs md:text-base"
      />
      <div className="min-h-full flex items-center ">
        <Search className="text-gray-400 dark:text-gray-500" />
      </div>
      
    </div>
  );
};

export default MarketplaceSearchBar;
