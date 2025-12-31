import { apiFetch } from "./client";
import type { TechnicianDirectoryItem, VendorDirectoryItem } from "./types";

export async function fetchTechnicianDirectory(): Promise<TechnicianDirectoryItem[]> {
  return apiFetch<TechnicianDirectoryItem[]>("/technicians/directory", { method: "GET", auth: false });
}

export async function fetchVendorDirectory(): Promise<VendorDirectoryItem[]> {
  return apiFetch<VendorDirectoryItem[]>("/vendors/directory", { method: "GET", auth: false });
}
