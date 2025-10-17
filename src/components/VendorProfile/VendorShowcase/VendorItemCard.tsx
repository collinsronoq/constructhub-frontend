import React from "react";

export interface VendorItemCardProps {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  unit?: string;
  price: number;
  description?: string;
  available: boolean;
  imageUrl: string;
  onViewDetails?: (itemId: string) => void; // 🆕 callback prop
}

const VendorItemCard: React.FC<VendorItemCardProps> = ({
  id,
  name,
  category,
  subcategory,
  unit,
  price,
  available,
  imageUrl,
  onViewDetails,
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-lg transition p-4 flex flex-col justify-between border border-gray-200 dark:border-gray-700">
      {/* Image Section */}
      <div className="relative">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-40 object-cover rounded-lg"
        />
        <span
          className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-md font-medium ${
            available
              ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
              : "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200"
          }`}
        >
          {available ? "In Stock" : "Out of Stock"}
        </span>
      </div>

      {/* Item Info */}
      <div className="mt-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
          {name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {category} {subcategory && `• ${subcategory}`}
        </p>
      </div>

      {/* Price and Action */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-blue-600 dark:text-blue-400 font-semibold">
          KSh {price.toLocaleString()}{" "}
          {unit && <span className="text-sm text-gray-500">/ {unit}</span>}
        </p>

        <button
          onClick={() => onViewDetails?.(id)}
          className="text-sm px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition w-fit"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default VendorItemCard;
