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

export interface OtherCostLine {
  id: string;
  name: string;
  amount: number;
}

export interface PhaseData {
  id: string;
  title: string;
  materials: MaterialLine[];
  labour: LabourLine[];
  otherCosts: OtherCostLine[];
  technicians: string[];
  subtotal: number;
}

export interface PermitItem {
  id: string;
  name: string;
  cost?: number | null;
  where?: string | null;
  significance?: string | null;
  durationDays?: number | null;
  status?: string | null;
}

export interface EstimationBreakdown {
  projectTitle: string;
  floorArea: number;
  quality: string;
  bedrooms?: number;
  bathrooms?: number;
  structureType?: string;
  totalCost: number;
  phases: PhaseData[];
  recommendations: {
    vendors: VendorCardProps[];
    technicians: TechnicianCardProps[];
  };
  other: number;
  permits: PermitItem[];
}
