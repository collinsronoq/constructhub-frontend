import type { VendorCardProps } from "../../components/VendorCard";
import type { TechnicianCardProps } from "../../components/TechnicianCard";

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
