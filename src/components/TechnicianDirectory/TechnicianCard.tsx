import React from "react";
import { Star } from "lucide-react";

export interface TechnicianCardProps {
  id: string;
  name: string;
  specialization: string;
  location: string;
  experience: string;
  rating: number;
  verified: boolean;
  imageUrl: string;
  onViewProfile?: (id: string) => void;
}

const TechnicianCard: React.FC<TechnicianCardProps> = ({
  id,
  name,
  specialization,
  location,
  experience,
  rating,
  verified,
  imageUrl,
  onViewProfile,
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-lg transition p-4 flex flex-col border border-gray-200 dark:border-gray-700">
      {/* Image and Verification */}
      <div className="relative">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-40 object-cover rounded-lg"
        />
        {verified && (
          <span className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-md font-medium">
            Verified
          </span>
        )}
      </div>

      {/* Technician Info */}
      <div className="mt-3 flex-1">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {specialization}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          {location} • {experience}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={16}
              className={`${
                i < rating
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300 dark:text-gray-600"
              }`}
            />
          ))}
          <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">
            ({rating}.0)
          </span>
        </div>
      </div>

      {/* View Profile Button */}
      <button
        onClick={() => onViewProfile?.(id)}
        className="mt-4 px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        View Profile
      </button>
    </div>
  );
};

export default TechnicianCard;
