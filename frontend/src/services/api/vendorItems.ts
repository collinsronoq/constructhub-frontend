import { apiFetch } from "./client";
// import type { VendorDirectoryItem } from "./types";

export async function fetchVendorItems(vendorId: number) {
  return apiFetch<any[]>(`/vendors/${vendorId}/items`, { method: "GET", auth: false });
}

export async function createVendorItem(vendorId: number, payload: Record<string, any>) {
  return apiFetch<any>(`/vendors/${vendorId}/items`, {
    method: "POST",
    body: payload,
  });
}

export async function updateVendorItem(vendorId: number, itemId: number, payload: Record<string, any>) {
  return apiFetch<any>(`/vendors/${vendorId}/items/${itemId}`, {
    method: "PUT",
    body: payload,
  });
}
