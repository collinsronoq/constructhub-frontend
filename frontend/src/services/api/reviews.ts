import { apiFetch } from "./client";
// import type { ReviewCardProps } from "";


export interface ReviewCardProps {
  id: string
  reviewerName: string
  reviewerRole?: string
  rating: number
  date: string
  review: string
}

export async function fetchVendorReviews(vendorId: number): Promise<ReviewCardProps[]> {
  return apiFetch<ReviewCardProps[]>(`/reviews/vendors/${vendorId}`, { method: "GET", auth: false });
}

export async function fetchTechnicianReviews(userId: number): Promise<ReviewCardProps[]> {
  return apiFetch<ReviewCardProps[]>(`/reviews/technicians/${userId}`, { method: "GET", auth: false });
}

export async function createVendorReview(vendorId: number, payload: { rating: number; review: string }): Promise<ReviewCardProps> {
  return apiFetch<ReviewCardProps>(`/reviews/vendors/${vendorId}`, { method: "POST", body: payload });
}

export async function createTechnicianReview(userId: number, payload: { rating: number; review: string }): Promise<ReviewCardProps> {
  return apiFetch<ReviewCardProps>(`/reviews/technicians/${userId}`, { method: "POST", body: payload });
}
