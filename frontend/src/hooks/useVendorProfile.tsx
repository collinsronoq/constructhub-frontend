import { useCallback, useEffect, useState } from "react";
import {
  createVendorProfile,
  updateVendorProfile,
  getVendorProfile,
  getVendorProfileById,
} from "../services/api/vendors";
import { uploadVendorBanner, uploadVendorLogo } from "../services/api/vendorUploads";

export interface VendorProfile {
  id: number;
  user_id: number;
  name: string;
  categories: string[];
  location?: string | null;
  supplier_type?: string | null;
  contact?: { phone?: string; email?: string } | null;
  verified: boolean;
  banner_url?: string | null;
  logo_url?: string | null;
  average_rating: number;
  availability?: string | null;
  short_description?: string | null;
}

export interface VendorProfileCreate {
  name: string;
  categories: string[];
  location?: string | null;
  supplier_type?: string | null;
  contact?: { phone?: string; email?: string } | null;
  short_description?: string | null;
  availability?: string | null;
}

export type VendorProfileUpdate = Partial<VendorProfileCreate>;

export function useVendorProfile(userId?: number, vendorProfileId?: number) {
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId && !vendorProfileId) {
      setVendor(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = vendorProfileId
        ? await getVendorProfileById(vendorProfileId)
        : await getVendorProfile(userId as number);
      setVendor(data);
    } catch (err: any) {
      setError("Failed to load vendor profile");
    } finally {
      setLoading(false);
    }
  }, [userId, vendorProfileId]);

  const create = useCallback(async (payload: VendorProfileCreate) => {
    setLoading(true);
    setError(null);
    try {
      const data = await createVendorProfile(payload);
      setVendor(data);
      return data;
    } catch (err: any) {
      setError("Failed to create vendor profile");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (payload: VendorProfileUpdate) => {
    setLoading(true);
    setError(null);
    try {
      const data = await updateVendorProfile(payload);
      setVendor(data);
      return data;
    } catch (err: any) {
      setError("Failed to update vendor profile");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadBanner = useCallback(async (file: File) => {
    if (!userId) return;
    await uploadVendorBanner(userId, file);
    await load();
  }, [userId, load]);

  const uploadLogo = useCallback(async (file: File) => {
    if (!userId) return;
    await uploadVendorLogo(userId, file);
    await load();
  }, [userId, load]);

  useEffect(() => {
    load();
  }, [load]);

  return { vendor, loading, error, refresh: load, createProfile: create, updateProfile: update, uploadBanner, uploadLogo };
}
