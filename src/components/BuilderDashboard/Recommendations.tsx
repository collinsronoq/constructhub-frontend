import VendorCard from "../VendorCard";

import type { VendorCardProps } from "../VendorCard";
import type { TechnicianCardProps } from "../TechnicianCard";
import TechnicianCard from "../TechnicianCard";

interface RecommendationsProps {
  vendors?: VendorCardProps[]
  technicians?: TechnicianCardProps[]
  onViewAll?: () => void
}

const Recommendations = ({ 
  vendors = [
    {
      id: "1",
      name: "Elite Roofing Solutions",
      category: "Roofing Vendor",
      location: "Nakuru",
      contact: "+254 712 345 678",
      imageUrl: "src/assets/image_3.jpg",
    },
    {
      id: "2",
      name: "GreenBuild Supplies",
      category: "Construction Materials",
      location: "Nairobi",
      contact: "+254 710 998 443",
      imageUrl: "src/assets/image_3.jpg",
    },
    {
      id: "3",
      name: "ProTech Electricals",
      category: "Technician",
      location: "Rafiki",
      contact: "+254 723 111 222",
      imageUrl: "src/assets/image_3.jpg",
    },
    {
      id: "4",
      name: "ProTech Electricals",
      category: "Technician",
      location: "Rafiki",
      contact: "+254 723 111 222",
      imageUrl: "src/assets/image_3.jpg",
    },
    {
      id: "5",
      name: "ProTech Electricals",
      category: "Technician",
      location: "Rafiki",
      contact: "+254 723 111 222",
      imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=400&q=80",
    }
  ],
  technicians = [
    {
      id: "1",
      name: "Collins Rono",
      specialization: "Electrician",
      location: "Nakuru",
      experience: "5 years",
      rating: 4.5,
      contact: "+254 712 345 678",
      verified: false
    },
    {
      id: "2",
      name: "Collins Rono",
      specialization: "Electrician",
      location: "Nakuru",
      experience: "5 years",
      rating: 4.5,
      contact: "+254 712 345 678",
      verified: false
    },
    {
      id: "3",
      name: "Collins Rono",
      specialization: "Electrician",
      location: "Nakuru",
      experience: "5 years",
      rating: 4.5,
      contact: "+254 712 345 678",
      verified: true
    },
    {
      id: "4",
      name: "Collins Rono",
      specialization: "Electrician",
      location: "Nakuru",
      experience: "5 years",
      rating: 4.5,
      contact: "+254 712 345 678",
      verified: true
    },
  ],
  onViewAll,} : RecommendationsProps) => {
  return (
    <section className="p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm my-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Recommended Vendors & Technicians
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Based on your project locations and previous estimations
          </p>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
          >
            View All
          </button>
        )}
      </div>

      {/* Vendors Section */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-slate-200 dark:border-slate-200/10 pb-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Recommended Vendors
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400 py-4 md:py-0">
            Verified material suppliers
          </span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {vendors.map((vendor) => (
            <VendorCard key={vendor.id} {...vendor} />
          ))}
        </div>
      </div>

      {/* Technicians Section */}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-slate-200 dark:border-slate-200/10 pb-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Recommended Technicians
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400 py-4 md:py-0">
            Skilled professionals near your projects
          </span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {technicians.map((technician) => (
            <TechnicianCard key={technician.id} {...technician} />
          ))}
        </div>
      </div>
    </section>
  )
};

export default Recommendations;
