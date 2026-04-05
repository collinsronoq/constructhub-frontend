export type SurveyQuality = "standard" | "premium";
export type SoilType = "soft" | "medium" | "rocky";
export type AccessDifficulty = "normal" | "difficult";
export type VegetationDensity = "light" | "medium" | "heavy";

export type StructureType = "bungalow" | "two_storey" | "three_storey" | "multi_storey";
export type BlockworkType = "burnt_bricks" | "concrete_blocks" | "machine_cut_blocks";
export type RoomSizePreference = "compact" | "standard" | "spacious";
export type FinishingLevel = "standard" | "premium" | "luxury";

export type RoofType = "gable" | "hip" | "flat" | "mono_pitch";
export type RoofCovering = "corrugated_mabati" | "box_profile_mabati" | "stone_coated_tiles" | "clay_tiles";
export type RoofPitch = "low" | "medium" | "steep";

export type MainFloorFinish = "tile" | "laminate" | "parquet" | "polished_screed";
export type WetFloorFinish = "ceramic_tile" | "porcelain_tile";
export type CeilingType = "gypsum_board" | "acoustic_board" | "tng" | "exposed";
export type PaintSystem = "standard_2_coat" | "premium_3_coat";
export type JoineryLevel = "standard" | "premium";
export type StandardPremium = "standard" | "premium";

export type PerimeterWallType = "block_wall" | "precast" | "chain_link" | "none";
export type SewerageSystem = "septic_tank" | "sewer_connection" | "biodigester";

export interface SiteSurveyInput {
  plot_size_sqm?: number;
  location: string;
  include_soil_test?: boolean;
  include_topographical_survey?: boolean;
  survey_quality?: SurveyQuality;
}

export interface SitePreparationInput {
  plot_size_sqm?: number;
  soil_type?: SoilType;
  excavation_depth_m?: number;
  include_disposal?: boolean;
  access_difficulty?: AccessDifficulty;
  vegetation_density?: VegetationDensity;
  has_existing_structures?: boolean;
}

export interface FoundationInput {
  foundation_type: "strip" | "raft";
  soil_type?: SoilType;
  // Compatibility-only override; backend shared geometry is authoritative.
  floor_area_sqm?: number;
  quality_level?: StandardPremium;
  include_formwork?: boolean;
}

export interface SuperstructureInput {
  land_size_sqm?: number;
  structure_type: StructureType;
  blockwork_type: BlockworkType;
  declared_floor_area_sqm?: number;
  bedrooms: number;
  bathrooms: number;
  master_bedrooms?: number;
  living_rooms?: number;
  dining_rooms?: number;
  kitchens?: number;
  additional_rooms?: Record<string, { count: number }>;
  room_size_preference?: RoomSizePreference;
  finishing_level?: FinishingLevel;
}

export interface RoofingInput {
  roof_type: RoofType;
  roof_covering: RoofCovering;
  roof_pitch?: RoofPitch;
  // Compatibility-only override; backend shared geometry is authoritative.
  building_footprint_sqm?: number;
  // Compatibility-only override; backend shared geometry is authoritative.
  storeys?: number;
  include_overhangs?: boolean;
}

export interface ServicesFirstFixInput {
  // Compatibility-only override; backend shared geometry is authoritative.
  floor_area_sqm?: number;
  // Compatibility-only override; backend shared geometry is authoritative.
  storeys?: number;
  bathrooms?: number;
  kitchens?: number;
  laundry_rooms?: number;
  sockets_per_room?: number;
  light_points_per_room?: number;
  quality_level?: StandardPremium;
  include_hot_water?: boolean;
  include_earthing?: boolean;
}

export interface ServicesSecondFixInput {
  // Compatibility-only override; backend shared geometry is authoritative.
  floor_area_sqm?: number;
  // Compatibility-only override; backend shared geometry is authoritative.
  storeys?: number;
  bedrooms?: number;
  bathrooms?: number;
  kitchens?: number;
  living_rooms?: number;
  dining_rooms?: number;
  sockets_per_room?: number;
  light_points_per_room?: number;
  include_shower_mixers?: boolean;
  include_instant_showers?: boolean;
  quality_level?: StandardPremium;
}

