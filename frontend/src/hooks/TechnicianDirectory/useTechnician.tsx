import { useEffect, useState } from "react";
import { fetchTechnicianDirectory } from "../../services/api/directories";
import type { TechnicianDirectoryItem } from "../../services/api/types";

export function useTechnician() {
  const [technicians, setTechnicians] = useState<TechnicianDirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dummyTechnicians: TechnicianDirectoryItem[] = [
    {
      id: 1,
      name: "Collins Rono",
      specialization: "Electrical Technician",
      location: "Nakuru",
      verified: true,
      rating: 4.8,
      profile_image_url: "src/assets/image_4.jpg",
      skills: ["Wiring", "Lighting", "Solar Systems"],
    },
    {
      id: 2,
      name: "Sarah Mwangi",
      specialization: "Plumber",
      location: "Machakos",
      verified: false,
      rating: 4.3,
      profile_image_url: "src/assets/image_2.jpg",
      skills: ["Pipe Fitting", "Leak Repair", "Water Systems"],
    },
    {
      id: 3,
      name: "James Kariuki",
      specialization: "Painter",
      location: "Nakuru",
      verified: true,
      rating: 4.9,
      profile_image_url: "src/assets/image_5.jpg",
      skills: ["Interior Painting", "Decorative Finishes", "Wall Prep"],
    },
  ];

  useEffect(() => {
    async function fetchTechnicians() {
      try {
        setLoading(true);
        setError(null);
        setSuccess(false);

        const data = await fetchTechnicianDirectory();
        setTechnicians(data);
        setSuccess(true);
      } catch (err) {
        console.error("Fetch failed, using dummy data", err);
        setTechnicians(dummyTechnicians);
        setError("Unable to load technicians");
      } finally {
        setLoading(false);
      }
    }

    fetchTechnicians();
  }, []);

  return {
    loading,
    error,
    success,
    technicians,
  };
}
