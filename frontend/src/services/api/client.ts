const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
  auth?: boolean;
}

const TOKEN_KEY = "constructhub_access_token";
let inMemoryToken: string | null = null;

export function setAccessToken(token: string | null) {
  inMemoryToken = token;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getAccessToken(): string | null {
  if (inMemoryToken) return inMemoryToken;
  const stored = localStorage.getItem(TOKEN_KEY);
  if (stored) inMemoryToken = stored;
  return inMemoryToken;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {}, auth = true } = options;

  const url = `${API_BASE_URL}${path}`;

  const init: RequestInit = { method, headers: { ...headers } };

  // Attach auth header if needed
  if (auth) {
    const token = getAccessToken();
    if (token) {
      (init.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
  }

  // Handle body encoding
  if (body !== undefined && body !== null) {
    if (body instanceof FormData) {
      init.body = body;
    } else if (body instanceof URLSearchParams) {
      init.body = body;
      (init.headers as Record<string, string>)["Content-Type"] = "application/x-www-form-urlencoded";
    } else {
      init.body = JSON.stringify(body);
      (init.headers as Record<string, string>)["Content-Type"] = "application/json";
    }
  }

  const res = await fetch(url, init);
  if (!res.ok) {
    let detail: any;
    try {
      detail = await res.json();
    } catch (e) {
      detail = await res.text();
    }
    const error = new Error("API error") as Error & { status?: number; detail?: any };
    error.status = res.status;
    error.detail = detail;

    // If unauthorized/expired, clear token and redirect to login.
    // Do not log out on 403; that can be a valid role/permission response.
    if (auth && res.status === 401) {
      const path = window.location.pathname;
      const onAuthPage = path.startsWith("/login") || path.startsWith("/signup");
      setAccessToken(null);
      if (!onAuthPage) {
        // Use replace to avoid back navigation to protected pages
        window.location.replace("/login");
      }
    }

    throw error;
  }

  if (res.status === 204) {
    // No content
    return undefined as T;
  }

  const data = (await res.json()) as T;
  return data;
}

export { API_BASE_URL };
