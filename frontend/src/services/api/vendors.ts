import { apiFetch } from "./client";
import type { VendorDirectoryItem } from "./types";

export interface VendorProfileApi {
  id: number;
  user_id: number;
  name: string;
  categories: string[];
  location?: string | null;
  supplier_type?: string | null;
  contact?: { phone?: string; email?: string } | null;
  verified: boolean;
  banner_url?: string | null;
  logo_url?: string | null;
  average_rating: number;
  availability?: string | null;
  short_description?: string | null;
}

export interface VendorProfileCreate {
  name: string;
  categories: string[];
  location?: string | null;
  supplier_type?: string | null;
  contact?: { phone?: string; email?: string } | null;
  short_description?: string | null;
  availability?: string | null;
  banner_url?: string | null;
  logo_url?: string | null;
}

export type VendorProfileUpdate = Partial<VendorProfileCreate>;

export async function createVendorProfile(payload: VendorProfileCreate): Promise<VendorProfileApi> {
  return apiFetch<VendorProfileApi>("/vendors/profile", { method: "POST", body: payload });
}

export async function updateVendorProfile(payload: VendorProfileUpdate): Promise<VendorProfileApi> {
  return apiFetch<VendorProfileApi>("/vendors/profile", { method: "PUT", body: payload });
}

export async function getVendorProfile(userId: number): Promise<VendorProfileApi> {
  return apiFetch<VendorProfileApi>(`/vendors/profile/${userId}`, { method: "GET", auth: false });
}

export async function fetchVendorDirectory(): Promise<VendorDirectoryItem[]> {
  return apiFetch<VendorDirectoryItem[]>("/vendors/directory", { method: "GET", auth: false });
}
