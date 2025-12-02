// src/components/Articles/ArticleFilters.tsx
import React from "react";
import type { ArticleCategory } from "../../hooks/Articles/useArticles";

interface Props {
  category: string;
  onCategoryChange: (v: string) => void;
  sortBy: string;
  onSortChange: (v: string) => void;
}

const categories: ArticleCategory[] = [
  "Construction Basics",
  "Cost Saving Tips",
  "Materials Guide",
  "Permits & Regulations",
  "Roofing",
  "Plumbing",
  "Electrical",
  "Foundation & Structural Work",
  "Finishing & Interior",
  "House Design",
  "Site Preparation",
];

const ArticleFilters: React.FC<Props> = ({ category, onCategoryChange, sortBy, onSortChange }) => {
  const sorts = ["Most Recent", "Most Popular", "Alphabetical"];
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <select value={category} onChange={(e) => onCategoryChange(e.target.value)} className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-900">
        <option value="All">All Categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select value={sortBy} onChange={(e) => onSortChange(e.target.value)} className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-900">
        {sorts.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ArticleFilters;
