import { useEffect, useState } from "react";
import type { VendorCardProps } from "../../components/VendorCard";
import type { TechnicianCardProps } from "../../components/TechnicianCard";

// ==============================
// 🔹 Type Definitions
// ==============================
export interface MaterialLine {
  id: string;
  name: string;
  qty: number;
  unit: string;
  unitCost: number;
  subtotal: number;
}

export interface LabourLine {
  id: string;
  role: string;
  days: number;
  ratePerDay: number;
  subtotal: number;
}

export interface PhaseData {
  id: string;
  title: string;
  materials: MaterialLine[];
  labour: LabourLine[];
  technicians: string[];
  subtotal: number;
}

export interface EstimationBreakdown {
  projectTitle: string;
  floorArea: number;
  quality: string;
  totalCost: number;
  phases: PhaseData[];
  recommendations: {
    vendors: VendorCardProps[];
    technicians: TechnicianCardProps[];
  };
  other: number;
}

// ==============================
// 🔹 Mock Dataset (3-Bedroom Bungalow)
// ==============================
export const mockEstimationData: EstimationBreakdown = {
  projectTitle: "3-Bedroom Bungalow",
  floorArea: 130,
  quality: "Standard",
  totalCost: 4950000,
  phases: [
    {
      id: "site-analysis",
      title: "Site Analysis & Survey",
      materials: [
        { id: "sa1", name: "Site Survey Equipment (hire)", qty: 1, unit: "day", unitCost: 15000, subtotal: 15000},
        { id: "sa2", name: "Peg and String for Marking", qty: 1, unit: "lot", unitCost: 2000, subtotal: 2000 },
      ],
      labour: [
        { id: "la1", role: "Land Surveyor", days: 2, ratePerDay: 8000, subtotal: 16000 },
        { id: "la2", role: "Survey Assistant", days: 2, ratePerDay: 1500, subtotal: 3000 },
      ],
      technicians: ["Land Surveyor", "Project Engineer"],
      subtotal: 36000,
    },
    {
      id: "site-prep",
      title: "Site Preparation & Earthworks",
      materials: [
        { id: "sp1", name: "Excavator Hire", qty: 2, unit: "day", unitCost: 25000, subtotal: 50000 },
        { id: "sp2", name: "Diesel Fuel", qty: 80, unit: "litres", unitCost: 190, subtotal: 15200 },
      ],
      labour: [
        { id: "lb1", role: "Machine Operator", days: 2, ratePerDay: 3000, subtotal: 6000 },
        { id: "lb2", role: "Site Labourers", days: 6, ratePerDay: 1300, subtotal: 7800 },
      ],
      technicians: ["Machine Operator", "Site Supervisor"],
      subtotal: 79000,
    },
    {
      id: "foundation",
      title: "Foundation Works",
      materials: [
        { id: "fd1", name: "Cement (50 kg)", qty: 260, unit: "bag", unitCost: 900, subtotal: 234000 },
        { id: "fd2", name: "Sand (m³)", qty: 40, unit: "m³", unitCost: 4800, subtotal: 192000 },
        { id: "fd3", name: "Hardcore (m³)", qty: 25, unit: "m³", unitCost: 3500, subtotal: 87500 },
        { id: "fd4", name: "DPM Plastic Sheeting", qty: 2, unit: "rolls", unitCost: 4000, subtotal: 8000 },
      ],
      labour: [
        { id: "lb3", role: "Mason", days: 14, ratePerDay: 2600, subtotal: 36400 },
        { id: "lb4", role: "General Labourer", days: 18, ratePerDay: 1300, subtotal: 23400 },
      ],
      technicians: ["Structural Engineer", "Site Supervisor"],
      subtotal: 601300,
    },
    {
      id: "superstructure",
      title: "Superstructure (Walls, Columns & Beams)",
      materials: [
        { id: "ss1", name: "Blocks (6-inch)", qty: 3500, unit: "pcs", unitCost: 70, subtotal: 245000 },
        { id: "ss2", name: "Cement", qty: 200, unit: "bag", unitCost: 900, subtotal: 180000 },
        { id: "ss3", name: "Reinforcement Bars (12mm)", qty: 50, unit: "pcs", unitCost: 1200, subtotal: 60000 },
      ],
      labour: [
        { id: "lb5", role: "Mason", days: 20, ratePerDay: 2600, subtotal: 52000 },
        { id: "lb6", role: "Steel Fixer", days: 8, ratePerDay: 2800, subtotal: 22400 },
        { id: "lb7", role: "General Labourer", days: 18, ratePerDay: 1300, subtotal: 23400 },
      ],
      technicians: ["Structural Engineer", "Foreman", "Mason", "Steel Fixer"],
      subtotal: 583800,
    },
    {
      id: "roofing",
      title: "Roofing",
      materials: [
        { id: "rf1", name: "Timber Trusses", qty: 100, unit: "pcs", unitCost: 1200, subtotal: 120000 },
        { id: "rf2", name: "Iron Sheets", qty: 80, unit: "sheets", unitCost: 1600, subtotal: 128000 },
        { id: "rf3", name: "Roof Nails & Accessories", qty: 1, unit: "lot", unitCost: 12000, subtotal: 12000 },
      ],
      labour: [
        { id: "lb8", role: "Carpenter", days: 12, ratePerDay: 2500, subtotal: 30000 },
        { id: "lb9", role: "Roofer", days: 8, ratePerDay: 2400, subtotal: 19200 },
      ],
      technicians: ["Roofing Specialist", "Carpenter", "Foreman"],
      subtotal: 309200,
    },
    {
      id: "services-first-fix",
      title: "Services – First Fix (Electrical & Plumbing)",
      materials: [
        { id: "sv1", name: "PVC Electrical Conduits", qty: 90, unit: "m", unitCost: 180, subtotal: 16200 },
        { id: "sv2", name: "Water Pipes (PVC)", qty: 60, unit: "m", unitCost: 220, subtotal: 13200 },
        { id: "sv3", name: "Electrical Wiring Cable", qty: 3, unit: "rolls", unitCost: 5000, subtotal: 15000 },
      ],
      labour: [
        { id: "lb10", role: "Electrician", days: 5, ratePerDay: 2700, subtotal: 13500 },
        { id: "lb11", role: "Plumber", days: 5, ratePerDay: 2600, subtotal: 13000 },
      ],
      technicians: ["Electrician", "Plumber"],
      subtotal: 70900,
    },
    {
      id: "services-second-fix",
      title: "Services – Second Fix (Fixtures & Fittings)",
      materials: [
        { id: "sf1", name: "Switches & Sockets", qty: 20, unit: "pcs", unitCost: 350, subtotal: 7000 },
        { id: "sf2", name: "Light Fittings", qty: 20, unit: "pcs", unitCost: 1500, subtotal: 30000 },
        { id: "sf3", name: "Toilets & Wash Basins", qty: 3, unit: "sets", unitCost: 14000, subtotal: 42000 },
      ],
      labour: [
        { id: "lb12", role: "Electrician", days: 4, ratePerDay: 2700, subtotal: 10800 },
        { id: "lb13", role: "Plumber", days: 4, ratePerDay: 2600, subtotal: 10400 },
      ],
      technicians: ["Electrician", "Plumber", "Interior Finisher"],
      subtotal: 100200,
    },
    {
      id: "finishes",
      title: "Finishes",
      materials: [
        { id: "fn1", name: "Wall Plaster", qty: 50, unit: "bags", unitCost: 950, subtotal: 47500 },
        { id: "fn2", name: "Floor Tiles", qty: 300, unit: "pcs", unitCost: 1500, subtotal: 450000 },
        { id: "fn3", name: "Paint", qty: 80, unit: "litres", unitCost: 500, subtotal: 40000 },
        { id: "fn4", name: "Cabinets & Wardrobes", qty: 10, unit: "sets", unitCost: 18000, subtotal: 180000 },
        { id: "fn5", name: "Bathroom Fittings", qty: 6, unit: "sets", unitCost: 11000, subtotal: 66000 },
      ],
      labour: [
        { id: "lb14", role: "Painter", days: 10, ratePerDay: 2000, subtotal: 20000 },
        { id: "lb15", role: "Tiler", days: 8, ratePerDay: 2500, subtotal: 20000 },
        { id: "lb16", role: "Carpenter", days: 10, ratePerDay: 2500, subtotal: 25000 },
        { id: "lb17", role: "Plumber", days: 4, ratePerDay: 2600, subtotal: 10400 },
      ],
      technicians: ["Interior Finisher", "Painter", "Carpenter", "Plumber"],
      subtotal: 881900,
    },
    {
      id: "external",
      title: "External Works & Drainage",
      materials: [
        { id: "ex1", name: "Paving Blocks", qty: 400, unit: "pcs", unitCost: 150, subtotal: 60000 },
        { id: "ex2", name: "Drainage Pipes", qty: 30, unit: "m", unitCost: 500, subtotal: 15000 },
        { id: "ex3", name: "Top Soil & Landscaping", qty: 1, unit: "lot", unitCost: 20000, subtotal: 20000 },
      ],
      labour: [
        { id: "lb18", role: "Landscaper", days: 5, ratePerDay: 2500, subtotal: 12500 },
        { id: "lb19", role: "Drainage Technician", days: 4, ratePerDay: 2700, subtotal: 10800 },
      ],
      technicians: ["Landscaper", "Drainage Technician", "Site Supervisor"],
      subtotal: 118300,
    },
  ],
  recommendations: {
    vendors : [
    {
      id: "1",
      name: "Elite Roofing Solutions",
      category: "Roofing Vendor",
      location: "Nakuru",
      rating: 4.5,
      contact: "+254 712 345 678",
      imageUrl: "src/assets/image_3.jpg",
    },
    {
      id: "2",
      name: "GreenBuild Supplies",
      category: "Construction Materials",
      rating: 4.5,
      location: "Nairobi",
      contact: "+254 710 998 443",
      imageUrl: "src/assets/image_3.jpg",
    },
    {
      id: "3",
      name: "ProTech Electricals",
      category: "Technician",
      rating: 4.5,
      location: "Rafiki",
      contact: "+254 723 111 222",
      imageUrl: "src/assets/image_3.jpg",
    },
    {
      id: "4",
      name: "ProTech Electricals",
      category: "Technician",
      rating: 4.5,
      location: "Rafiki",
      contact: "+254 723 111 222",
      imageUrl: "src/assets/image_3.jpg",
    },
    {
      id: "5",
      name: "ProTech Electricals",
      category: "Technician",
      rating: 4.5,
      location: "Rafiki",
      contact: "+254 723 111 222",
      imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=400&q=80",
    }
  ],
  technicians : [
    {
      id: "1",
      name: "Collins Rono",
      specialization: "Electrician",
      location: "Nakuru",
      experience: "5 years",
      rating: 4.5,
      contact: "+254 712 345 678",
      imageUrl: "src/assets/image_4.jpg",
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
      imageUrl: "src/assets/image_4.jpg",
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
      imageUrl: "src/assets/image_4.jpg",
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
      imageUrl: "src/assets/image_4.jpg",
      verified: true
    },
  ],
  },

  other: 0,
};

// ==============================
// 🔹 Hook Implementation
// ==============================
export function useEstimationData() {
  const [data, setData] = useState<EstimationBreakdown | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setData(mockEstimationData), 1500);
    return () => clearTimeout(timer);
  }, []);

  return { data, isLoading: !data, error: null };
}

