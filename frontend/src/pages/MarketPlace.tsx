import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMarketplaceItems } from "../hooks/MarketPlace/useMarketPlaceItems"
import MarketplaceSearchBar from "../components/MarketPlace/MarketplaceSearchBar";
import MarketplaceFilters from "../components/MarketPlace/MarketplaceFilters";
import MarketplaceItemCard from "../components/MarketPlace/MarketplaceItemCard";

const Marketplace: React.FC = () => {
  const navigate = useNavigate();

  /** 🔗 Fetch marketplace data (simulated API + dummy data) */
  const { items, loading, error } = useMarketplaceItems();

  /** 🔍 Search + Filter states */
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("default");

  /** 🧠 Derived items after filtering, searching, and sorting */
  const filteredItems = useMemo(() => {
    let filtered = items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;

      const matchesLocation =
        selectedLocation === "All" || item.vendorLocation === selectedLocation;

      const matchesVerification =
        !showVerifiedOnly || item.vendorVerified === true;

      return matchesSearch && matchesCategory && matchesLocation && matchesVerification;
    });

    // Sorting
    switch (sortBy) {
      case "priceLowHigh":
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case "priceHighLow":
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case "nameAZ":
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "nameZA":
        filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    return filtered;
  }, [items, searchQuery, selectedCategory, selectedLocation, showVerifiedOnly, sortBy]);

  /** 🔎 Navigate to Vendor Profile */
  const handleViewVendor = (vendorId: string) => {
    navigate("/vendor/profile", { state: { id: vendorId } });
  };

  return (
    <section className="p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm my-4 space-y-6">
      <div className="bg-background-light dark:bg-background-dark p-6 rounded-xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Marketplace
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Compare prices and explore verified vendors from Nakuru & Machakos.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <MarketplaceSearchBar query={searchQuery} onChange={setSearchQuery} />
          <MarketplaceFilters
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
            showVerifiedOnly={showVerifiedOnly}
            onVerifiedToggle={setShowVerifiedOnly}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>

      </div>
      
      
      {/* Loading + Error states */}
      {loading && (
        <p className="text-center text-gray-500 dark:text-gray-400">Loading marketplace...</p>
      )}
      {error && (
        <p className="text-center text-red-500">Failed to load marketplace data.</p>
      )}

      {/* Product Grid */}
      {!loading && filteredItems.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredItems.map((item) => (
            <MarketplaceItemCard
              key={item.id}
              {...item}
              onViewVendor={() => handleViewVendor(item.vendorId)}
            />
          ))}
        </div>
      ) : (
        !loading && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No items found matching your filters.
          </p>
        )
      )}
    </section>
  );
};

export default Marketplace;

