import { useCallback, useState } from "react";
import type { EstimationRequest, EstimationDetail } from "../services/api/estimationTypes";
import { createEstimation } from "../services/api/estimations";

const emptyRequest: EstimationRequest = {
  project_name: undefined,
  site_survey: {
    plot_size_sqm: undefined,
    location: "",
    include_soil_test: false,
    include_topographical_survey: false,
    survey_quality: "standard",
  },
  site_preparation: {
    plot_size_sqm: undefined,
    soil_type: undefined,
    access_difficulty: "normal",
    vegetation_density: "light",
    has_existing_structures: false,
    include_disposal: true,
  },
  foundation: {
    soil_type: undefined,
    foundation_type: "strip",
    floor_area_sqm: undefined,
    quality_level: "standard",
    include_formwork: true,
  },
  superstructure: {
    land_size_sqm: undefined,
    structure_type: "bungalow",
    blockwork_type: "concrete_blocks",
    declared_floor_area_sqm: undefined,
    bedrooms: 3,
    bathrooms: 2,
    master_bedrooms: 0,
    living_rooms: 1,
    dining_rooms: 1,
    kitchens: 1,
    additional_rooms: {},
    room_size_preference: "standard",
    finishing_level: "standard",
  },
  roofing: {
    roof_type: "gable",
    roof_covering: "corrugated_mabati",
    roof_pitch: "medium",
    building_footprint_sqm: undefined,
    storeys: undefined,
    include_overhangs: true,
  },
  services_first_fix: {
    floor_area_sqm: undefined,
    storeys: undefined,
    sockets_per_room: 4,
    light_points_per_room: 2,
    include_hot_water: true,
    include_earthing: true,
  },
  services_second_fix: {
    floor_area_sqm: undefined,
    storeys: undefined,
    sockets_per_room: 4,
    light_points_per_room: 2,
    include_shower_mixers: true,
    include_instant_showers: true,
  },
  finishes: {
    floor_area_sqm: undefined,
    storeys: undefined,
    wall_height_m: 3,
    main_floor_finish: "tile",
    wet_floor_finish: "ceramic_tile",
    ceiling_type: "gypsum_board",
    paint_system: "standard_2_coat",
    include_cornices: true,
    include_skirting: true,
    include_wardrobes: true,
    include_kitchen_cabinets: true,
    joinery_level: "standard",
    quality_level: "standard",
  },
  external_works: {
    land_size_sqm: undefined,
    floor_area_sqm: undefined,
    driveway_area_sqm: undefined,
    landscaping_area_sqm: undefined,
    perimeter_wall_length_m: undefined,
    perimeter_wall_height_m: 2.4,
    perimeter_wall_type: "block_wall",
    perimeter_wall_enabled: false,
    gate_count: 0,
    gate_width_m: 3,
    razor_wire: false,
    paving_area_sqm: undefined,
    drainage_length_m: undefined,
    sewerage_system: "septic_tank",
    sewer_connection_length_m: 10,
    biodigester_capacity_users: 8,
    quality_level: "standard",
  },
  vendor_prices: undefined,
};

const STRUCTURE_TYPES = new Set(["bungalow", "two_storey", "three_storey", "multi_storey"]);
const FOUNDATION_TYPES = new Set(["strip", "raft"]);
const ROOF_TYPES = new Set(["gable", "hip", "flat", "mono_pitch"]);
const ROOF_COVERINGS = new Set([
  "corrugated_mabati",
  "box_profile_mabati",
  "stone_coated_tiles",
  "clay_tiles",
]);
const ROOF_PITCHES = new Set(["low", "medium", "steep"]);
const SOIL_TYPES = new Set(["soft", "medium", "rocky"]);
const MAIN_FLOOR_FINISHES = new Set(["tile", "laminate", "parquet", "polished_screed"]);
const WET_FLOOR_FINISHES = new Set(["ceramic_tile", "porcelain_tile"]);
const CEILING_TYPES = new Set(["gypsum_board", "acoustic_board", "tng", "exposed"]);
const PAINT_SYSTEMS = new Set(["standard_2_coat", "premium_3_coat"]);
const SEWERAGE_SYSTEMS = new Set(["septic_tank", "biodigester", "sewer_connection"]);

