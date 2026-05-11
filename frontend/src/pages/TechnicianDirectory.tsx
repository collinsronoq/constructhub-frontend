import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTechnician } from "../hooks/TechnicianDirectory/useTechnician";
import TechnicianSearchBar from "../components/TechnicianDirectory/TechnicianSearchBar";
import TechnicianFilters from "../components/TechnicianDirectory/TechnicianFilters";
// import TechnicianCard from "../components/TechnicianDirectory/TechnicianCard";
import TechnicianCard from "../components/TechnicianCard";


const TechnicianDirectory: React.FC = () => {
  const navigate = useNavigate();
  // Fetch technicians (simulated API + dummy data)
  const { technicians, loading, error } = useTechnician();
  
  // Search + Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  /** 🧠 Filter and search technicians */
  const filteredTechnicians = useMemo(() => {
    return technicians.filter((tech) => {
      const specialization = (tech.specialization || "").toLowerCase();
      const skills = tech.skills || [];
      const location = (tech.location || "").toLowerCase();
      const search = searchQuery.toLowerCase();

      const matchesSearch =
        tech.name.toLowerCase().includes(search) ||
        specialization.includes(search);

      const matchesSkill =
        selectedSkill === "All" ||
        skills.some((s) => s.toLowerCase().includes(selectedSkill.toLowerCase()));

      const matchesLocation =
        selectedLocation === "All" ||
        location.includes(selectedLocation.toLowerCase());

      const matchesVerification = !showVerifiedOnly || tech.verified;

      return matchesSearch && matchesSkill && matchesLocation && matchesVerification;
    });
  }, [technicians, searchQuery, selectedSkill, selectedLocation, showVerifiedOnly]);
  
  const handleViewProfile = (id: string | number) => {
    navigate(`/technicians/${Number(id)}/profile`);
  };

  return (
    <section className="p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm my-2 space-y-6">
      {/* Header */}
      <div className="bg-background-light dark:bg-background-dark p-6 rounded-xl ">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl md:text-4xl font-semibold text-gray-900 dark:text-gray-100">
            Technician Directory
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Explore skilled and verified technicians from Nakuru & Machakos.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <TechnicianSearchBar query={searchQuery} onChange={setSearchQuery} />
          <TechnicianFilters
            selectedSkill={selectedSkill}
            onSkillChange={setSelectedSkill}
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
            showVerifiedOnly={showVerifiedOnly}
            onVerifiedToggle={setShowVerifiedOnly}
          />
        </div>
      </div>
      

      {/* Loading & Error States */}
      {loading && (
        <p className="text-center text-gray-500 dark:text-gray-400">Loading technicians...</p>
      )}
      {error && (
        <p className="text-center text-red-500">Failed to load technicians.</p>
      )}

      {/* Technician Cards */}
      {!loading && filteredTechnicians.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredTechnicians.map((tech) => (
            <TechnicianCard
              key={tech.id}
              id={tech.id}
              name={tech.name}
              specialization={tech.specialization || "General Technician"}
              location={tech.location || "Location not provided"}
              experience="Not provided"
              rating={tech.rating ?? 0}
              verified={tech.verified}
              imageUrl={tech.profile_image_url || undefined}
              contact={undefined}
              onViewProfile={handleViewProfile}
            />
          ))}
        </div>
      ) : (
        !loading && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No technicians found matching your filters.
          </p>
        )
        
      )}
      {!loading && filteredTechnicians.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-gray-500 dark:text-gray-400">
          <span className="text-3xl mb-2">😪</span>
          <p>No technicians found matching your filters.</p>
        </div>
      )}
    </section>
  );
};

export default TechnicianDirectory;
