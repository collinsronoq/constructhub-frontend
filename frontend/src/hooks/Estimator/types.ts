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

export interface EquipmentLine {
  id: string;
  name: string;
  qty: number;
  unit: string;
  unitCost: number;
  subtotal: number;
}

export interface OtherCostLine {
  id: string;
  name: string;
  amount: number;
}

export interface QuantityLine {
  id: string;
  name: string;
  value: number;
  unit: string;
  formula?: string | null;
}

export interface PhaseMetadataInfo {
  version: string;
  pricingSource: string;
  confidence: "low" | "medium" | "high";
}

export interface PhaseTotalsInfo {
  materials: number;
  labour: number;
  equipment: number;
  other: number;
  phaseTotal: number;
}

export interface PhaseData {
  id: string;
  title: string;
  phaseName: string;
  materials: MaterialLine[];
  labour: LabourLine[];
  equipment: EquipmentLine[];
  otherCosts: OtherCostLine[];
  quantities: QuantityLine[];
  assumptions: string[];
  notes: string[];
  warnings: string[];
  metadata: PhaseMetadataInfo;
  inputsUsed: Record<string, unknown>;
  totals: PhaseTotalsInfo;
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
  storeys?: number;
  totalCost: number;
  materialCost: number;
  labourCost: number;
  equipmentCost: number;
  otherCost: number;
  phasesCount: number;
  phases: PhaseData[];
  recommendations: {
    vendors: VendorCardProps[];
    technicians: TechnicianCardProps[];
  };
  other: number;
  permits: PermitItem[];
}
