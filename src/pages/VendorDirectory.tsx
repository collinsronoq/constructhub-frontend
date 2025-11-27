// src/pages/VendorDirectory.tsx
import React, { useMemo, useState } from "react";
import VendorSearchBar from "../components/VendorDirectory/VendorSearchBar";
import VendorFilters from "../components/VendorDirectory/VendorFilters";
import VendorCard from "../components/VendorCard";
import { useVendors } from "../hooks/VendorDirectory/useVendors";

const VendorDirectory: React.FC = () => {
  const { vendors, loading } = useVendors();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedSupplierType, setSelectedSupplierType] = useState("All");
  const [sortBy, setSortBy] = useState("Highest Rated");

  const filteredVendors = useMemo(() => {
    let list = vendors;

    // Search
    list = list.filter((v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Category
    if (selectedCategory !== "All") {
      list = list.filter((v) => v.category === selectedCategory);
    }

    // Location
    if (selectedLocation !== "All") {
      list = list.filter((v) => v.location === selectedLocation);
    }

    // Supplier type
    if (selectedSupplierType !== "All") {
      list = list.filter((v) => v.supplierType === selectedSupplierType);
    }

    // Sorting
    if (sortBy === "Highest Rated") {
      list = [...list].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "Alphabetical") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [vendors, searchQuery, selectedCategory, selectedLocation, selectedSupplierType, sortBy]);

  return (
    <section className="p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm my-2 space-y-6">
      
      {/* Header */}
      <div className="bg-background-light dark:bg-background-dark p-6 rounded-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl md:text-4xl font-semibold text-gray-900 dark:text-gray-100">
            Vendor Directory
          </h2>

          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Explore verified vendors supplying construction materials in Kenya.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
          <VendorSearchBar query={searchQuery} onChange={setSearchQuery} />

          <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-lg">
            <VendorFilters
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
              selectedSupplierType={selectedSupplierType}
              onSupplierTypeChange={setSelectedSupplierType}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>
          
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-center text-gray-500 dark:text-gray-400">Loading vendors...</p>
      )}

      {/* Vendor Cards */}
      {!loading && filteredVendors.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredVendors.map((vendor) => (
            <VendorCard key={vendor.id} {...vendor} />
          ))}
        </div>
      ) : (
        !loading && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No vendors found matching your filters.
          </p>
        )
      )}

    </section>
  );
};

export default VendorDirectory;
