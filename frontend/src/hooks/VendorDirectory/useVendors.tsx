// src/hooks/VendorDirectory/useVendors.ts
import { useEffect, useState } from "react";
import type { VendorCardProps } from "../../components/VendorCard";


export const useVendors = () => {
  const [vendors, setVendors] = useState<VendorCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setVendors([
        {
          id: "1",
          name: "Elite Roofing Solutions",
          category: "Roofing",
          location: "Nakuru",
          contact: "+254 712 345 678",
          supplierType: "Distributor",
          rating: 4.8,
          imageUrl: "src/assets/image_3.jpg",
        },
        {
          id: "2",
          name: "GreenBuild Supplies",
          category: "Construction Materials",
          location: "Nairobi",
          contact: "+254 710 998 443",
          supplierType: "Retail",
          rating: 4.8,
          imageUrl: "src/assets/image_3.jpg",
        },
        {
          id: "3",
          name: "ProTech Electricals",
          category: "Electrical",
          location: "Rafiki",
          contact: "+254 723 111 222",
          supplierType: "Distributor",
          rating: 4.8,
          imageUrl: "src/assets/image_3.jpg",
        },
        {
          id: "4",
          name: "ProTech Finishes",
          category: "Finishes",
          location: "Rafiki",
          contact: "+254 723 111 222",
          supplierType: "Wholesale",
          rating: 4.8,
          imageUrl: "src/assets/image_3.jpg",
        },
        {
          id: "5",
          name: "Rafiki Timber",
          category: "Timber",
          location: "Rafiki",
          contact: "+254 723 111 222",
          supplierType: "Distributor",
          rating: 4.8,
          imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=400&q=80",
        },
        
      ]);
      setLoading(false);
    }, 800);
  }, []);

  return { vendors, loading };
};
