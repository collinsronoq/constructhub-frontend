import { useEffect, useState } from "react";

interface Review {
  id: string;
  reviewerName: string;
  reviewerRole: string;
  rating: number;
  date: string;
  review: string;
}

interface Contact {
  phone: string;
  email: string;
}

export interface VendorProfileData {
  id: string;
  name: string;
  categories: string[];
  location: string;
  contact: Contact;
  verified: boolean;
  bannerUrl: string;
  logoUrl: string;
  averageRating: number;
  isVendorView: boolean;
  availability: string;
  reviews: Review[];
}

export function useVendorProfile(vendorId: string) {
  const [vendor, setVendor] = useState<VendorProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call (this will later call /api/vendors/:vendorId)
    async function fetchVendor() {
      try {
        setLoading(true);
        // route that returns vendor data
        const response = await fetch(`/api/vendors/${vendorId}`);
        const data = await response.json();
        setVendor(data);
      } catch (err) {
        setError("Failed to load vendor profile");
      } finally {
        setLoading(false);
      }
    }

    fetchVendor();
  }, [vendorId]);

  return { vendor, loading, error, setVendor };
}
