import { apiFetch } from "./client";

export async function uploadTechnicianProfileImage(userId: number, file: File): Promise<{ file_url: string }> {
  const form = new FormData();
  form.append("file", file);
  return apiFetch<{ file_url: string }>(`/technicians/${userId}/upload/profile-image`, {
    method: "POST",
    body: form,
  });
}

export async function uploadTechnicianCertification(
  userId: number,
  file: File,
  certName?: string
): Promise<{ file_url: string; certification_id?: number; message?: string }> {
  const form = new FormData();
  form.append("file", file);
  if (certName) form.append("cert_name", certName);
  return apiFetch<{ file_url: string; certification_id?: number; message?: string }>(
    `/technicians/${userId}/certifications/upload`,
    {
      method: "POST",
      body: form,
    }
  );
}
