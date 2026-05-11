import React from "react";
import { Edit, Plus, Phone, Mail } from "lucide-react";
import type { TechnicianAvailability } from "../../services/api/types";

interface TechnicianHeaderProps {
  name: string;
  specialization: string;
  location: string;
  experience?: string;
  rating?: number;
  contact?: string;
  email?: string;
  verified?: boolean;
  availability?: TechnicianAvailability;
  imageUrl?: string;
  isTechnicianView?: boolean; // true if logged-in user is the technician
  onEditProfile?: () => void;
  onVerify?: () => void;
  onChangeAvailability?: (status: TechnicianAvailability) => void;
  onUploadImage?: () => void;
}

const TechnicianHeader: React.FC<TechnicianHeaderProps> = ({
  name,
  specialization,
  location,
  experience,
  rating,
  contact,
  email,
  verified,
  availability,
  imageUrl,
  isTechnicianView = true,
  onEditProfile,
  // onVerify,
  onChangeAvailability,
  onUploadImage,
}) => {
  return (
    <header className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 opacity-80 pointer-events-none" />
      <div className="relative p-6 flex flex-col lg:flex-row gap-6">
        {/* Avatar + verify status */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800">
              {imageUrl ? (
                <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-2xl font-bold">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {isTechnicianView && (
              <button
                onClick={onUploadImage}
                className="absolute bottom-2 right-0 flex items-center justify-center bg-black/60 text-white opacity-80 group-hover:opacity-100 transition rounded-full p-1.5"
                title="Change profile picture"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              verified
                ? "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-200"
                : "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-200"
            }`}
          >
            {verified ? "Verified" : "Unverified"}
          </span>
        </div>

        {/* Main info */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{name}</h2>
            <p className="text-blue-700 dark:text-blue-400 font-medium">{specialization}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{location}</p>
            {experience && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">Experience: {experience}</p>
            )}
            {rating !== undefined && (
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-700 dark:text-gray-200">
                <span className="font-medium">Rating:</span>
                <span className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill={i < Math.round(rating) ? "gold" : "#d1d5db"}
                      className="w-4 h-4"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.09 3.356a1 1 0 0 0 .95.69h3.525c.969 0 1.371 1.24.588 1.81l-2.857 2.074a1 1 0 0 0-.364 1.118l1.09 3.356c.3.921-.755 1.688-1.54 1.118l-2.857-2.074a1 1 0 0 0-1.176 0l-2.857 2.074c-.784.57-1.838-.197-1.54-1.118l1.09-3.356a1 1 0 0 0-.364-1.118L2.896 8.783c-.783-.57-.38-1.81.588-1.81h3.525a1 1 0 0 0 .95-.69l1.09-3.356z" />
                    </svg>
                  ))}
                </span>
                <span>{rating.toFixed(1)} / 5.0</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Contact</h4>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-100">
                  <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  {contact ? (
                    <a
                      href={`tel:${contact}`}
                      className="underline underline-offset-2 hover:text-blue-600"
                    >
                      {contact}
                    </a>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">Not provided</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-100">
                  <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  {email ? (
                    <a
                      href={`mailto:${email}`}
                      className="underline underline-offset-2 hover:text-blue-600"
                    >
                      {email}
                    </a>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">Not provided</span>
                  )}
                </div>
              </div>
            </div>
            {isTechnicianView && (
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Availability</label>
                <select
                  value={availability}
                  onChange={(e) => onChangeAvailability?.(e.target.value as TechnicianAvailability)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Available</option>
                  <option>Busy</option>
                  <option>Away</option>
                </select>
              </div>
            )}
            {isTechnicianView && (
              <button
                onClick={onEditProfile}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TechnicianHeader;
