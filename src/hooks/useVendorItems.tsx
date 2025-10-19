import { useState, useEffect } from "react";
import type { VendorItemCardProps } from "../components/VendorProfile/VendorShowcase/VendorItemCard";

export function useVendorItems(vendorId: string) {
  const [items, setItems] = useState<VendorItemCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Fetch all items */
  async function fetchItems() {
    try {
      setLoading(true);
      const res = await fetch(`/api/vendors/${vendorId}/items`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError("Failed to load items");
    } finally {
      setLoading(false);
    }
  }

  /** Add new item */
  async function addItem(newItem: VendorItemCardProps) {
    try {
      const res = await fetch(`/api/vendors/${vendorId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      const saved = await res.json();
      setItems((prev) => [...prev, saved]);
    } catch (err) {
      setError("Failed to add item");
    }
  }

  /** Update existing item */
  async function updateItem(itemId: string, updated: VendorItemCardProps) {
    try {
      const res = await fetch(`/api/vendors/${vendorId}/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const saved = await res.json();
      setItems((prev) =>
        prev.map((item) => (item.id === saved.id ? saved : item))
      );
    } catch (err) {
      setError("Failed to update item");
    }
  }

  useEffect(() => {
    fetchItems();
  }, [vendorId]);

  return { items, loading, error, fetchItems, addItem, updateItem };
}
