import { useEffect, useState } from "react";
import type { VendorItemCardProps } from "../components/VendorProfile/VendorShowcase/VendorItemCard";


// would be fetching items that a vendor has using the vendor id.

export function useVendorItems(vendorId: string) {
  const [items, setItems] = useState<VendorItemCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching vendor’s products
    async function fetchItems() {
      try {
        setLoading(true);
        // Replace with backend later:
        const response = await fetch(`/api/vendors/${vendorId}/items`);
        const data = await response.json();
        setItems(data);
      } catch (err) {
        setError("Failed to load items");
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, [vendorId]);

  // Hook returns items + updater so we can add/edit/delete later
  return { items, setItems, loading, error };
}
