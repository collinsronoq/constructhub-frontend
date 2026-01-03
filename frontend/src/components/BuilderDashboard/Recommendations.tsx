import VendorCard from "../VendorCard";
import type { VendorCardProps } from "../VendorCard";
import { useNavigate } from "react-router-dom";
import type { TechnicianCardProps } from "../TechnicianCard";
import TechnicianCard from "../TechnicianCard";
import { Hammer, Store } from "lucide-react";

interface RecommendationsProps {
  vendors?: VendorCardProps[];
  technicians?: TechnicianCardProps[];
  loading?: boolean;
  error?: string | null;
  onViewAll?: () => void;
}

const Recommendations = ({
  vendors = [],
  technicians = [],
  loading,
  error,
  onViewAll,
}: RecommendationsProps) => {
  const navigate = useNavigate();

  return (
    <section className="p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recommended Vendors & Technicians</h2>
        <button
          onClick={onViewAll || (() => navigate("/vendors"))}
          className="text-sm text-blue-600 hover:underline"
        >
          View all
        </button>
      </div>

      {loading && <div className="text-gray-500 text-sm mb-2">Loading...</div>}
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 border rounded p-4">
          <div className="flex items-center gap-2 mb-3">
            <Store size={18} />
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Vendors</h3>
          </div>
          {vendors.length ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {vendors.slice(0, 4).map((v) => (
                <VendorCard key={v.id} {...v} />
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No vendor recommendations yet.</div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 border rounded p-4">
          <div className="flex items-center gap-2 mb-3">
            <Hammer size={18} />
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Technicians</h3>
          </div>
          {technicians.length ? (
            <div className="space-y-3">
              {technicians.slice(0, 4).map((t) => (
                <TechnicianCard key={t.id} {...t} />
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No technician recommendations yet.</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Recommendations;
