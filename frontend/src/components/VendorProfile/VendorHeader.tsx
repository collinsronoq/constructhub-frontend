import { useState } from "react";
import {
  BadgeCheck,
  Edit,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

interface VendorHeaderProps {
  name: string;
  categories: string[];
  location?: string;
  contact?: {
    phone?: string;
    email?: string;
  };
  verified?: boolean;
  bannerUrl?: string;
  logoUrl?: string;
  averageRating?: number;
  isVendorView?: boolean;
  availability?: "Open" | "Closed" | "Temporarily Unavailable";
  onChangeAvailability?: (status: string) => void;
  onEditProfile?: () => void;
  onManageItems?: () => void;
  onViewCatalog?: () => void;
}

const VendorHeader: React.FC<VendorHeaderProps> = ({
  name,
  categories,
  location,
  contact,
  verified = false,
  bannerUrl,
  logoUrl,
  averageRating,
  isVendorView = false,
  availability = "Open",
  onChangeAvailability,
  onEditProfile,
  onManageItems,
  onViewCatalog,
}) => {
  const [status, setStatus] = useState(availability);

  return (
    <header className="relative bg-surface-light dark:bg-surface-dark rounded-xl overflow-hidden shadow-sm">
      
      {/* Banner */}
      <div className="relative w-full h-36 sm:h-48 md:h-60">
        <img
          src={bannerUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute top-0 right-1 p-2 pt-3 text-xs">
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
      </div>

      {/* Vendor Info Container */}
      <div className="relative -mt-14 sm:-mt-16 md:-mt-20 px-4 sm:px-6 md:px-8 pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        {/* Left Side: Logo + Basic Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6">
          
          <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-xl border-4 overflow-hidden border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={name}
                className="w-full h-full object-cover shadow-md"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-2xl md:text-4xl font-bold">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-nowrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-600 dark:text-brand-dark md:text-white">
                {name}
              </h1>
            {verified ? (
              <BadgeCheck
                className="w-5 h-5 text-blue-500"
                
              />
            ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  (Unverified)
                </span>
              )}
            </div>

            {/* Categories */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-2.5 py-0.5 rounded-full text-xs font-medium"
                >
                  {cat}
                </span>
              ))}
            </div>

            {/* Location */}
            {location && (
              <div className="flex items-center justify-center sm:justify-start gap-1 mt-3 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" /> {location}
              </div>
            )}
            {/* Rating */}
            {averageRating !== undefined && (
              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-700 dark:text-gray-300 mt-2">
                <span className="font-medium">{averageRating.toFixed(1)}</span>
                <span className="text-xs text-gray-500">/ 5.0</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Status, Contact & Actions */}
        <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto">
          {/* Availability */}
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                status === "Open"
                  ? "bg-green-100 text-green-700"
                  : status === "Closed"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {status}
            </span>
            {isVendorView && (
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as any);
                  onChangeAvailability?.(e.target.value);
                }}
                className="text-xs sm:text-sm bg-transparent border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option>Open</option>
                <option>Closed</option>
                <option>Temporarily Unavailable</option>
              </select>
            )}
          </div>

          {/* Contact Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-end gap-2 text-sm text-gray-700 dark:text-gray-300">
            <span className="text-gray-700 dark:text-gray-300 font-semibold items-center">CONTACT</span>
            {contact?.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> {contact.phone}
              </div>
            )}
            {contact?.email && (
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" /> {contact.email}
              </div>
            )}
          </div>

          {/* Vendor-only Actions */}
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            {isVendorView && (
              <>
                <button
                  onClick={onEditProfile}
                  className="flex items-center justify-center gap-1 text-sm px-4 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <Edit className="w-4 h-4" /> Edit Profile
                </button>
                <button
                  onClick={onManageItems}
                  className="flex items-center justify-center gap-1 text-sm px-4 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Manage Items
                </button>
              </>
            )}
            {!isVendorView && onViewCatalog && (
              <button
                onClick={onViewCatalog}
                className="flex items-center justify-center gap-1 text-sm px-4 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                View Catalog
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default VendorHeader;
