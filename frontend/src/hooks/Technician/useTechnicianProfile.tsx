import { useCallback, useEffect, useState } from "react";
import {
  createTechnicianProfile,
  updateTechnicianProfile,
  getTechnicianProfile,
} from "../../services/api/technicians";
import type { TechnicianProfile, TechnicianProfileCreate, TechnicianProfileUpdate } from "../../services/api/types";

export function useTechnicianProfile(userId?: number) {
  const [profile, setProfile] = useState<TechnicianProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getTechnicianProfile(userId);
      setProfile(data);
    } catch (err: any) {
      setError(err?.detail?.detail || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const create = useCallback(async (payload: TechnicianProfileCreate) => {
    setLoading(true);
    setError(null);
    try {
      const data = await createTechnicianProfile(payload);
      setProfile(data);
      return data;
    } catch (err: any) {
      const msg = err?.detail?.detail || "Failed to create profile";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (payload: TechnicianProfileUpdate) => {
    setLoading(true);
    setError(null);
    try {
      const data = await updateTechnicianProfile(payload);
      setProfile(data);
      return data;
    } catch (err: any) {
      const msg = err?.detail?.detail || "Failed to update profile";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { profile, loading, error, refresh: load, createProfile: create, updateProfile: update };
}
