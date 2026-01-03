import { useState } from "react";
import type { TechnicianVerificationPayload } from "../../components/TechnicianProfile/TechnicianVerificationModal";
import { uploadTechnicianCertification } from "../../services/api/technicianUploads";

/**
 * Hook responsible for submitting technician verification data.
 * Uploads certification files and creates pending certifications for admin review.
 */
export function useVerifyTechnician() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function verifyTechnician(payload: TechnicianVerificationPayload) {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const userId = Number(payload.technicianId);
      if (!userId) throw new Error("Missing technician id");

      for (const cert of payload.certifications) {
        if (!cert.file) continue;
        await uploadTechnicianCertification(userId, cert.file, cert.name);
      }

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Failed to submit verification. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return { verifyTechnician, loading, success, error };
}
