import { apiFetch, setAccessToken } from "./client";
import type { AuthResponse, LoginRequest, RegisterRequest } from "./types";

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const form = new URLSearchParams();
  form.append("username", payload.email);
  form.append("password", payload.password);

  const res = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: form,
    auth: false,
  });

  setAccessToken(res.access_token);
  return res;
}

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: payload,
    auth: false,
  });
  setAccessToken(res.access_token);
  return res;
}

export async function logout(): Promise<void> {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } finally {
    setAccessToken(null);
  }
}

export async function fetchMe() {
  return apiFetch<AuthResponse["user"]>("/auth/me", { method: "GET" });
}
