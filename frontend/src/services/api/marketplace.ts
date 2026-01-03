import { apiFetch } from "./client";

export interface MarketplaceItemApi {
  id: number;
  name: string;
  category: string;
  subcategory?: string | null;
  unit: string;
  price: number;
  description?: string | null;
  available: boolean;
  image_url?: string | null; // snake_case (legacy)
  imageUrl?: string | null;  // camelCase (backend currently uses this)
  vendor_id?: number;
  vendorId?: number;
  vendor_name?: string | null;
  vendorName?: string | null;
  vendor_location?: string | null;
  vendorLocation?: string | null;
  vendor_verified?: boolean | null;
  vendorVerified?: boolean | null;
}

export async function fetchMarketplaceItems(): Promise<MarketplaceItemApi[]> {
  return apiFetch<MarketplaceItemApi[]>("/marketplace/items", { method: "GET", auth: false });
}
