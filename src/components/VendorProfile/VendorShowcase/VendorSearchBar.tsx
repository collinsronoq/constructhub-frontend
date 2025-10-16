import React from "react";
import { Search } from "lucide-react";


interface VendorSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const VendorSearchBar: React.FC<VendorSearchBarProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  return (
    
      <div className="w-full mb-6 flex justify-start items-center gap-x-3">
        <Search className="w-4 h-4 md:w-6 md:h-6" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search items by name or category..."
          className="w-3/4 md:w-1/3 p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100 text-xs md:text-sm bg-white dark:bg-gray-900"
        />
      </div>

    
    
  );
};

export default VendorSearchBar;
