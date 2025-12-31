import { useEffect, useState } from "react";
import { fetchMarketplaceItems } from "../../services/api/marketplace";
import type { MarketplaceItemApi } from "../../services/api/marketplace";

export function useMarketplaceItems() {
  const [items, setItems] = useState<MarketplaceItemApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMarketplaceItems();
        setItems(data);
      } catch (err) {
        console.error("Failed to load marketplace items", err);
        setError("Failed to load marketplace items");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { items, loading, error };
}
