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
    },
    {
      id: "2",
      name: "Collins Rono",
      specialization: "Electrician",
      location: "Nakuru",
      experience: "5 years",
      rating: 4.5,
      contact: "+254 712 345 678",
    },
    {
      id: "3",
      name: "Collins Rono",
      specialization: "Electrician",
      location: "Nakuru",
      experience: "5 years",
      rating: 4.5,
      contact: "+254 712 345 678",
    },
    {
      id: "4",
      name: "Collins Rono",
      specialization: "Electrician",
      location: "Nakuru",
      experience: "5 years",
      rating: 4.5,
      contact: "+254 712 345 678",
    },
  ],
  onViewAll,} : RecommendationsProps) => {
  return (
    <section className="p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm my-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Recommended Vendors & Technicians
        </h2>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
          >
            View All
          </button>
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 my-4 border-b">Recommended Vendors</h3>
      {/* Vendor Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {vendors.map((vendor) => (
          <VendorCard key={vendor.id} {...vendor} />
        ))}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-6 border-b">Recommended Technicians</h3>
      {/* Technicinas Cards Grid */}
      <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {technicians.map((technician) => (
          <TechnicianCard key={technician.id} {...technician} />
        ))}
      </div>
    </section>
  )
};

export default Recommendations;
