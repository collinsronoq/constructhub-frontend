import { useEffect, useState } from "react";
import { fetchVendorItems, createVendorItem, updateVendorItem } from "../services/api/vendorItems";

export interface VendorItem {
  id: number;
  name: string;
  category: string;
  subcategory?: string | null;
  unit: string;
  price: number;
  description?: string | null;
  available: boolean;
  image_url?: string | null;
}

export function useVendorItems(vendorId: number) {
  const [items, setItems] = useState<VendorItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function loadItems() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchVendorItems(vendorId);
      setItems(data as VendorItem[]);
    } catch (err) {
      console.error("Failed to load vendor items", err);
      setError("Failed to load items");
    } finally {
      setLoading(false);
    }
  }

  async function addItem(payload: Omit<VendorItem, "id">) {
    try {
      const created = await createVendorItem(vendorId, payload);
      setItems((prev) => [...prev, created as VendorItem]);
      return created as VendorItem;
    } catch (err) {
      console.error("Failed to add item", err);
      setError("Failed to add item");
      throw err;
    }
  }

  async function editItem(itemId: number, payload: Partial<VendorItem>) {
    try {
      const updated = await updateVendorItem(vendorId, itemId, payload);
      setItems((prev) => prev.map((it) => (it.id === itemId ? (updated as VendorItem) : it)));
      return updated as VendorItem;
    } catch (err) {
      console.error("Failed to update item", err);
      setError("Failed to update item");
      throw err;
    }
  }

  useEffect(() => {
    loadItems();
  }, [vendorId]);

  return { items, loading, error, refresh: loadItems, addItem, editItem };
}
