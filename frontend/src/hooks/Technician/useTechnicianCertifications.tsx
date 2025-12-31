import { useCallback, useEffect, useState } from "react";
import {
  listMyCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
} from "../../services/api/technicians";
import { uploadTechnicianCertification } from "../../services/api/technicianUploads";
import type { TechnicianCertification } from "../../services/api/types";

export function useTechnicianCertifications(userId?: number) {
  const [certs, setCerts] = useState<TechnicianCertification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
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
  }, []);

  const add = useCallback(
    async (options: { file?: File; title?: string; issuer?: string; fileUrl?: string }) => {
      setLoading(true);
      setError(null);
      try {
        let file_url = options.fileUrl;
        if (!file_url && options.file && userId) {
          const uploadRes = await uploadTechnicianCertification(userId, options.file, options.title);
          file_url = uploadRes.file_url;
        }
        if (!file_url) {
          throw new Error("Missing file");
        }
        const created = await createCertification({
          title: options.title || options.file?.name || "Certification",
          issuer: options.issuer,
          file_url,
        });
        setCerts((prev) => [...prev, created]);
        return created;
      } catch (err: any) {
        setError("Failed to add certification");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId]
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
