import React from "react";

export interface VendorCategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

const VendorCategoryTabs: React.FC<VendorCategoryTabsProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
}) => {
  // Include "All" by default
  const allCategories = [...categories];

  return (
    <div className="flex overflow-x-auto gap-3 mb-6 pb-2 md:pb-4 scrollbar-hide border-b border-slate-200 dark:border-slate-200/10">
      {allCategories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`whitespace-nowrap px-4 py-2 text-xs md:text-base font-medium rounded-full transition-all duration-200 
            ${
              activeCategory === category
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default VendorCategoryTabs;
