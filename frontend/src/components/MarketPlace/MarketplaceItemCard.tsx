import React from "react";

interface MarketplaceItemCardProps {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  imageUrl: string;
  available: boolean;
  vendorName?: string;
  vendorId?: string;
  vendorLocation?: string;
  vendorVerified?: boolean;
  onViewVendor?: () => void;
}

const MarketplaceItemCard: React.FC<MarketplaceItemCardProps> = ({
  name,
  category,
  price,
  unit,
  imageUrl,
  available,
  vendorName,
  vendorLocation,
  vendorVerified,
  onViewVendor,
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col justify-between border border-gray-100 dark:border-gray-800">
      <div>
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-40 object-cover rounded-lg mb-3"
        />
        <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100">{name}</h3>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{category}</p>
        <p className="mt-2 text-blue-600 dark:text-blue-400 font-semibold text-sm md:text-base">
          KES {price.toLocaleString()} / {unit}
        </p>
        <p
          className={`mt-1 text-xs md:text-sm font-medium ${
            available ? "text-green-600" : "text-red-500"
          }`}
        >
          {available ? "Available" : "Out of Stock"}
        </p>
      </div>

      {/* Vendor Info */}
      <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {vendorName}
              {vendorVerified && (
                <span className="ml-1 text-blue-500 text-xs">✔</span>
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {vendorLocation}
            </p>
          </div>
          <button
            onClick={onViewVendor}
            className="px-3 py-1 flex flex-nowrap text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            View Vendor
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceItemCard;
