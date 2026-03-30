export interface SiteSurveyInput {
  plot_size_sqm: number;
  location: string;
  include_soil_test?: boolean;
  include_topographical_survey?: boolean;
  survey_quality?: "standard" | "premium";
}

export interface SitePreparationInput {
  plot_size_sqm: number;
  soil_type?: string;
  excavation_depth_m?: number;
  include_disposal?: boolean;
  access_difficulty?: "normal" | "difficult";
  vegetation_density?: "light" | "medium" | "heavy";
  has_existing_structures?: boolean;
}

export interface FoundationInput {
  soil_type: string;
  foundation_type: "strip" | "raft";
  floor_area_sqm: number;
  quality_level?: "standard" | "premium";
  include_formwork?: boolean;
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
  storeys?: number;
  bathrooms?: number;
  kitchens?: number;
  laundry_rooms?: number;
  sockets_per_room?: number;
  light_points_per_room?: number;
  quality_level?: "standard" | "premium";
  include_hot_water?: boolean;
  include_earthing?: boolean;
}

export interface ServicesSecondFixInput {
  floor_area_sqm: number;
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
  quality_level?: "standard" | "premium";
}

export interface FinishesInput {
  floor_area_sqm: number;
  storeys?: number;
  wall_height_m?: number;
  bedrooms?: number;
  bathrooms?: number;
  kitchens?: number;
  living_rooms?: number;
  dining_rooms?: number;
  other_rooms?: number;
  main_floor_finish?: "tile" | "laminate" | "parquet" | "polished_screed";
  wet_floor_finish?: "ceramic_tile" | "porcelain_tile";
  wet_wall_tiling?: boolean;
  ceiling_type?: "gypsum_board" | "acoustic_board" | "tng" | "exposed";
  paint_system?: "standard_2_coat" | "premium_3_coat";
  include_cornices?: boolean;
  include_skirting?: boolean;
  include_wardrobes?: boolean;
  include_kitchen_cabinets?: boolean;
  joinery_level?: "standard" | "premium";
  quality_level?: "standard" | "premium" | "luxury";
}

export interface ExternalWorksInput {
  land_size_sqm?: number;
  floor_area_sqm?: number;
  perimeter_wall_enabled?: boolean;
  perimeter_wall_type?: "block_wall" | "precast" | "chain_link" | "none";
  driveway_area_sqm?: number;
  landscaping_area_sqm?: number;
  perimeter_wall_length_m?: number;
  perimeter_wall_height_m?: number;
  gate_count?: number;
  gate_width_m?: number;
  razor_wire?: boolean;
  paving_area_sqm?: number;
  drainage_length_m?: number;
  include_gate?: boolean;
  sewerage_system?: "septic_tank" | "sewer_connection" | "biodigester";
  sewer_connection_length_m?: number;
  biodigester_capacity_users?: number;
  quality_level?: "standard" | "premium";
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

export interface ProjectDetails {
  project_name?: string | null;
  location?: string | null;
  bedrooms?: number;
  bathrooms?: number;
  floor_area_sqm?: number | null;
  structure_type?: StructureType;
  finishing_level?: "standard" | "premium" | "luxury";
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

export interface EstimationDetail {
  id: string;
  summary: {
    total_cost: number;
    material_cost: number;
    labour_cost: number;
    other_cost: number;
    phases_count: number;
  };
  project_details?: ProjectDetails;
  breakdown: any[];
  permits: Permit[];
  recommendations: any[];
}