export interface FinishesInput {
  // Compatibility-only override; backend shared geometry is authoritative.
  floor_area_sqm?: number;
  // Compatibility-only override; backend shared geometry is authoritative.
  storeys?: number;
  wall_height_m?: number;
  bedrooms?: number;
  master_bedrooms?: number;
  bathrooms?: number;
  kitchens?: number;
  living_rooms?: number;
  dining_rooms?: number;
  stores?: number;
  other_rooms?: number;
  main_floor_finish?: MainFloorFinish;
  wet_floor_finish?: WetFloorFinish;
  wet_wall_tiling?: boolean;
  ceiling_type?: CeilingType;
  paint_system?: PaintSystem;
  include_cornices?: boolean;
  include_skirting?: boolean;
  include_wardrobes?: boolean;
  include_kitchen_cabinets?: boolean;
  include_bathroom_cabinetry?: boolean;
  include_store_cabinetry?: boolean;
  joinery_level?: JoineryLevel;
  quality_level?: FinishingLevel;
}

export interface ExternalWorksInput {
  land_size_sqm?: number;
  // Compatibility-only override; backend shared geometry is authoritative.
  floor_area_sqm?: number;
  perimeter_wall_enabled?: boolean;
  perimeter_wall_type?: PerimeterWallType;
  perimeter_wall_length_m?: number;
  perimeter_wall_height_m?: number;
  gate_count?: number;
  gate_width_m?: number;
  razor_wire?: boolean;
  paving_area_sqm?: number;
  driveway_area_sqm?: number;
  drainage_length_m?: number;
  landscaping_area_sqm?: number;
  sewerage_system?: SewerageSystem;
  sewer_connection_length_m?: number;
  biodigester_capacity_users?: number;
  quality_level?: StandardPremium;
}

export interface EstimationRequest {
  project_name?: string;
  site_survey: SiteSurveyInput;
  site_preparation: SitePreparationInput;
  foundation: FoundationInput;
  superstructure: SuperstructureInput;
  roofing: RoofingInput;
  services_first_fix: ServicesFirstFixInput;
  services_second_fix: ServicesSecondFixInput;
  finishes: FinishesInput;
  external_works: ExternalWorksInput;
  vendor_prices?: Record<string, unknown>;
}

export type CostCategory = "material" | "labour" | "equipment" | "other";
export type CostSource = "rate_table" | "vendor" | "assumed" | "fixed_service";
export type CostConfidence = "low" | "medium" | "high";

export interface QuantityItem {
  name: string;
  value: number;
  unit: string;
  formula?: string | null;
}

export interface CostItem {
  item_code: string;
  description: string;
  unit: string;
  quantity: number;
  unit_rate: number;
  total: number;
  category: CostCategory;
  source?: CostSource;
  confidence?: CostConfidence;
}

export interface PhaseTotals {
  materials: number;
  labour: number;
  equipment: number;
  other: number;
  phase_total: number;
}

export interface PhaseMetadata {
  version?: string;
  pricing_source?: string;
  confidence?: CostConfidence;
}

export interface PhaseEstimate {
  phase_id: string;
  phase_name: string;
  phase?: string;
  inputs_used?: Record<string, unknown>;
  quantities?: QuantityItem[];
  materials?: CostItem[];
  labour?: CostItem[];
  equipment?: CostItem[];
  other_costs?: CostItem[];
  totals?: PhaseTotals;
  assumptions?: string[];
  notes?: string[];
  warnings?: string[];
  metadata?: PhaseMetadata;
}

export interface EstimationListItem {
  id: string;
  project_title?: string | null;
  project_name?: string | null;
  location?: string | null;
  floor_area?: number | null;
  quality?: string | null;
  total_cost: number;
  created_at?: string | null;
  blob_path?: string | null;
}

export interface ProjectDetails {
  project_name?: string | null;
  location?: string | null;
  bedrooms?: number;
  bathrooms?: number;
  floor_area_sqm?: number | null;
  footprint_area_sqm?: number | null;
  storeys?: number | null;
  geometry_area_source?: string | null;
  fits_plot_constraints?: boolean | null;
  geometry_caps_applied?: string[];
  structure_type?: StructureType;
  finishing_level?: FinishingLevel;
}

export interface Permit {
  id: string;
  name: string;
  cost?: number | null;
  where?: string | null;
  significance?: string | null;
  duration_days?: number | null;
  status?: string | null;
}

export interface EstimationSummary {
  total_cost: number;
  material_cost: number;
  labour_cost: number;
  equipment_cost?: number;
  other_cost: number;
  phases_count: number;
}

export interface EstimationDetail {
  id: string;
  summary: EstimationSummary;
  project_details?: ProjectDetails;
  breakdown: PhaseEstimate[];
  permits: Permit[];
  recommendations: unknown[];
}
