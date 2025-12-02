import { useEffect, useState } from "react";

export interface Technician {
  id: string;
  name: string;
  specialization: string;
  location: string;
  experience: string;
  verified: boolean;
  rating: number;
  imageUrl: string;
  contact: string;
  skills: string[];
}

// interface Filters {
//   location: string;
//   skill: string;
//   verifiedOnly: boolean;
// }

export function useTechnician() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess ] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [filters, setFilters] = useState<Filters>({
  //   location: "All",
  //   skill: "All",
  //   verifiedOnly: false,
  // });
  // const [searchQuery, setSearchQuery] = useState("");

  /** 🧠 Dummy Data (used if API fails or for layout testing) */
  const dummyTechnicians: Technician[] = [
    {
      id: "t1",
      name: "Collins Rono",
      specialization: "Electrical Technician",
      location: "Nakuru",
      experience: "5 years",
      verified: true,
      rating: 4.8,
      contact: "254 123 456 789",
      imageUrl: "src/assets/image_4.jpg",
      skills: ["Wiring", "Lighting", "Solar Systems"],
    },
    {
      id: "t2",
      name: "Sarah Mwangi",
      specialization: "Plumber",
      location: "Machakos",
      experience: "3 years",
      verified: false,
      rating: 4.3,
      contact: "254 123 456 789",
      imageUrl: "src/assets/image_2.jpg",
      skills: ["Pipe Fitting", "Leak Repair", "Water Systems"],
    },
    {
      id: "t3",
      name: "James Kariuki",
      specialization: "Painter",
      location: "Nakuru",
      experience: "7 years",
      verified: true,
      rating: 4.9,
      contact: "254 123 456 789",
      imageUrl: "src/assets/image_5.jpg",
      skills: ["Interior Painting", "Decorative Finishes", "Wall Prep"],
    },
    {
      id: "t1",
      name: "Collins Rono",
      specialization: "Electrical Technician",
      location: "Nakuru",
      experience: "5 years",
      verified: true,
      rating: 4.8,
      contact: "254 123 456 789",
      imageUrl: "src/assets/image_4.jpg",
      skills: ["Wiring", "Lighting", "Solar Systems"],
    },
    {
      id: "t1",
      name: "Collins Rono",
      specialization: "Electrical Technician",
      location: "Nakuru",
      experience: "5 years",
      verified: true,
      rating: 4.8,
      contact: "254 123 456 789",
      imageUrl: "src/assets/image_4.jpg",
      skills: ["Wiring", "Lighting", "Solar Systems"],
    },
    {
      id: "t1",
      name: "Collins Rono",
      specialization: "Electrical Technician",
      location: "Nakuru",
      experience: "5 years",
      verified: true,
      rating: 4.8,
      contact: "254 123 456 789",
      imageUrl: "src/assets/image_4.jpg",
      skills: ["Wiring", "Lighting", "Solar Systems"],
    },
    {
      id: "t1",
      name: "Collins Rono",
      specialization: "Electrical Technician",
      location: "Nakuru",
      experience: "5 years",
      verified: true,
      rating: 4.8,
      contact: "254 123 456 789",
      imageUrl: "src/assets/image_4.jpg",
      skills: ["Wiring", "Lighting", "Solar Systems"],
    },
    {
      id: "t1",
      name: "Collins Rono",
      specialization: "Electrical Technician",
      location: "Nakuru",
      experience: "5 years",
      verified: true,
      rating: 4.8,
      contact: "254 123 456 789",
      imageUrl: "src/assets/image_4.jpg",
      skills: ["Wiring", "Lighting", "Solar Systems"],
    },
  ];

  /** 🚀 Fetch Technicians from API (or use dummy data) */
  useEffect(() => {
    async function fetchTechnicians() {
      try {
        setLoading(true);
        setError(null);
        setSuccess(false);

        // Simulate API delay for realism
        await new Promise((resolve) => setTimeout(resolve, 1200));

        const response = await fetch("/api/technicians");

        if (!response.ok) {
          console.warn("⚠️ Using dummy data since API failed");
          setTechnicians(dummyTechnicians);
          return;
        }

        const data = await response.json();
        setSuccess(true)
        setTechnicians(data);
      } catch (err) {
        console.error("Fetch failed, using dummy data");
        setTechnicians(dummyTechnicians);
      } finally {
        setLoading(false);
      }
    }

    fetchTechnicians();
  }, []);

  /** 🔍 Apply search and filters */
  // const filteredTechnicians = technicians.filter((tech) => {
  //   const matchesLocation =
  //     filters.location === "All" || tech.location === filters.location;
  //   const matchesSkill =
  //     filters.skill === "All" || tech.skills.includes(filters.skill);
  //   const matchesVerification =
  //     !filters.verifiedOnly || tech.verified === true;
  //   const matchesSearch =
  //     tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     tech.specialization.toLowerCase().includes(searchQuery.toLowerCase());

  //   return matchesLocation && matchesSkill && matchesVerification && matchesSearch;
  // });

  return {
    // technicians: filteredTechnicians,
    // setFilters,
    // filters,
    // searchQuery,
    // setSearchQuery,
    loading,
    error,
    success,
    technicians
  };
}
