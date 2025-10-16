

import React, { useState, useMemo } from "react";
import VendorItemCard from "./VendorItemCard";
import VendorCategoryTabs from "./VendorCategoryTabs";
import VendorSearchBar from "./VendorSearchBar";
import VendorSort from "./VendorSort";
import VendorPagination from "./VendorPagination";
import type { VendorItemCardProps } from "./VendorItemCard";

interface VendorShowcaseProps {
  items: VendorItemCardProps[];
}

const ITEMS_PER_PAGE = 8; // You can tweak this later

const VendorShowcase: React.FC<VendorShowcaseProps> = ({ items }) => {
  // Categories setup
  const categories = ["All", ...Array.from(new Set(items.map((item) => item.category)))];
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Search and sort states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("default");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filtering + Sorting Logic
  const filteredAndSortedItems = useMemo(() => {
    // 1️⃣ Filter by category
    let visibleItems =
      activeCategory === "All"
        ? items
        : items.filter((item) => item.category === activeCategory);

    // 2️⃣ Filter by search
    if (searchQuery.trim()) {
      visibleItems = visibleItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 3️⃣ Sort items
    visibleItems = [...visibleItems].sort((a, b) => {
      switch (sortBy) {
        case "priceLowHigh":
          return a.price - b.price;
        case "priceHighLow":
          return b.price - a.price;
        case "availability":
          return a.available === b.available ? 0 : a.available ? -1 : 1;
        case "nameAZ":
          return a.name.localeCompare(b.name);
        case "nameZA":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return visibleItems;
  }, [items, activeCategory, searchQuery, sortBy]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredAndSortedItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredAndSortedItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery, sortBy]);

  return (
    <section className="p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm my-8">
      {/* Title */}
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Products & Materials
      </h2>

      {/* Search + Sort Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <VendorSearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <VendorSort sortBy={sortBy} onSortChange={setSortBy} />
      </div>

      {/* Category Tabs */}
      <VendorCategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      {/* Item Grid */}
      {paginatedItems.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {paginatedItems.map((item) => (
            <VendorItemCard key={item.id} {...item} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No items match your search or selected filters.
        </p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <VendorPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </section>
  );
};

export default VendorShowcase;
