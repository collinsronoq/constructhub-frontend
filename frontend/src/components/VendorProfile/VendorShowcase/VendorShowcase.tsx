import React, { useState, useMemo, useEffect } from "react";
import VendorItemCard from "./VendorItemCard";
import type { VendorItemCardProps } from "./VendorItemCard";
import VendorCategoryTabs from "./VendorCategoryTabs";
import VendorSearchBar from "./VendorSearchBar";
import VendorSort from "./VendorSort";
import VendorPagination from "./VendorPagination";
import VendorItemForm from "./VendorItemForm";

interface VendorShowcaseProps {
  initialItems: VendorItemCardProps[];
  isVendorView: boolean;
  onAddItem?: (item: VendorItemCardProps) => Promise<void> | void;
  onEditItem?: (itemId: string | number, item: VendorItemCardProps) => Promise<void> | void;
}

const ITEMS_PER_PAGE = 8;

const VendorShowcase: React.FC<VendorShowcaseProps> = ({ initialItems, isVendorView, onAddItem, onEditItem }) => {
  const [items, setItems] = useState<VendorItemCardProps[]>(initialItems);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("default");
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<VendorItemCardProps | null>(null);

  const categories = ["All", ...Array.from(new Set(items.map((item) => item.category)))];

  const filteredAndSortedItems = useMemo(() => {
    let visibleItems =
      activeCategory === "All"
        ? items
        : items.filter((item) => item.category === activeCategory);

    if (searchQuery.trim()) {
      visibleItems = visibleItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

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

  const totalPages = Math.ceil(filteredAndSortedItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredAndSortedItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery, sortBy]);

  const handleSaveItem = async (newItem: VendorItemCardProps) => {
    if (selectedItem) {
      setItems((prev) => prev.map((item) => (item.id === selectedItem.id ? newItem : item)));
      if (onEditItem) {
        await onEditItem(String(selectedItem.id), newItem);
      }
    } else {
      setItems((prev) => [...prev, newItem]);
      if (onAddItem) {
        await onAddItem(newItem);
      }
    }
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleViewDetails = (item: VendorItemCardProps) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleAddNewItem = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  return (
    <section className="p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm my-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Products & Materials</h2>
        {isVendorView && (
          <button
            onClick={handleAddNewItem}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition self-start md:self-auto"
          >
            + Add New Item
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <VendorSearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <VendorSort sortBy={sortBy} onSortChange={setSortBy} />
      </div>

      <VendorCategoryTabs categories={categories} activeCategory={activeCategory} onSelectCategory={setActiveCategory} />

      {paginatedItems.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {paginatedItems.map((item) => (
            <VendorItemCard key={item.id} {...item} onViewDetails={() => handleViewDetails(item)} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No items match your search or selected filters.</p>
      )}

      {totalPages > 1 && (
        <VendorPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}

      <VendorItemForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveItem} initialData={selectedItem} />
    </section>
  );
};

export default VendorShowcase;
