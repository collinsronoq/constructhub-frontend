import { apiFetch } from "./client";
import type { EstimationDetail, EstimationListItem, EstimationRequest } from "./estimationTypes";

export async function fetchEstimations(): Promise<EstimationListItem[]> {
  return apiFetch<EstimationListItem[]>("/estimations", { method: "GET" });
}

export async function fetchEstimationById(id: string): Promise<EstimationDetail> {
  return apiFetch<EstimationDetail>(`/estimations/${id}`, { method: "GET" });
}

export async function createEstimation(payload: EstimationRequest): Promise<EstimationDetail> {
  return apiFetch<EstimationDetail>("/estimations/", { method: "POST", body: payload });
}
