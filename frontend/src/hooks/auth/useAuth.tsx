import { useCallback, useEffect, useMemo, useState } from "react";
import { login, register, logout, fetchMe } from "../../services/api/auth";
import type { AuthResponse, LoginRequest, RegisterRequest, User } from "../../services/api/types";
import { getAccessToken, setAccessToken } from "../../services/api/client";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: getAccessToken(),
    loading: false,
    error: null,
  });

  // hydrate user if token exists
  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    setState((s) => ({ ...s, loading: true }));
    fetchMe()
      .then((user) => setState({ user, token, loading: false, error: null }))
      .catch((err) => {
        console.error("Failed to hydrate user", err);
        setAccessToken(null);
        setState({ user: null, token: null, loading: false, error: null });
      });
  }, []);

  const handleLogin = useCallback(async (payload: LoginRequest) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await login(payload);
      setState({ user: res.user, token: res.access_token, loading: false, error: null });
      return res;
    } catch (err: any) {
      const message = err?.detail?.detail || err?.detail || "Login failed";
      setState((s) => ({ ...s, loading: false, error: message }));
      throw err;
    }
  }, []);

  const handleRegister = useCallback(async (payload: RegisterRequest) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await register(payload);
      setState({ user: res.user, token: res.access_token, loading: false, error: null });
      return res;
    } catch (err: any) {
      const message = err?.detail?.detail || err?.detail || "Registration failed";
      setState((s) => ({ ...s, loading: false, error: message }));
      throw err;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setState({ user: null, token: null, loading: false, error: null });
  }, []);

  return useMemo(
    () => ({
      ...state,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
    }),
    [state, handleLogin, handleRegister, handleLogout]
  );
}
