import { useState } from "react";
import type { ChangeEvent } from "react";
import { useVerifyTechnician } from "../../hooks/Technician/useVerifyTechnician";

interface CertificationInput {
  name: string;
  file?: File;
  previewUrl?: string;
}

export interface TechnicianVerificationPayload {
  technicianId: string;
  specialization: string;
  certifications: { name: string; fileUrl?: string }[];
}

interface TechnicianVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  technicianId: string;
  specialization: string;
  existingCertifications?: string[];
}

const TechnicianVerificationModal: React.FC<TechnicianVerificationModalProps> = ({
  isOpen,
  onClose,
  technicianId,
  specialization,
  existingCertifications = [],
}) => {
  const [certifications, setCertifications] = useState<CertificationInput[]>(
    existingCertifications.map((name) => ({ name }))
  );

  const { verifyTechnician, loading: verifying, success, error } = useVerifyTechnician();

  if (!isOpen) return null;

  /** ➕ Add new certification row */
  const handleAddCertification = () => {
    setCertifications([...certifications, { name: "" }]);
  };

  /** 🗑️ Remove certification row */
  const handleRemoveCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  /** ✏️ Handle certification name change */
  const handleChange = (index: number, value: string) => {
    const updated = [...certifications];
    updated[index].name = value;
    setCertifications(updated);
  };

  /** 📁 Handle file upload */
  const handleFileChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updated = [...certifications];
        updated[index].file = file;
        updated[index].previewUrl = reader.result as string;
        setCertifications(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  /** 🚀 Handle submission */
  const handleSubmit = async () => {
    const payload: TechnicianVerificationPayload = {
      technicianId,
      specialization,
      certifications: certifications.map((c) => ({
        name: c.name,
        fileUrl: c.previewUrl,
      })),
    };

    await verifyTechnician(payload);

    // Automatically close modal if successful
    if (success) {
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Technician Verification
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Please upload your certification documents to be verified by ConstructHub. Verified technicians gain visibility and trust.
          </p>

          {/* 🧠 Status messages */}
          {verifying && (
            <p className="text-blue-600 text-sm font-medium">Submitting your verification...</p>
          )}
          {success && (
            <p className="text-green-600 text-sm font-medium">✅ Verification submitted successfully!</p>
          )}
          {error && (
            <p className="text-red-600 text-sm font-medium">{error}</p>
          )}

          {/* Specialization */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Specialization
            </label>
            <input
              type="text"
              value={specialization}
              readOnly
              className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-600 dark:text-gray-300"
            />
          </div>

          {/* Certifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Certifications
            </label>

            {certifications.map((cert, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-3 border p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
              >
                <input
                  type="text"
                  placeholder="Certification name"
                  value={cert.name}
                  onChange={(e) => handleChange(index, e.target.value)}
                  className="flex-1 p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 text-gray-800 dark:text-gray-100"
                />

                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(index, e)}
                  className="text-sm text-gray-700 dark:text-gray-300"
                />

                {cert.previewUrl && (
                  <img
                    src={cert.previewUrl}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-md border dark:border-gray-700"
                  />
                )}

                <button
                  onClick={() => handleRemoveCertification(index)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              onClick={handleAddCertification}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              + Add another certification
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-400 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={verifying}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition ${
              verifying
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {verifying ? "Submitting..." : "Submit for Verification"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnicianVerificationModal;
