import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMarketplaceItems } from "../hooks/MarketPlace/useMarketPlaceItems";
import MarketplaceSearchBar from "../components/MarketPlace/MarketplaceSearchBar";
import MarketplaceFilters from "../components/MarketPlace/MarketplaceFilters";
import MarketplaceItemCard from "../components/MarketPlace/MarketplaceItemCard";

const Marketplace: React.FC = () => {
  const navigate = useNavigate();
  const { items, loading, error } = useMarketplaceItems();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("default");

  const filteredItems = useMemo(() => {
    let filtered = items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;

      const matchesLocation =
        selectedLocation === "All" || (item.vendor_location || "") === selectedLocation;

      const matchesVerification =
        !showVerifiedOnly || item.vendor_verified === true;

      return matchesSearch && matchesCategory && matchesLocation && matchesVerification;
    });

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

  const handleViewVendor = (vendorId: string) => {
    navigate("/vendor/profile", { state: { id: vendorId } });
  };

  return (
    <section className="p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm my-4 space-y-6">
      <div className="bg-background-light dark:bg-background-dark p-6 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Marketplace</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Compare prices and explore verified vendors.
          </p>
        </div>

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

      {loading && <p className="text-center text-gray-500 dark:text-gray-400">Loading marketplace...</p>}
      {error && <p className="text-center text-red-500">Failed to load marketplace data.</p>}

      {!loading && filteredItems.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredItems.map((item) => (
            <MarketplaceItemCard
              key={item.id}
              id={String(item.id)}
              name={item.name}
              category={item.category}
              price={item.price}
              unit={item.unit}
              imageUrl={(item as any).imageUrl || (item as any).image_url || ""}
              available={item.available}
              vendorId={item.vendorId ? String(item.vendorId) : item.vendor_id ? String(item.vendor_id) : undefined}
              vendorName={(item as any).vendorName || (item as any).vendor_name || "Vendor"}
              vendorLocation={(item as any).vendorLocation || (item as any).vendor_location || ""}
              vendorVerified={(item as any).vendorVerified ?? (item as any).vendor_verified ?? false}
              onViewVendor={() => {
                const vid = item.vendorId ?? item.vendor_id;
                if (vid) handleViewVendor(String(vid));
              }}
            />
          ))}
        </div>
      ) : (
        !loading && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">No items found matching your filters.</p>
        )
      )}
    </section>
  );
};

export default Marketplace;
