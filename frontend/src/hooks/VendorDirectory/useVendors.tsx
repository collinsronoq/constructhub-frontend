// src/hooks/VendorDirectory/useVendors.ts
import { useEffect, useState } from "react";
import type { VendorCardProps } from "../../components/VendorCard";
import { fetchVendorDirectory } from "../../services/api/vendors";

export const useVendors = () => {
  const [vendors, setVendors] = useState<VendorCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchVendorDirectory();
        setVendors(
          data.map((v) => ({
            id: String(v.id),
            name: v.name,
            category: v.category,
            location: v.location || "",
            contact: v.contact || "",
            supplierType: v.supplierType || "",
            rating: v.rating || 0,
            imageUrl: v.imageUrl || "",
            verified: v.verified,
          }))
        );
      } catch (err) {
        console.error("Failed to load vendors", err);
        setError("Failed to load vendors");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { vendors, loading, error };
};
