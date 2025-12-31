import { apiFetch } from "./client";

export async function uploadVendorBanner(userId: number, file: File): Promise<{ file_url: string }> {
  const form = new FormData();
  form.append("file", file);
  return apiFetch<{ file_url: string }>(`/vendors/${userId}/upload/banner`, {
    method: "POST",
    body: form,
  });
}

export async function uploadVendorLogo(userId: number, file: File): Promise<{ file_url: string }> {
  const form = new FormData();
  form.append("file", file);
  return apiFetch<{ file_url: string }>(`/vendors/${userId}/upload/logo`, {
    method: "POST",
    body: form,
  });
}