type PlainObject = Record<string, unknown>;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function cleanPayloadValue(value: unknown): unknown {
  if (value === undefined || value === null) return undefined;

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  }

  if (typeof value === "number") {
    return Number.isNaN(value) ? undefined : value;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    const cleaned = value
      .map((item) => cleanPayloadValue(item))
      .filter((item) => item !== undefined);
    return cleaned.length > 0 ? cleaned : undefined;
  }

  if (typeof value === "object") {
    const cleanedEntries = Object.entries(value as PlainObject).reduce<PlainObject>((acc, [k, v]) => {
      const cleaned = cleanPayloadValue(v);
      if (cleaned !== undefined) {
        acc[k] = cleaned;
      }
      return acc;
    }, {});
    return Object.keys(cleanedEntries).length > 0 ? cleanedEntries : undefined;
  }

  return undefined;
}

function buildRequestPayload(request: EstimationRequest): EstimationRequest {
  const plotSize = request.site_survey.plot_size_sqm;

  const siteSurvey = cleanPayloadValue({
    ...request.site_survey,
    location: request.site_survey.location,
  }) as EstimationRequest["site_survey"];

  const sitePreparation = cleanPayloadValue({
    ...request.site_preparation,
    plot_size_sqm: request.site_preparation.plot_size_sqm ?? plotSize,
  }) as EstimationRequest["site_preparation"];

  const superstructure = cleanPayloadValue({
    ...request.superstructure,
    land_size_sqm: request.superstructure.land_size_sqm ?? plotSize,
  }) as EstimationRequest["superstructure"];

  const externalWorks = cleanPayloadValue({
    ...request.external_works,
    land_size_sqm: request.external_works.land_size_sqm ?? plotSize,
  }) as EstimationRequest["external_works"];

  const payload = {
    project_name: cleanPayloadValue(request.project_name) as string | undefined,
    site_survey: siteSurvey,
    site_preparation: sitePreparation,
    foundation: cleanPayloadValue(request.foundation) as EstimationRequest["foundation"],
    superstructure,
    roofing: cleanPayloadValue(request.roofing) as EstimationRequest["roofing"],
    services_first_fix: cleanPayloadValue(request.services_first_fix) as EstimationRequest["services_first_fix"],
    services_second_fix: cleanPayloadValue(request.services_second_fix) as EstimationRequest["services_second_fix"],
    finishes: cleanPayloadValue(request.finishes) as EstimationRequest["finishes"],
    external_works: externalWorks,
    vendor_prices: cleanPayloadValue(request.vendor_prices) as Record<string, unknown> | undefined,
  } satisfies EstimationRequest;

  return payload;
}

