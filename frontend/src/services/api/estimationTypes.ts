export interface SiteSurveyInput {
  plot_size_sqm: number;
  location: string;
  include_soil_test?: boolean;
  include_topographical_survey?: boolean;
  survey_quality?: "standard" | "premium";
}

export interface SitePreparationInput {
  plot_size_sqm: number;
  vegetation_density?: "light" | "medium" | "heavy";
  has_existing_structures?: boolean;
}

export interface FoundationInput {
  soil_type: string;
  foundation_type: string;
  footprint_sqm: number;
}

export type StructureType = "bungalow" | "two_storey" | "three_storey" | "multi_storey";
export type BlockworkType = "burnt_bricks" | "concrete_blocks" | "machine_cut_blocks";

export interface SuperstructureInput {
  land_size_sqm: number;
  structure_type: StructureType;
  blockwork_type: BlockworkType;
  declared_floor_area_sqm?: number | null;
  bedrooms: number;
  bathrooms: number;
  master_bedrooms?: number;
  living_rooms?: number;
  dining_rooms?: number;
  kitchens?: number;
  additional_rooms?: Record<string, { count: number }>;
  room_size_preference?: "compact" | "standard" | "spacious";
  finishing_level?: "standard" | "premium" | "luxury";
}

export type RoofType = "gable" | "hip" | "flat" | "mono_pitch";
export type RoofCovering = "corrugated_mabati" | "box_profile_mabati" | "stone_coated_tiles" | "clay_tiles";

export interface RoofingInput {
  roof_type: RoofType;
  roof_covering: RoofCovering;
  roof_pitch?: "low" | "medium" | "steep";
  building_footprint_sqm: number;
  storeys: number;
  include_overhangs?: boolean;
}

export interface ServicesFirstFixInput {
  floor_area_sqm: number;
  socket_points?: number;
  lighting_points?: number;
  plumbing_points?: number;
}

export interface ServicesSecondFixInput {
  floor_area_sqm: number;
  switches?: number;
  sockets?: number;
  light_fittings?: number;
  sanitary_fixtures?: number;
}

export interface FinishesInput {
  total_floor_area_sqm: number;
  finishing_level?: "standard" | "premium" | "luxury";
}

export interface ExternalWorksInput {
  driveway_area_sqm?: number;
  landscaping_area_sqm?: number;
  perimeter_wall_length_m?: number;
  include_gate?: boolean;
}

export interface EstimationRequest {
  project_name?: string | null;
  site_survey: SiteSurveyInput;
  site_preparation: SitePreparationInput;
  foundation: FoundationInput;
  superstructure: SuperstructureInput;
  roofing: RoofingInput;
  services_first_fix: ServicesFirstFixInput;
  services_second_fix: ServicesSecondFixInput;
  finishes: FinishesInput;
  external_works: ExternalWorksInput;
  vendor_prices?: Record<string, any>;
}

export interface EstimationListItem {
  id: string;
  project_name?: string | null;
  location?: string | null;
  total_cost: number;
  created_at?: string | null;
}

export interface EstimationDetail {
  id: string;
  summary: {
    total_cost: number;
    material_cost: number;
    labour_cost: number;
    other_cost: number;
    phases_count: number;
  };
  breakdown: any[];
  permits: any[];
  recommendations: any[];
}
