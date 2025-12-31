export type UserRole = "builder" | "vendor" | "technician" | "admin";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Directory / lightweight models
export interface TechnicianDirectoryItem {
  id: number;
  name: string;
  specialization?: string | null;
  skills?: string[] | null;
  location?: string | null;
  verified: boolean;
  rating: number;
  profile_image_url?: string | null;
}

export interface VendorDirectoryItem {
  id: number;
  name: string;
  category: string;
  location?: string | null;
  contact?: string | null;
  supplierType?: string | null;
  rating: number;
  imageUrl?: string | null;
  verified: boolean;
}
export interface TechnicianProfile {
  id: number;
  user_id: number;
  name: string;
  specialization?: string | null;
  skills?: string[] | null;
  location?: string | null;
  years_experience?: number | null;
  bio?: string | null;
  short_description?: string | null;
  profile_image_url?: string | null;
  contact?: { phone?: string; email?: string } | null;
  verified: boolean;
  availability?: string | null;
  average_rating: number;
}

export interface TechnicianProfileCreate {
  name: string;
  specialization?: string | null;
  skills?: string[] | null;
  location?: string | null;
  years_experience?: number | null;
  bio?: string | null;
  short_description?: string | null;
  profile_image_url?: string | null;
  contact?: { phone?: string; email?: string } | null;
  availability?: string | null;
}

export interface TechnicianProfileUpdate extends Partial<TechnicianProfileCreate> {}

export interface TechnicianCertification {
  id: number;
  technician_id: number;
  title?: string | null;
  issuer?: string | null;
  file_url: string;
  verified: boolean;
  rejected: boolean;
  admin_comment?: string | null;
  uploaded_at?: string | null;
  verified_at?: string | null;
}
