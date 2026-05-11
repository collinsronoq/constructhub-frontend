import { useNavigate } from "react-router-dom";
import type { VendorCardProps } from "../VendorCard";
import type { TechnicianCardProps } from "../TechnicianCard";
import { Hammer, Star, Store, MapPin, CircleCheck, CircleX } from "lucide-react";

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
  const topVendors = vendors.slice(0, 4);
  const topTechnicians = technicians.slice(0, 4);

  return (
    <section className="p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm mt-8 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-6">
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

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Store size={18} />
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Vendors</h3>
            </div>
            <button
              onClick={() => navigate("/vendors")}
              className="text-xs text-blue-600 hover:underline"
            >
              Browse
            </button>
          </div>
          {topVendors.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {topVendors.map((v) => (
                <article
                  key={v.id}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50/70 dark:bg-gray-800/40 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight line-clamp-2">
                      {v.name}
                    </h4>
                    {v.verified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-200">
                        <CircleCheck size={12} />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200">
                        <CircleX size={12} />
                        Unverified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {v.category || "General Vendor"}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} />
                      {v.location || "Location not provided"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Star size={12} className="text-amber-500" />
                      {(v.rating ?? 0).toFixed(1)}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/vendors/${Number(v.id)}/profile`)}
                    className="mt-1 w-full rounded-md bg-brand-light hover:bg-blue-900 text-white text-xs font-medium py-1.5 transition"
                  >
                    View profile
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No vendor recommendations yet.</div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Hammer size={18} />
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Technicians</h3>
            </div>
            <button
              onClick={() => navigate("/technicians")}
              className="text-xs text-blue-600 hover:underline"
            >
              Browse
            </button>
          </div>
          {topTechnicians.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {topTechnicians.map((t) => (
                <article
                  key={t.id}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50/70 dark:bg-gray-800/40 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight line-clamp-2">
                      {t.name}
                    </h4>
                    {t.verified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-200">
                        <CircleCheck size={12} />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200">
                        <CircleX size={12} />
                        Unverified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {t.specialization || "General Technician"}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} />
                      {t.location || "Location not provided"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Star size={12} className="text-amber-500" />
                      {(t.rating ?? 0).toFixed(1)}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/technicians/${Number(t.id)}/profile`)}
                    className="mt-1 w-full rounded-md bg-brand-light hover:bg-blue-900 text-white text-xs font-medium py-1.5 transition"
                  >
                    View profile
                  </button>
                </article>
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