function validateRequest(request: EstimationRequest): string[] {
  const errors: string[] = [];

  const plot = request.site_survey.plot_size_sqm;
  if (!isFiniteNumber(plot) || plot <= 0) {
    errors.push("Plot size is required and must be greater than 0.");
  }

  if (!request.site_survey.location || request.site_survey.location.trim().length === 0) {
    errors.push("Location is required.");
  }

  if (!STRUCTURE_TYPES.has(request.superstructure.structure_type)) {
    errors.push("Structure type is invalid.");
  }

  if (!isFiniteNumber(request.superstructure.bedrooms) || request.superstructure.bedrooms < 1) {
    errors.push("Bedrooms must be at least 1.");
  }

  if (!isFiniteNumber(request.superstructure.bathrooms) || request.superstructure.bathrooms < 1) {
    errors.push("Bathrooms must be at least 1.");
  }

  if (!SOIL_TYPES.has(request.site_preparation.soil_type || "")) {
    errors.push("Soil type is required.");
  }

  if (!FOUNDATION_TYPES.has(request.foundation.foundation_type)) {
    errors.push("Foundation type is invalid.");
  }

  if (!ROOF_TYPES.has(request.roofing.roof_type)) {
    errors.push("Roof type is invalid.");
  }

  if (!ROOF_COVERINGS.has(request.roofing.roof_covering)) {
    errors.push("Roof covering is invalid.");
  }

  if (request.roofing.roof_pitch && !ROOF_PITCHES.has(request.roofing.roof_pitch)) {
    errors.push("Roof pitch is invalid.");
  }

  if (!MAIN_FLOOR_FINISHES.has(request.finishes.main_floor_finish || "")) {
    errors.push("Main floor finish is required.");
  }

  if (!WET_FLOOR_FINISHES.has(request.finishes.wet_floor_finish || "")) {
    errors.push("Wet floor finish is required.");
  }

  if (!CEILING_TYPES.has(request.finishes.ceiling_type || "")) {
    errors.push("Ceiling type is required.");
  }

  if (!PAINT_SYSTEMS.has(request.finishes.paint_system || "")) {
    errors.push("Paint system is required.");
  }

  if (!SEWERAGE_SYSTEMS.has(request.external_works.sewerage_system || "")) {
    errors.push("Sewerage system is invalid.");
  }

  if (request.external_works.sewerage_system === "biodigester") {
    const users = request.external_works.biodigester_capacity_users;
    if (!isFiniteNumber(users) || users < 1) {
      errors.push("Biodigester capacity users must be at least 1 when biodigester is selected.");
    }
  }

  if (request.external_works.sewerage_system === "sewer_connection") {
    const sewerLength = request.external_works.sewer_connection_length_m;
    if (!isFiniteNumber(sewerLength) || sewerLength <= 0) {
      errors.push("Sewer connection length must be greater than 0 when sewer connection is selected.");
    }
  }

  if (request.external_works.gate_count !== undefined && request.external_works.gate_count < 0) {
    errors.push("Gate count cannot be negative.");
  }

  if (
    request.external_works.gate_width_m !== undefined &&
    (!isFiniteNumber(request.external_works.gate_width_m) || request.external_works.gate_width_m <= 0)
  ) {
    errors.push("Gate width must be greater than 0 when provided.");
  }

  if (
    request.superstructure.declared_floor_area_sqm !== undefined &&
    (!isFiniteNumber(request.superstructure.declared_floor_area_sqm) || request.superstructure.declared_floor_area_sqm <= 0)
  ) {
    errors.push("Declared floor area must be greater than 0 when provided.");
  }

  if (request.finishes.wall_height_m !== undefined && request.finishes.wall_height_m < 2) {
    errors.push("Wall height must be at least 2m.");
  }

  return errors;
}

export function useEstimationWizard(initial?: Partial<EstimationRequest>) {
  const [request, setRequest] = useState<EstimationRequest>({
    ...emptyRequest,
    ...initial,
    site_survey: { ...emptyRequest.site_survey, ...initial?.site_survey },
    site_preparation: { ...emptyRequest.site_preparation, ...initial?.site_preparation },
    foundation: { ...emptyRequest.foundation, ...initial?.foundation },
    superstructure: { ...emptyRequest.superstructure, ...initial?.superstructure },
    roofing: { ...emptyRequest.roofing, ...initial?.roofing },
    services_first_fix: { ...emptyRequest.services_first_fix, ...initial?.services_first_fix },
    services_second_fix: { ...emptyRequest.services_second_fix, ...initial?.services_second_fix },
    finishes: { ...emptyRequest.finishes, ...initial?.finishes },
    external_works: { ...emptyRequest.external_works, ...initial?.external_works },
  });

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<EstimationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const updateSection = useCallback(<K extends keyof EstimationRequest>(key: K, value: EstimationRequest[K]) => {
    setRequest((prev) => ({ ...prev, [key]: value }));
  }, []);

  const submit = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    setValidationErrors([]);
    try {
      const errors = validateRequest(request);
      if (errors.length > 0) {
        setValidationErrors(errors);
        throw new Error(errors[0]);
      }

      const payload = buildRequestPayload(request);
      const res = await createEstimation(payload);
      setResult(res);
      return res;
    } catch (rawError: unknown) {
      const err = rawError as { detail?: unknown; message?: string };
      const responseDetail =
        typeof err?.detail === "object" && err?.detail && "detail" in (err.detail as Record<string, unknown>)
          ? (err.detail as { detail?: string }).detail
          : err?.detail;
      setError(
        (typeof responseDetail === "string" ? responseDetail : undefined) ||
          err?.message ||
          "Failed to create estimation"
      );
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [request]);

  return { request, updateSection, submit, submitting, result, error, validationErrors };
}
