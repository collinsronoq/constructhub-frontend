import { useState } from "react";
import type { TechnicianVerificationPayload } from "../../components/TechnicianProfile/TechnicianVerificationModal";

/**
 * Hook responsible for submitting technician verification data.
 * Currently simulates backend behavior but structured for real API integration.
 */
export function useVerifyTechnician() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Submit verification request */
  async function verifyTechnician(payload: TechnicianVerificationPayload) {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // --- Simulated delay for API request ---
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // --- Mock API behavior ---
      // Replace this with real backend call later
      console.log("✅ Submitting verification payload:", payload);

      // Example backend call (to be uncommented when backend is ready)
      /*
      const response = await fetch(`/api/technicians/${payload.technicianId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to verify technician");
      }
      */

      // --- Mock success response ---
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

