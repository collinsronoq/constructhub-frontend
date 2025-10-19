import { useState } from "react";
import type { VendorItemCardProps } from "../components/VendorProfile/VendorShowcase/VendorItemCard";

export function useAddVendorItem(vendorId: string, setItems: React.Dispatch<React.SetStateAction<VendorItemCardProps[]>>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItem = async (newItem: Omit<VendorItemCardProps, "id">) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate backend delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Route to update an item
      // const response = await fetch(`/api/vendors/${vendorId}/items`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(newItem),
      // });
      // const createdItem = await response.json();

      // For now we simulate a successful addition
      const createdItem: VendorItemCardProps = {
        id: Date.now().toString(),
        ...newItem,
      };

      // Update local state in VendorShowcase
      setItems((prev) => [...prev, createdItem]);

      return createdItem;
    } catch (err) {
      console.error("Error adding item:", err);
      setError("Failed to add item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { addItem, loading, error };
}
