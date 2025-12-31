import { useCallback, useState } from "react";
import type { EstimationRequest, EstimationDetail } from "../services/api/estimationTypes";
import { createEstimation } from "../services/api/estimations";

const emptyRequest: EstimationRequest = {
  project_name: "",
  site_survey: {
    plot_size_sqm: 0,
    location: "",
    include_soil_test: false,
    include_topographical_survey: false,
    survey_quality: "standard",
  },
  site_preparation: {
    plot_size_sqm: 0,
    vegetation_density: "light",
    has_existing_structures: false,
  },
  foundation: {
    soil_type: "",
    foundation_type: "",
    footprint_sqm: 0,
  },
  superstructure: {
    land_size_sqm: 0,
    structure_type: "bungalow",
    blockwork_type: "concrete_blocks",
    declared_floor_area_sqm: undefined,
    bedrooms: 1,
    bathrooms: 1,
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
    building_footprint_sqm: 0,
    storeys: 1,
    include_overhangs: true,
  },
  services_first_fix: {
    floor_area_sqm: 0,
    socket_points: 0,
    lighting_points: 0,
    plumbing_points: 0,
  },
  services_second_fix: {
    floor_area_sqm: 0,
    switches: 0,
    sockets: 0,
    light_fittings: 0,
    sanitary_fixtures: 0,
  },
  finishes: {
    total_floor_area_sqm: 0,
    finishing_level: "standard",
  },
  external_works: {
    driveway_area_sqm: 0,
    landscaping_area_sqm: 0,
    perimeter_wall_length_m: 0,
    include_gate: false,
  },
  vendor_prices: {},
};

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

  const updateSection = useCallback(<K extends keyof EstimationRequest>(key: K, value: EstimationRequest[K]) => {
    setRequest((prev) => ({ ...prev, [key]: value }));
  }, []);

  const submit = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await createEstimation(request);
      setResult(res);
      return res;
    } catch (err: any) {
      setError(err?.detail?.detail || err?.detail || "Failed to create estimation");
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [request]);

  return { request, updateSection, submit, submitting, result, error };
}
