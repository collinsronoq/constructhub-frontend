import React from "react";
import { Link } from "react-router-dom";

export interface TechnicianCardProps {
  id: string;
  name: string;
  specialization: string;
  location: string;
  experience: string;
  rating: number;
  contact: string;
  verified: boolean;
  imageUrl?: string;
  onViewProfile: (id: string) => void;
}

const TechnicianCard: React.FC<TechnicianCardProps> = ({
  id,
  name,
  specialization,
  location,
  experience,
  verified,
  rating,
  contact,
  imageUrl,
  onViewProfile,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-transform relative transform hover:scale-[1.02] flex flex-col justify-between overflow-hidden">
      {/* verification badge */}
      <div className="absolute top-0 right-0 p-4 inline-block text-xs md:text-sm items-center font-medium">
        { verified ? 
          (
            <div className="bg-teal-100 text-teal-700 rounded-full px-2 py-1">
              <h4>Verified</h4>
            </div>
          ) :
          (
            <div className="bg-orange-100 text-orange-700 rounded-full px-2 py-1">
              <h4>Unverified</h4>
            </div>
          )

        }
      </div>
      {/* Top Section - Profile */}
      <div className="flex flex-col items-center text-center p-6">
        {/* Profile Image */}
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-emerald-500 dark:border-emerald-400">
          
          <img
            src={imageUrl || "src/assets/image_4.jpg"}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Name and Specialization */}
        <h3 className="mt-4 text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">
          {name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {specialization}
        </p>

        {/* Divider */}
        <div className="my-3 w-10 h-[2px] bg-emerald-500 dark:bg-emerald-400 rounded-full" />

        {/* Details */}
        <div className="text-xs md:text-sm space-y-2 text-gray-600 dark:text-gray-300">
          <p>📍 Location: <span className="font-medium">{location}</span></p>
          <p>🧰 Experience: <span className="font-medium">{experience}</span></p>
          <p>⭐ Rating: <span className="font-medium">{rating.toFixed(1)}</span></p>
          <p>☎ Contact: <span className="font-medium">{contact}</span></p>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="mt-auto">
        {/* <Link
          to={`/technicians/${id}`}
          className="block w-full text-center text-xs md:text-sm bg-brand-light hover:bg-blue-900 text-white font-medium py-2 transition"
        >
          View Profile
        </Link> */}
        <button
          onClick={() => onViewProfile(id)}
          className="block w-full text-center text-xs md:text-sm bg-brand-light hover:bg-blue-900 text-white font-medium py-2 transition"
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export default TechnicianCard;
