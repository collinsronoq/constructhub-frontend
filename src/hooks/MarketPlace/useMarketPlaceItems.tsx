import { useEffect, useState } from "react";


export interface MarketplaceItem {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  description: string;
  available: boolean;
  imageUrl: string;
  vendorId: string;
  vendorName: string;
  vendorLocation: string;
  vendorVerified: boolean;
}

export function useMarketplaceItems() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulated fetch
  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      try {
        // Simulated delay (like calling an API)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Dummy data
        const dummyData: MarketplaceItem[] = [
          {
            id: "item_001",
            name: "Cement (50kg)",
            category: "Building Materials",
            price: 750,
            unit: "per bag",
            available: true,
            description: "High-strength cement suitable for all construction works.",
            imageUrl: "src/assets/image_5.jpg",
            vendorId: "vendor_001",
            vendorName: "Nakuru Hardware",
            vendorLocation: "Nakuru",
            vendorVerified: true,
          },
          {
            id: "item_002",
            name: "Steel Rod 12mm",
            category: "Steel & Metal",
            price: 1450,
            unit: "per piece",
            available: true,
            description: "Durable steel rods ideal for reinforced concrete structures.",
            imageUrl: "src/assets/image_5.jpg",
            vendorId: "vendor_002",
            vendorName: "Machakos Builders Supply",
            vendorLocation: "Machakos",
            vendorVerified: false,
          },
          {
            id: "item_003",
            name: "Paint (20L White)",
            category: "Paint & Finishes",
            price: 4200,
            unit: "per bucket",
            available: true,
            description: "Premium quality white paint with smooth finish and durability.",
            imageUrl: "src/assets/image_5.jpg",
            vendorId: "vendor_003",
            vendorName: "Makutano Paints",
            vendorLocation: "Nakuru",
            vendorVerified: true,
          },
          {
            id: "item_004",
            name: "PVC Pipes 2 inch",
            category: "Plumbing",
            price: 230,
            unit: "per meter",
            available: false,
            description: "Reliable PVC pipes suitable for residential and commercial use.",
            imageUrl: "https://via.placeholder.com/200x150?text=PVC+Pipes",
            vendorId: "vendor_004",
            vendorName: "Machakos Plumbing Hub",
            vendorLocation: "Machakos",
            vendorVerified: false,
          },
        ];

        setItems(dummyData);
      } catch (err) {
        setError("Failed to load marketplace items");
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  return { items, loading, error };
}
