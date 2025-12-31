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
  image_url?: string | null;
  vendor_id: number;
  vendor_name?: string | null;
  vendor_location?: string | null;
  vendor_verified?: boolean | null;
}

export async function fetchMarketplaceItems(): Promise<MarketplaceItemApi[]> {
  return apiFetch<MarketplaceItemApi[]>("/marketplace/items", { method: "GET", auth: false });
}
