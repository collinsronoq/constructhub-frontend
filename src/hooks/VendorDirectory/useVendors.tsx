// src/hooks/VendorDirectory/useVendors.ts
import { useEffect, useState } from "react";

export interface Vendor {
  id: string;
  name: string;
  category: string;       // Roofing, Electrical, etc.
  location: string;       // County
  supplierType: string;   // Retail/Wholesale/Distributor
  rating: number;         // 1–5 stars
  verified: boolean;
  shortDescription: string;
}

export const useVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setVendors([
        {
          id: "1",
          name: "Nakuru Hardware Supplies",
          category: "Hardware General",
          location: "Nakuru",
          supplierType: "Retail",
          rating: 4.5,
          verified: true,
          shortDescription: "General hardware and building materials.",
        },
        {
          id: "2",
          name: "RoofTech Kenya",
          category: "Roofing",
          location: "Nairobi",
          supplierType: "Wholesale",
          rating: 4.8,
          verified: true,
          shortDescription: "Roofing sheets, gutters and structural timber.",
        },
        {
          id: "3",
          name: "Bright Electric Solutions",
          category: "Electrical",
          location: "Machakos",
          supplierType: "Distributor",
          rating: 4.2,
          verified: false,
          shortDescription: "Cables, bulbs, sockets and electrical fittings.",
        },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  return { vendors, loading };
};
