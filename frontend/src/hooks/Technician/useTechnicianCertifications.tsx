import { useCallback, useEffect, useState } from "react";
import { listMyCertifications, updateCertification, deleteCertification } from "../../services/api/technicians";
import { uploadTechnicianCertification } from "../../services/api/technicianUploads";
import type { TechnicianCertification } from "../../services/api/types";

export function useTechnicianCertifications(userId?: number) {
  const [certs, setCerts] = useState<TechnicianCertification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setCerts([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await listMyCertifications();
      setCerts(data);
    } catch (err: any) {
      setError("Failed to load certifications");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const add = useCallback(
    async (options: { file?: File; title?: string; issuer?: string; fileUrl?: string }) => {
      setLoading(true);
      setError(null);
      try {
        if (options.file && userId) {
          await uploadTechnicianCertification(userId, options.file, options.title);
        } else if (!options.fileUrl) {
          throw new Error("Missing file");
        }
        // Refresh list to reflect new upload (upload route already creates DB row)
        await load();
      } catch (err: any) {
        setError("Failed to add certification");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [load, userId]
  );

  const edit = useCallback(async (certId: number, payload: { title?: string; issuer?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateCertification(certId, payload);
      setCerts((prev) => prev.map((c) => (c.id === certId ? updated : c)));
      return updated;
    } catch (err: any) {
      setError("Failed to update certification");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (certId: number) => {
    setLoading(true);
    setError(null);
    try {
      await deleteCertification(certId);
      setCerts((prev) => prev.filter((c) => c.id !== certId));
    } catch (err: any) {
      setError("Failed to delete certification");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { certs, loading, error, refresh: load, addCertification: add, updateCertification: edit, deleteCertification: remove };
}
