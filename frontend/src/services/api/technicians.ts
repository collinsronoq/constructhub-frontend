import { apiFetch } from "./client";
import type {
  TechnicianProfile,
  TechnicianProfileCreate,
  TechnicianProfileUpdate,
  TechnicianCertification,
} from "./types";

export async function createTechnicianProfile(payload: TechnicianProfileCreate): Promise<TechnicianProfile> {
  return apiFetch<TechnicianProfile>("/technicians/profile", { method: "POST", body: payload });
}

export async function updateTechnicianProfile(payload: TechnicianProfileUpdate): Promise<TechnicianProfile> {
  return apiFetch<TechnicianProfile>("/technicians/profile/edit", { method: "PATCH", body: payload });
}

export async function getTechnicianProfile(userId: number): Promise<TechnicianProfile> {
  return apiFetch<TechnicianProfile>(`/technicians/profile/${userId}`, { method: "GET", auth: false });
}

export async function getMyTechnicianProfile(userId: number): Promise<TechnicianProfile> {
  return apiFetch<TechnicianProfile>("/technicians/me", { method: "GET" });
}

export async function getTechnicianProfileById(profileId: number): Promise<TechnicianProfile> {
  return apiFetch<TechnicianProfile>(`/technicians/profile/by-id/${profileId}`, { method: "GET", auth: false });
}

export async function listMyCertifications(): Promise<TechnicianCertification[]> {
  return apiFetch<TechnicianCertification[]>("/technicians/certifications", { method: "GET" });
}

export async function updateCertification(certId: number, payload: { title?: string; issuer?: string }): Promise<TechnicianCertification> {
  return apiFetch<TechnicianCertification>(`/technicians/certifications/${certId}`, { method: "PATCH", body: payload });
}

export async function deleteCertification(certId: number): Promise<void> {
  return apiFetch<void>(`/technicians/certifications/${certId}`, { method: "DELETE" });
}
