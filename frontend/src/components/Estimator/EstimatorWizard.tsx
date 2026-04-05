import React, { useCallback, useMemo, useState } from "react";

import { mapEstimationDetailToBreakdown } from "../../hooks/Estimator/estimationMapper";
import { useEstimationWizard } from "../../hooks/useEstimationWizard";
import type { EstimationRequest } from "../../services/api/estimationTypes";
import EstimatorBreakdown from "./EstimatorBreakdown";

type ErrorGroups = {
  project: string[];
  building: string[];
  shell: string[];
  roofing: string[];
  services: string[];
  finishes: string[];
  external: string[];
};

const emptyGroups = (): ErrorGroups => ({
  project: [],
  building: [],
  shell: [],
  roofing: [],
  services: [],
  finishes: [],
  external: [],
});

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100";
const helpClass = "mt-1 text-xs text-gray-500 dark:text-gray-400";
const fieldErrorClass = "mt-1 text-xs text-red-700 dark:text-red-300";

const FormSection: React.FC<{
  title: string;
  description: string;
  errors?: string[];
  children: React.ReactNode;
}> = ({ title, description, errors = [], children }) => (
  <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-4">
    <div>
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
    {errors.length > 0 && (
      <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-200">
        <ul className="list-disc list-inside space-y-0.5">
          {errors.map((entry) => (
            <li key={entry}>{entry}</li>
          ))}
        </ul>
      </div>
    )}
    {children}
  </section>
);

const Field: React.FC<{
  label: string;
  help?: string;
  required?: boolean;
  error?: string;
  showError?: boolean;
  children: React.ReactNode;
}> = ({ label, help, required = false, error, showError = false, children }) => (
  <label className="block">
    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
      {label}
      {required ? <span className="text-red-600 dark:text-red-400"> *</span> : null}
    </span>
    {children}
    {help ? <p className={helpClass}>{help}</p> : null}
    {showError && error ? <p className={fieldErrorClass}>{error}</p> : null}
  </label>
);

const AdvancedPanel: React.FC<{
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, description, defaultOpen = false, children }) => (
  <details
    open={defaultOpen}
    className="rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30"
  >
    <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden px-3 py-2 flex items-center justify-between">
      <div>
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</div>
        {description ? <div className="text-xs text-gray-600 dark:text-gray-400">{description}</div> : null}
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">Expand</span>
    </summary>
    <div className="px-3 pb-3 pt-1">{children}</div>
  </details>
);

function labelize(value?: string | null): string {
  if (!value) return "N/A";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const ToggleField: React.FC<{
  label: string;
  help?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, help, checked, onChange }) => (
  <label className="flex items-start gap-2 rounded-md border border-gray-200 dark:border-gray-700 p-3">
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="mt-0.5 h-4 w-4 rounded border-gray-300 dark:border-gray-600"
    />
    <span className="min-w-0">
      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</span>
      {help ? <p className={helpClass}>{help}</p> : null}
    </span>
  </label>
);

function groupErrors(errors: string[]): ErrorGroups {
  const groups = emptyGroups();
  for (const error of errors) {
    const text = error.toLowerCase();
    if (text.includes("plot size") || text.includes("location")) groups.project.push(error);
    else if (
      text.includes("structure type") ||
      text.includes("bedrooms") ||
      text.includes("bathrooms") ||
      text.includes("kitchens")
    )
      groups.building.push(error);
    else if (text.includes("soil type") || text.includes("foundation")) groups.shell.push(error);
    else if (text.includes("roof")) groups.roofing.push(error);
    else if (
      text.includes("main floor") ||
      text.includes("wet floor") ||
      text.includes("ceiling") ||
      text.includes("paint") ||
      text.includes("wall height")
    )
      groups.finishes.push(error);
    else if (text.includes("sewer") || text.includes("biodigester") || text.includes("gate"))
      groups.external.push(error);
    else groups.services.push(error);
  }
  return groups;
}

const EstimatorWizard: React.FC = () => {
  const { request, updateSection, submit, submitting, result, error, validationErrors } =
    useEstimationWizard();
  const [status, setStatus] = useState<string | null>(null);
  const [view, setView] = useState<"form" | "summary" | "breakdown">("form");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const parseOptionalNumber = useCallback((value: string): number | undefined => {
    if (value.trim() === "") return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, []);

  const parseRequiredNumber = useCallback(
    (value: string, fallback: number, min = 0): number => {
      const parsed = parseOptionalNumber(value);
      if (parsed === undefined) return fallback;
      return Math.max(min, parsed);
    },
    [parseOptionalNumber]
  );

  const parseRequiredInteger = useCallback(
    (value: string, fallback: number, min = 0): number => {
      const parsed = parseOptionalNumber(value);
      if (parsed === undefined) return fallback;
      return Math.max(min, Math.round(parsed));
    },
    [parseOptionalNumber]
  );

  const handleSection = useCallback(
    <K extends keyof EstimationRequest, F extends keyof EstimationRequest[K]>(
      section: K,
      field: F,
      value: EstimationRequest[K][F]
    ) => {
      updateSection(section, {
        ...(request[section] as Record<string, unknown>),
        [field]: value,
      } as EstimationRequest[K]);
    },
    [request, updateSection]
  );

  const uiBreakdown = useMemo(() => {
    if (!result) return null;
    return mapEstimationDetailToBreakdown(result, {
      request,
      projectName: request.project_name,
      finishing: request.superstructure.finishing_level,
    });
  }, [result, request]);

  const groupedErrors = useMemo(() => groupErrors(validationErrors), [validationErrors]);

  const plotSize = request.site_survey.plot_size_sqm;
  const roofIsFlat = request.roofing.roof_type === "flat";
  const sewerageSystem = request.external_works.sewerage_system ?? "septic_tank";
  const boundaryEnabled = request.external_works.perimeter_wall_enabled ?? false;
  const gateCount = request.external_works.gate_count ?? 0;
  const showGateWidth = boundaryEnabled && gateCount > 0;
  const additionalOtherRooms = request.superstructure.additional_rooms?.other?.count ?? 0;
  const joineryEnabled =
    (request.finishes.include_wardrobes ?? false) ||
    (request.finishes.include_kitchen_cabinets ?? false) ||
    (request.finishes.include_bathroom_cabinetry ?? false) ||
    (request.finishes.include_store_cabinetry ?? false);

  const inlineErrors = useMemo(() => {
    const errors: Record<string, string> = {};

    if (!request.site_survey.location.trim()) {
      errors["site_survey.location"] = "Location is required.";
    }
    if (!request.site_survey.plot_size_sqm || request.site_survey.plot_size_sqm <= 0) {
      errors["site_survey.plot_size_sqm"] = "Plot size is required and must be greater than 0.";
    }
    if (!request.site_preparation.soil_type) {
      errors["site_preparation.soil_type"] = "Soil type is required.";
    }
    if (request.superstructure.bedrooms < 1) {
      errors["superstructure.bedrooms"] = "Bedrooms must be at least 1.";
    }
    if (request.superstructure.bathrooms < 1) {
      errors["superstructure.bathrooms"] = "Bathrooms must be at least 1.";
    }
    if ((request.superstructure.kitchens ?? 0) < 1) {
      errors["superstructure.kitchens"] = "Kitchens must be at least 1.";
    }
    if (
      request.superstructure.declared_floor_area_sqm !== undefined &&
      request.superstructure.declared_floor_area_sqm <= 0
    ) {
      errors["superstructure.declared_floor_area_sqm"] =
        "Declared floor area must be greater than 0 when provided.";
    }
    if (sewerageSystem === "biodigester") {
      if (
        request.external_works.biodigester_capacity_users === undefined ||
        request.external_works.biodigester_capacity_users < 1
      ) {
        errors["external_works.biodigester_capacity_users"] =
          "Biodigester capacity is required and must be at least 1 user.";
      }
    }
    if (sewerageSystem === "sewer_connection") {
      if (
        request.external_works.sewer_connection_length_m === undefined ||
        request.external_works.sewer_connection_length_m <= 0
      ) {
        errors["external_works.sewer_connection_length_m"] =
          "Sewer connection length is required and must be greater than 0.";
      }
    }
    if (showGateWidth && request.external_works.gate_width_m !== undefined && request.external_works.gate_width_m <= 0) {
      errors["external_works.gate_width_m"] = "Gate width must be greater than 0.";
    }
    if (request.finishes.wall_height_m !== undefined && request.finishes.wall_height_m < 2) {
      errors["finishes.wall_height_m"] = "Wall height must be at least 2m.";
    }

    return errors;
  }, [request, sewerageSystem, showGateWidth]);

  const markFieldTouched = useCallback((fieldKey: string) => {
    setTouchedFields((prev) => (prev[fieldKey] ? prev : { ...prev, [fieldKey]: true }));
  }, []);

  const showFieldError = useCallback(
    (fieldKey: string) => Boolean(inlineErrors[fieldKey] && (submitAttempted || touchedFields[fieldKey])),
    [inlineErrors, submitAttempted, touchedFields]
  );

  const handlePlotSizeChange = useCallback(
    (rawValue: string) => {
      const nextValue = parseOptionalNumber(rawValue);
      handleSection("site_survey", "plot_size_sqm", nextValue);
      handleSection("site_preparation", "plot_size_sqm", nextValue);
      handleSection("superstructure", "land_size_sqm", nextValue);
      handleSection("external_works", "land_size_sqm", nextValue);
    },
    [handleSection, parseOptionalNumber]
  );

  const handleSoilTypeChange = useCallback(
    (value: string) => {
      const nextValue =
        value.trim() === ""
          ? undefined
          : (value as EstimationRequest["site_preparation"]["soil_type"]);
      handleSection("site_preparation", "soil_type", nextValue);
      handleSection("foundation", "soil_type", nextValue);
    },
    [handleSection]
  );

  const handleSynchronizedSockets = useCallback(
    (rawValue: string) => {
      const sockets = parseRequiredInteger(
        rawValue,
        request.services_first_fix.sockets_per_room ?? 4,
        0
      );
      handleSection("services_first_fix", "sockets_per_room", sockets);
      handleSection("services_second_fix", "sockets_per_room", sockets);
    },
    [handleSection, parseRequiredInteger, request.services_first_fix.sockets_per_room]
  );

  const handleSynchronizedLights = useCallback(
    (rawValue: string) => {
      const lights = parseRequiredInteger(
        rawValue,
        request.services_first_fix.light_points_per_room ?? 2,
        0
      );
      handleSection("services_first_fix", "light_points_per_room", lights);
      handleSection("services_second_fix", "light_points_per_room", lights);
    },
    [handleSection, parseRequiredInteger, request.services_first_fix.light_points_per_room]
  );

  const handleSubmit = async () => {
    setStatus(null);
    setSubmitAttempted(true);
    try {
      await submit();
      setStatus("Estimate generated");
      setTouchedFields({});
      setSubmitAttempted(false);
      setView("summary");
    } catch (submitError: unknown) {
      const err = submitError as { detail?: unknown; message?: string };
      const detail = err?.detail || err?.message || "Failed to create estimation";
      setStatus(typeof detail === "string" ? detail : JSON.stringify(detail));
    }
  };

  if (view !== "form" && uiBreakdown) {
    if (view === "summary") {
      const phaseConfidences = uiBreakdown.phases.map((phase) => phase.metadata.confidence);
      const summaryConfidence = phaseConfidences.includes("low")
        ? "low"
        : phaseConfidences.includes("medium")
          ? "medium"
          : "high";
      const pricingSources = Array.from(
        new Set(uiBreakdown.phases.map((phase) => phase.metadata.pricingSource).filter(Boolean))
      );
      const pricingSourceSummary =
        pricingSources.length === 0
          ? "N/A"
          : pricingSources.length === 1
            ? labelize(pricingSources[0])
            : `${pricingSources.length} sources`;

      return (
        <div className="mx-auto max-w-4xl px-4 py-6 space-y-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Estimate Summary
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {uiBreakdown.projectTitle} - KSh {uiBreakdown.totalCost.toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-700"
                onClick={() => setView("form")}
              >
                Start New
              </button>
              <button
                className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => setView("breakdown")}
              >
                View Breakdown
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Cost Snapshot</div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="p-3 rounded border border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                  <div className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100">
                    KSh {uiBreakdown.totalCost.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded border border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Materials</div>
                  <div className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100">
                    KSh {uiBreakdown.materialCost.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded border border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Labour</div>
                  <div className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100">
                    KSh {uiBreakdown.labourCost.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded border border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Equipment</div>
                  <div className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100">
                    KSh {uiBreakdown.equipmentCost.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded border border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Other</div>
                  <div className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100">
                    KSh {uiBreakdown.otherCost.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Project & Building Snapshot
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Plot Size</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {request.site_survey.plot_size_sqm
                        ? `${request.site_survey.plot_size_sqm.toLocaleString()} sqm`
                        : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Estimated Floor Area</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {uiBreakdown.floorArea ? `${uiBreakdown.floorArea.toLocaleString()} sqm` : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Structure Type</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {labelize(uiBreakdown.structureType)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Storeys</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {uiBreakdown.storeys || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Bedrooms / Bathrooms</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {uiBreakdown.bedrooms ?? "N/A"} / {uiBreakdown.bathrooms ?? "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Phases</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {uiBreakdown.phasesCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Foundation</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {labelize(request.foundation.foundation_type)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Roof</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {labelize(request.roofing.roof_type)} / {labelize(request.roofing.roof_covering)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Reliability & Pricing Context
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded border border-gray-200 dark:border-gray-700 px-3 py-2">
                    <span className="text-gray-600 dark:text-gray-400">Confidence</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {labelize(summaryConfidence)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded border border-gray-200 dark:border-gray-700 px-3 py-2">
                    <span className="text-gray-600 dark:text-gray-400">Pricing Source</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {pricingSourceSummary}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded border border-gray-200 dark:border-gray-700 px-3 py-2">
                    <span className="text-gray-600 dark:text-gray-400">Sewerage System</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {labelize(request.external_works.sewerage_system)}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  Confidence and pricing source are aggregated from phase-level v2 metadata.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-6xl px-4 py-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow">
        <EstimatorBreakdown data={uiBreakdown} onBackToSummary={() => setView("summary")} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-5 bg-surface-light dark:bg-surface-dark rounded-xl shadow">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Estimator Input
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Fill in the basic inputs first. Advanced fields refine accuracy when needed.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdvanced((value) => !value)}
          className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-700"
        >
          {showAdvanced ? "Hide Advanced" : "Show Advanced"}
        </button>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-900/30 dark:text-blue-100">
        <p className="font-medium mb-1">Fields marked * are required.</p>
        Floor area can be derived from your room program if not provided. Geometry override
        fields are available only under Advanced and are intended for compatibility/debug use.
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 text-sm">
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-medium">Derived geometry basis:</span> Plot size{" "}
          <span className="font-semibold">
            {plotSize ? `${plotSize.toLocaleString()} sqm` : "Not set"}
          </span>
          , Structure <span className="font-semibold">{request.superstructure.structure_type}</span>,
          Declared floor area{" "}
          <span className="font-semibold">
            {request.superstructure.declared_floor_area_sqm
              ? `${request.superstructure.declared_floor_area_sqm.toLocaleString()} sqm`
              : "Auto from room program"}
          </span>
          .
        </p>
      </div>

      <FormSection
        title="Basic: Project / Site"
        description="Core site details that all downstream phases depend on."
        errors={groupedErrors.project}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Project Name" help="Optional display name for your estimate.">
            <input
              className={inputClass}
              value={request.project_name ?? ""}
              onChange={(event) => updateSection("project_name", event.target.value.trim() || undefined)}
            />
          </Field>
          <Field
            label="Location"
            help="Required for location-aware defaults and summary context."
            required
            error={inlineErrors["site_survey.location"]}
            showError={showFieldError("site_survey.location")}
          >
            <input
              className={inputClass}
              value={request.site_survey.location}
              onChange={(event) => handleSection("site_survey", "location", event.target.value)}
              onBlur={() => markFieldTouched("site_survey.location")}
            />
          </Field>
          <Field
            label="Plot Size (sqm)"
            help="Required. Used as the main upstream geometry driver."
            required
            error={inlineErrors["site_survey.plot_size_sqm"]}
            showError={showFieldError("site_survey.plot_size_sqm")}
          >
            <input
              type="number"
              min={1}
              step="0.1"
              className={inputClass}
              value={request.site_survey.plot_size_sqm ?? ""}
              onChange={(event) => handlePlotSizeChange(event.target.value)}
              onBlur={() => markFieldTouched("site_survey.plot_size_sqm")}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Basic: Building Geometry / Program"
        description="Core room program and structure selections used to resolve floor area."
        errors={groupedErrors.building}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Structure Type" required>
            <select
              className={inputClass}
              value={request.superstructure.structure_type}
              onChange={(event) =>
                handleSection(
                  "superstructure",
                  "structure_type",
                  event.target.value as EstimationRequest["superstructure"]["structure_type"]
                )
              }
            >
              <option value="bungalow">Bungalow</option>
              <option value="two_storey">Two Storey</option>
              <option value="three_storey">Three Storey</option>
              <option value="multi_storey">Multi Storey</option>
            </select>
          </Field>
          <Field
            label="Declared Floor Area (sqm)"
            help="Optional. Leave empty to derive area from room program."
            error={inlineErrors["superstructure.declared_floor_area_sqm"]}
            showError={showFieldError("superstructure.declared_floor_area_sqm")}
          >
            <input
              type="number"
              min={1}
              step="0.1"
              className={inputClass}
              value={request.superstructure.declared_floor_area_sqm ?? ""}
              onChange={(event) =>
                handleSection(
                  "superstructure",
                  "declared_floor_area_sqm",
                  parseOptionalNumber(event.target.value)
                )
              }
              onBlur={() => markFieldTouched("superstructure.declared_floor_area_sqm")}
            />
          </Field>
          <Field
            label="Bedrooms"
            required
            error={inlineErrors["superstructure.bedrooms"]}
            showError={showFieldError("superstructure.bedrooms")}
          >
            <input
              type="number"
              min={1}
              className={inputClass}
              value={request.superstructure.bedrooms}
              onChange={(event) =>
                handleSection(
                  "superstructure",
                  "bedrooms",
                  parseRequiredInteger(event.target.value, request.superstructure.bedrooms, 1)
                )
              }
              onBlur={() => markFieldTouched("superstructure.bedrooms")}
            />
          </Field>
          <Field
            label="Bathrooms"
            required
            error={inlineErrors["superstructure.bathrooms"]}
            showError={showFieldError("superstructure.bathrooms")}
          >
            <input
              type="number"
              min={1}
              className={inputClass}
              value={request.superstructure.bathrooms}
              onChange={(event) =>
                handleSection(
                  "superstructure",
                  "bathrooms",
                  parseRequiredInteger(event.target.value, request.superstructure.bathrooms, 1)
                )
              }
              onBlur={() => markFieldTouched("superstructure.bathrooms")}
            />
          </Field>
          <Field
            label="Kitchens"
            required
            error={inlineErrors["superstructure.kitchens"]}
            showError={showFieldError("superstructure.kitchens")}
          >
            <input
              type="number"
              min={1}
              className={inputClass}
              value={request.superstructure.kitchens ?? 1}
              onChange={(event) =>
                handleSection(
                  "superstructure",
                  "kitchens",
                  parseRequiredInteger(event.target.value, request.superstructure.kitchens ?? 1, 1)
                )
              }
              onBlur={() => markFieldTouched("superstructure.kitchens")}
            />
          </Field>
          <Field label="Living Rooms">
            <input
              type="number"
              min={0}
              className={inputClass}
              value={request.superstructure.living_rooms ?? 1}
              onChange={(event) =>
                handleSection(
                  "superstructure",
                  "living_rooms",
                  parseRequiredInteger(event.target.value, request.superstructure.living_rooms ?? 1, 0)
                )
              }
            />
          </Field>
          <Field label="Dining Rooms">
            <input
              type="number"
              min={0}
              className={inputClass}
              value={request.superstructure.dining_rooms ?? 1}
              onChange={(event) =>
                handleSection(
                  "superstructure",
                  "dining_rooms",
                  parseRequiredInteger(event.target.value, request.superstructure.dining_rooms ?? 1, 0)
                )
              }
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Basic: Structure / Shell"
        description="Foundation, blockwork, and site constraints for the main structure."
        errors={groupedErrors.shell}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field
            label="Soil Type"
            required
            error={inlineErrors["site_preparation.soil_type"]}
            showError={showFieldError("site_preparation.soil_type")}
          >
            <select
              className={inputClass}
              value={request.site_preparation.soil_type ?? ""}
              onChange={(event) => handleSoilTypeChange(event.target.value)}
              onBlur={() => markFieldTouched("site_preparation.soil_type")}
            >
              <option value="">Select soil type</option>
              <option value="soft">Soft</option>
              <option value="medium">Medium</option>
              <option value="rocky">Rocky</option>
            </select>
          </Field>
          <Field label="Foundation Type" required>
            <select
              className={inputClass}
              value={request.foundation.foundation_type}
              onChange={(event) =>
                handleSection(
                  "foundation",
                  "foundation_type",
                  event.target.value as EstimationRequest["foundation"]["foundation_type"]
                )
              }
            >
              <option value="strip">Strip Foundation</option>
              <option value="raft">Raft Foundation</option>
            </select>
          </Field>
          <Field label="Blockwork Type" required>
            <select
              className={inputClass}
              value={request.superstructure.blockwork_type}
              onChange={(event) =>
                handleSection(
                  "superstructure",
                  "blockwork_type",
                  event.target.value as EstimationRequest["superstructure"]["blockwork_type"]
                )
              }
            >
              <option value="burnt_bricks">Burnt Bricks</option>
              <option value="concrete_blocks">Concrete Blocks</option>
              <option value="machine_cut_blocks">Machine Cut Blocks</option>
            </select>
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Basic: Roofing"
        description="Primary roof system selections used for roofing quantities."
        errors={groupedErrors.roofing}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Roof Type" required>
            <select
              className={inputClass}
              value={request.roofing.roof_type}
              onChange={(event) => {
                const nextType = event.target.value as EstimationRequest["roofing"]["roof_type"];
                handleSection("roofing", "roof_type", nextType);
                if (nextType === "flat") {
                  handleSection("roofing", "roof_pitch", undefined);
                  handleSection("roofing", "include_overhangs", false);
                }
              }}
            >
              <option value="gable">Gable</option>
              <option value="hip">Hip</option>
              <option value="flat">Flat</option>
              <option value="mono_pitch">Mono Pitch</option>
            </select>
          </Field>
          <Field label="Roof Covering" required>
            <select
              className={inputClass}
              value={request.roofing.roof_covering}
              onChange={(event) =>
                handleSection(
                  "roofing",
                  "roof_covering",
                  event.target.value as EstimationRequest["roofing"]["roof_covering"]
                )
              }
            >
              <option value="corrugated_mabati">Corrugated Mabati</option>
              <option value="box_profile_mabati">Box Profile Mabati</option>
              <option value="stone_coated_tiles">Stone Coated Tiles</option>
              <option value="clay_tiles">Clay Tiles</option>
            </select>
          </Field>
          {roofIsFlat ? (
            <div className="rounded-md border border-gray-200 dark:border-gray-700 p-3 text-sm text-gray-600 dark:text-gray-300">
              Roof pitch and overhang refinements are hidden for flat roof type.
            </div>
          ) : (
            <Field label="Roof Pitch" required>
              <select
                className={inputClass}
                value={request.roofing.roof_pitch ?? "medium"}
                onChange={(event) =>
                  handleSection(
                    "roofing",
                    "roof_pitch",
                    event.target.value as EstimationRequest["roofing"]["roof_pitch"]
                  )
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="steep">Steep</option>
              </select>
            </Field>
          )}
        </div>
      </FormSection>
      <FormSection
        title="Basic: Services"
        description="Core first-fix and second-fix service intensity controls."
        errors={groupedErrors.services}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Sockets per Room"
            help="Applied as the baseline for both first-fix and second-fix services."
            required
          >
            <input
              type="number"
              min={0}
              className={inputClass}
              value={request.services_first_fix.sockets_per_room ?? 4}
              onChange={(event) => handleSynchronizedSockets(event.target.value)}
            />
          </Field>
          <Field
            label="Light Points per Room"
            help="Applied as the baseline for both first-fix and second-fix services."
            required
          >
            <input
              type="number"
              min={0}
              className={inputClass}
              value={request.services_first_fix.light_points_per_room ?? 2}
              onChange={(event) => handleSynchronizedLights(event.target.value)}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Basic: Finishes"
        description="Main finish profile used by finishing quantities and pricing."
        errors={groupedErrors.finishes}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Field label="Main Floor Finish" required>
            <select
              className={inputClass}
              value={request.finishes.main_floor_finish ?? "tile"}
              onChange={(event) =>
                handleSection(
                  "finishes",
                  "main_floor_finish",
                  event.target.value as EstimationRequest["finishes"]["main_floor_finish"]
                )
              }
            >
              <option value="tile">Tile</option>
              <option value="laminate">Laminate</option>
              <option value="parquet">Parquet</option>
              <option value="polished_screed">Polished Screed</option>
            </select>
          </Field>
          <Field label="Wet Area Floor Finish" required>
            <select
              className={inputClass}
              value={request.finishes.wet_floor_finish ?? "ceramic_tile"}
              onChange={(event) =>
                handleSection(
                  "finishes",
                  "wet_floor_finish",
                  event.target.value as EstimationRequest["finishes"]["wet_floor_finish"]
                )
              }
            >
              <option value="ceramic_tile">Ceramic Tile</option>
              <option value="porcelain_tile">Porcelain Tile</option>
            </select>
          </Field>
          <Field label="Ceiling Type" required>
            <select
              className={inputClass}
              value={request.finishes.ceiling_type ?? "gypsum_board"}
              onChange={(event) =>
                handleSection(
                  "finishes",
                  "ceiling_type",
                  event.target.value as EstimationRequest["finishes"]["ceiling_type"]
                )
              }
            >
              <option value="gypsum_board">Gypsum Board</option>
              <option value="acoustic_board">Acoustic Board</option>
              <option value="tng">T&amp;G</option>
              <option value="exposed">Exposed</option>
            </select>
          </Field>
          <Field label="Paint System" required>
            <select
              className={inputClass}
              value={request.finishes.paint_system ?? "standard_2_coat"}
              onChange={(event) =>
                handleSection(
                  "finishes",
                  "paint_system",
                  event.target.value as EstimationRequest["finishes"]["paint_system"]
                )
              }
            >
              <option value="standard_2_coat">Standard (2 Coat)</option>
              <option value="premium_3_coat">Premium (3 Coat)</option>
            </select>
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Basic: External Works"
        description="Boundary and sewerage controls for the main site external scope."
        errors={groupedErrors.external}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ToggleField
            label="Include Boundary Works"
            help="Enable wall/fence and gate scopes."
            checked={boundaryEnabled}
            onChange={(checked) => handleSection("external_works", "perimeter_wall_enabled", checked)}
          />
          {boundaryEnabled ? (
            <Field label="Boundary Type">
              <select
                className={inputClass}
                value={request.external_works.perimeter_wall_type ?? "block_wall"}
                onChange={(event) =>
                  handleSection(
                    "external_works",
                    "perimeter_wall_type",
                    event.target.value as EstimationRequest["external_works"]["perimeter_wall_type"]
                  )
                }
              >
                <option value="block_wall">Block Wall</option>
                <option value="chain_link">Chain Link</option>
                <option value="precast">Precast</option>
                <option value="none">None</option>
              </select>
            </Field>
          ) : (
            <div className="text-sm text-gray-600 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-700 p-3">
              Boundary-specific inputs appear only when boundary works are enabled.
            </div>
          )}
          {boundaryEnabled ? (
            <Field label="Gate Count">
              <input
                type="number"
                min={0}
                className={inputClass}
                value={gateCount}
                onChange={(event) =>
                  handleSection(
                    "external_works",
                    "gate_count",
                    parseRequiredInteger(event.target.value, gateCount, 0)
                  )
                }
              />
            </Field>
          ) : (
            <div />
          )}
          <Field label="Sewerage System" required>
            <select
              className={inputClass}
              value={sewerageSystem}
              onChange={(event) =>
                handleSection(
                  "external_works",
                  "sewerage_system",
                  event.target.value as EstimationRequest["external_works"]["sewerage_system"]
                )
              }
              onBlur={() => markFieldTouched("external_works.sewerage_system")}
            >
              <option value="septic_tank">Septic Tank</option>
              <option value="biodigester">Biodigester</option>
              <option value="sewer_connection">Sewer Connection</option>
            </select>
          </Field>
          {showGateWidth ? (
            <Field
              label="Gate Width (m)"
              help="Shown only when boundary works and gate count are enabled."
              error={inlineErrors["external_works.gate_width_m"]}
              showError={showFieldError("external_works.gate_width_m")}
            >
              <input
                type="number"
                min={0.1}
                step="0.1"
                className={inputClass}
                value={request.external_works.gate_width_m ?? ""}
                onChange={(event) =>
                  handleSection(
                    "external_works",
                    "gate_width_m",
                    parseOptionalNumber(event.target.value)
                  )
                }
                onBlur={() => markFieldTouched("external_works.gate_width_m")}
              />
            </Field>
          ) : (
            <div />
          )}
          {sewerageSystem === "biodigester" ? (
            <Field
              label="Biodigester Capacity (users)"
              required
              error={inlineErrors["external_works.biodigester_capacity_users"]}
              showError={showFieldError("external_works.biodigester_capacity_users")}
            >
              <input
                type="number"
                min={1}
                className={inputClass}
                value={request.external_works.biodigester_capacity_users ?? ""}
                onChange={(event) =>
                  handleSection(
                    "external_works",
                    "biodigester_capacity_users",
                    parseOptionalNumber(event.target.value)
                  )
                }
                onBlur={() => markFieldTouched("external_works.biodigester_capacity_users")}
              />
            </Field>
          ) : sewerageSystem === "sewer_connection" ? (
            <Field
              label="Sewer Connection Length (m)"
              required
              error={inlineErrors["external_works.sewer_connection_length_m"]}
              showError={showFieldError("external_works.sewer_connection_length_m")}
            >
              <input
                type="number"
                min={0.1}
                step="0.1"
                className={inputClass}
                value={request.external_works.sewer_connection_length_m ?? ""}
                onChange={(event) =>
                  handleSection(
                    "external_works",
                    "sewer_connection_length_m",
                    parseOptionalNumber(event.target.value)
                  )
                }
                onBlur={() => markFieldTouched("external_works.sewer_connection_length_m")}
              />
            </Field>
          ) : (
            <div />
          )}
        </div>
      </FormSection>

      {showAdvanced ? (
        <FormSection
          title="Advanced Inputs"
          description="Optional refinements and compatibility overrides."
        >
          <div className="space-y-6">
            <AdvancedPanel
              title="Survey / Site Prep refinements"
              description="Survey quality and site preparation scope controls."
              defaultOpen
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ToggleField
                  label="Include Soil Test"
                  checked={request.site_survey.include_soil_test ?? false}
                  onChange={(checked) => handleSection("site_survey", "include_soil_test", checked)}
                />
                <ToggleField
                  label="Include Topographical Survey"
                  checked={request.site_survey.include_topographical_survey ?? false}
                  onChange={(checked) =>
                    handleSection("site_survey", "include_topographical_survey", checked)
                  }
                />
                <Field label="Survey Quality">
                  <select
                    className={inputClass}
                    value={request.site_survey.survey_quality ?? "standard"}
                    onChange={(event) =>
                      handleSection(
                        "site_survey",
                        "survey_quality",
                        event.target.value as EstimationRequest["site_survey"]["survey_quality"]
                      )
                    }
                  >
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                  </select>
                </Field>
                <Field label="Excavation Depth (m)">
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    className={inputClass}
                    value={request.site_preparation.excavation_depth_m ?? ""}
                    onChange={(event) =>
                      handleSection(
                        "site_preparation",
                        "excavation_depth_m",
                        parseOptionalNumber(event.target.value)
                      )
                    }
                  />
                </Field>
                <Field label="Access Difficulty">
                  <select
                    className={inputClass}
                    value={request.site_preparation.access_difficulty ?? "normal"}
                    onChange={(event) =>
                      handleSection(
                        "site_preparation",
                        "access_difficulty",
                        event.target.value as EstimationRequest["site_preparation"]["access_difficulty"]
                      )
                    }
                  >
                    <option value="normal">Normal</option>
                    <option value="difficult">Difficult</option>
                  </select>
                </Field>
                <Field label="Vegetation Density">
                  <select
                    className={inputClass}
                    value={request.site_preparation.vegetation_density ?? "light"}
                    onChange={(event) =>
                      handleSection(
                        "site_preparation",
                        "vegetation_density",
                        event.target.value as EstimationRequest["site_preparation"]["vegetation_density"]
                      )
                    }
                  >
                    <option value="light">Light</option>
                    <option value="medium">Medium</option>
                    <option value="heavy">Heavy</option>
                  </select>
                </Field>
                <ToggleField
                  label="Has Existing Structures"
                  checked={request.site_preparation.has_existing_structures ?? false}
                  onChange={(checked) =>
                    handleSection("site_preparation", "has_existing_structures", checked)
                  }
                />
                <ToggleField
                  label="Include Disposal"
                  checked={request.site_preparation.include_disposal ?? true}
                  onChange={(checked) => handleSection("site_preparation", "include_disposal", checked)}
                />
                <ToggleField
                  label="Include Foundation Formwork"
                  checked={request.foundation.include_formwork ?? true}
                  onChange={(checked) => handleSection("foundation", "include_formwork", checked)}
                />
              </div>
            </AdvancedPanel>

            <AdvancedPanel
              title="Building / Program refinements"
              description="Detailed room-program and superstructure preferences."
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Room Size Preference">
                  <select
                    className={inputClass}
                    value={request.superstructure.room_size_preference ?? "standard"}
                    onChange={(event) =>
                      handleSection(
                        "superstructure",
                        "room_size_preference",
                        event.target.value as EstimationRequest["superstructure"]["room_size_preference"]
                      )
                    }
                  >
                    <option value="compact">Compact</option>
                    <option value="standard">Standard</option>
                    <option value="spacious">Spacious</option>
                  </select>
                </Field>
                <Field label="Master Bedrooms">
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    value={request.superstructure.master_bedrooms ?? 0}
                    onChange={(event) =>
                      handleSection(
                        "superstructure",
                        "master_bedrooms",
                        parseRequiredInteger(
                          event.target.value,
                          request.superstructure.master_bedrooms ?? 0,
                          0
                        )
                      )
                    }
                  />
                </Field>
                <Field label="Other Program Rooms">
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    value={additionalOtherRooms}
                    onChange={(event) => {
                      const nextCount = parseRequiredInteger(
                        event.target.value,
                        additionalOtherRooms,
                        0
                      );
                      const nextRooms = { ...(request.superstructure.additional_rooms ?? {}) };
                      if (nextCount > 0) {
                        nextRooms.other = { count: nextCount };
                      } else {
                        delete nextRooms.other;
                      }
                      handleSection(
                        "superstructure",
                        "additional_rooms",
                        Object.keys(nextRooms).length > 0 ? nextRooms : undefined
                      );
                    }}
                  />
                </Field>
                <Field label="Superstructure Finishing Level">
                  <select
                    className={inputClass}
                    value={request.superstructure.finishing_level ?? "standard"}
                    onChange={(event) =>
                      handleSection(
                        "superstructure",
                        "finishing_level",
                        event.target.value as EstimationRequest["superstructure"]["finishing_level"]
                      )
                    }
                  >
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </Field>
              </div>
            </AdvancedPanel>

            <AdvancedPanel
              title="Roofing refinements"
              description="Optional pitched-roof controls that refine roof geometry assumptions."
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {!roofIsFlat ? (
                  <ToggleField
                    label="Include Roof Overhangs"
                    help="Applies overhang uplift to pitched roof area takeoff."
                    checked={request.roofing.include_overhangs ?? true}
                    onChange={(checked) => handleSection("roofing", "include_overhangs", checked)}
                  />
                ) : (
                  <div className="text-sm text-gray-600 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-700 p-3">
                    Flat roofs do not use overhang and pitch refinement controls.
                  </div>
                )}
              </div>
            </AdvancedPanel>

            <AdvancedPanel
              title="Services refinements"
              description="Service-scope toggles and quality settings for first-fix and second-fix."
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ToggleField
                  label="First Fix: Include Hot Water"
                  checked={request.services_first_fix.include_hot_water ?? true}
                  onChange={(checked) =>
                    handleSection("services_first_fix", "include_hot_water", checked)
                  }
                />
                <ToggleField
                  label="First Fix: Include Earthing"
                  checked={request.services_first_fix.include_earthing ?? true}
                  onChange={(checked) =>
                    handleSection("services_first_fix", "include_earthing", checked)
                  }
                />
                <ToggleField
                  label="Second Fix: Include Shower Mixers"
                  checked={request.services_second_fix.include_shower_mixers ?? true}
                  onChange={(checked) =>
                    handleSection("services_second_fix", "include_shower_mixers", checked)
                  }
                />
                <ToggleField
                  label="Second Fix: Include Instant Showers"
                  checked={request.services_second_fix.include_instant_showers ?? true}
                  onChange={(checked) =>
                    handleSection("services_second_fix", "include_instant_showers", checked)
                  }
                />
                <Field label="First Fix Quality">
                  <select
                    className={inputClass}
                    value={request.services_first_fix.quality_level ?? "standard"}
                    onChange={(event) =>
                      handleSection(
                        "services_first_fix",
                        "quality_level",
                        event.target.value as EstimationRequest["services_first_fix"]["quality_level"]
                      )
                    }
                  >
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                  </select>
                </Field>
                <Field label="Second Fix Quality">
                  <select
                    className={inputClass}
                    value={request.services_second_fix.quality_level ?? "standard"}
                    onChange={(event) =>
                      handleSection(
                        "services_second_fix",
                        "quality_level",
                        event.target.value as EstimationRequest["services_second_fix"]["quality_level"]
                      )
                    }
                  >
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                  </select>
                </Field>
              </div>
            </AdvancedPanel>

            <AdvancedPanel
              title="Finishes refinements"
              description="Detailed finish scope controls and joinery/cabinet refinement."
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field
                  label="Wall Height (m)"
                  error={inlineErrors["finishes.wall_height_m"]}
                  showError={showFieldError("finishes.wall_height_m")}
                >
                  <input
                    type="number"
                    min={2}
                    step="0.1"
                    className={inputClass}
                    value={request.finishes.wall_height_m ?? ""}
                    onChange={(event) =>
                      handleSection(
                        "finishes",
                        "wall_height_m",
                        parseOptionalNumber(event.target.value)
                      )
                    }
                    onBlur={() => markFieldTouched("finishes.wall_height_m")}
                  />
                </Field>
                <ToggleField
                  label="Include Wet Wall Tiling"
                  checked={request.finishes.wet_wall_tiling ?? true}
                  onChange={(checked) => handleSection("finishes", "wet_wall_tiling", checked)}
                />
                <ToggleField
                  label="Include Cornices"
                  checked={request.finishes.include_cornices ?? true}
                  onChange={(checked) => handleSection("finishes", "include_cornices", checked)}
                />
                <ToggleField
                  label="Include Skirting"
                  checked={request.finishes.include_skirting ?? true}
                  onChange={(checked) => handleSection("finishes", "include_skirting", checked)}
                />
                <ToggleField
                  label="Include Wardrobes"
                  checked={request.finishes.include_wardrobes ?? true}
                  onChange={(checked) => handleSection("finishes", "include_wardrobes", checked)}
                />
                <ToggleField
                  label="Include Kitchen Cabinets"
                  checked={request.finishes.include_kitchen_cabinets ?? true}
                  onChange={(checked) =>
                    handleSection("finishes", "include_kitchen_cabinets", checked)
                  }
                />
                <ToggleField
                  label="Include Bathroom Cabinetry"
                  checked={request.finishes.include_bathroom_cabinetry ?? false}
                  onChange={(checked) =>
                    handleSection("finishes", "include_bathroom_cabinetry", checked)
                  }
                />
                <ToggleField
                  label="Include Store Cabinetry"
                  checked={request.finishes.include_store_cabinetry ?? false}
                  onChange={(checked) =>
                    handleSection("finishes", "include_store_cabinetry", checked)
                  }
                />
                {joineryEnabled ? (
                  <Field label="Joinery Level">
                    <select
                      className={inputClass}
                      value={request.finishes.joinery_level ?? "standard"}
                      onChange={(event) =>
                        handleSection(
                          "finishes",
                          "joinery_level",
                          event.target.value as EstimationRequest["finishes"]["joinery_level"]
                        )
                      }
                    >
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                    </select>
                  </Field>
                ) : (
                  <div />
                )}
                <Field label="Finishes Quality Level">
                  <select
                    className={inputClass}
                    value={request.finishes.quality_level ?? "standard"}
                    onChange={(event) =>
                      handleSection(
                        "finishes",
                        "quality_level",
                        event.target.value as EstimationRequest["finishes"]["quality_level"]
                      )
                    }
                  >
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </Field>
              </div>
            </AdvancedPanel>

            <AdvancedPanel
              title="External Works overrides"
              description="Known site quantities can override default external works allocations."
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Paving Override (sqm)">
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    className={inputClass}
                    value={request.external_works.paving_area_sqm ?? ""}
                    onChange={(event) =>
                      handleSection(
                        "external_works",
                        "paving_area_sqm",
                        parseOptionalNumber(event.target.value)
                      )
                    }
                  />
                </Field>
                <Field label="Driveway Override (sqm)">
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    className={inputClass}
                    value={request.external_works.driveway_area_sqm ?? ""}
                    onChange={(event) =>
                      handleSection(
                        "external_works",
                        "driveway_area_sqm",
                        parseOptionalNumber(event.target.value)
                      )
                    }
                  />
                </Field>
                <Field label="Landscaping Override (sqm)">
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    className={inputClass}
                    value={request.external_works.landscaping_area_sqm ?? ""}
                    onChange={(event) =>
                      handleSection(
                        "external_works",
                        "landscaping_area_sqm",
                        parseOptionalNumber(event.target.value)
                      )
                    }
                  />
                </Field>
                <Field label="Drainage Override (m)">
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    className={inputClass}
                    value={request.external_works.drainage_length_m ?? ""}
                    onChange={(event) =>
                      handleSection(
                        "external_works",
                        "drainage_length_m",
                        parseOptionalNumber(event.target.value)
                      )
                    }
                  />
                </Field>
                <Field label="Boundary Length Override (m)">
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    className={inputClass}
                    value={request.external_works.perimeter_wall_length_m ?? ""}
                    onChange={(event) =>
                      handleSection(
                        "external_works",
                        "perimeter_wall_length_m",
                        parseOptionalNumber(event.target.value)
                      )
                    }
                  />
                </Field>
                <Field label="Boundary Height (m)">
                  <input
                    type="number"
                    min={0.1}
                    step="0.1"
                    className={inputClass}
                    value={request.external_works.perimeter_wall_height_m ?? ""}
                    onChange={(event) =>
                      handleSection(
                        "external_works",
                        "perimeter_wall_height_m",
                        parseRequiredNumber(event.target.value, 2.4, 0.1)
                      )
                    }
                  />
                </Field>
                <ToggleField
                  label="Include Razor Wire"
                  checked={request.external_works.razor_wire ?? false}
                  onChange={(checked) => handleSection("external_works", "razor_wire", checked)}
                />
                <Field label="External Works Quality">
                  <select
                    className={inputClass}
                    value={request.external_works.quality_level ?? "standard"}
                    onChange={(event) =>
                      handleSection(
                        "external_works",
                        "quality_level",
                        event.target.value as EstimationRequest["external_works"]["quality_level"]
                      )
                    }
                  >
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                  </select>
                </Field>
              </div>
            </AdvancedPanel>

            <AdvancedPanel
              title="Compatibility Geometry Overrides"
              description="Compatibility-only fields for migration and debug scenarios."
            >
              <p className="text-xs text-amber-700 dark:text-amber-200 rounded-md border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 p-2 mb-3">
                These fields are compatibility-only and are not part of the normal basic flow.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Foundation Floor Area Override (sqm)">
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    className={inputClass}
                    value={request.foundation.floor_area_sqm ?? ""}
                    onChange={(event) =>
                      handleSection(
                        "foundation",
                        "floor_area_sqm",
                        parseOptionalNumber(event.target.value)
                      )
                    }
                  />
                </Field>
                <Field label="Roofing Footprint Override (sqm)">
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    className={inputClass}
                    value={request.roofing.building_footprint_sqm ?? ""}
                    onChange={(event) =>
                      handleSection(
                        "roofing",
                        "building_footprint_sqm",
                        parseOptionalNumber(event.target.value)
                      )
                    }
                  />
                </Field>
                <Field label="Roofing Storeys Override">
                  <input
                    type="number"
                    min={1}
                    className={inputClass}
                    value={request.roofing.storeys ?? ""}
                    onChange={(event) =>
                      handleSection("roofing", "storeys", parseOptionalNumber(event.target.value))
                    }
                  />
                </Field>
                <Field label="First Fix Area Override (sqm)">
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    className={inputClass}
                    value={request.services_first_fix.floor_area_sqm ?? ""}
                    onChange={(event) =>
                      handleSection(
                        "services_first_fix",
                        "floor_area_sqm",
                        parseOptionalNumber(event.target.value)
                      )
                    }
                  />
                </Field>
                <Field label="First Fix Storeys Override">
                  <input
                    type="number"
                    min={1}
                    className={inputClass}
                    value={request.services_first_fix.storeys ?? ""}
                    onChange={(event) =>
                      handleSection(
                        "services_first_fix",
                        "storeys",
                        parseOptionalNumber(event.target.value)
                      )
                    }
                  />
                </Field>
                <Field label="Second Fix Area Override (sqm)">
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    className={inputClass}
                    value={request.services_second_fix.floor_area_sqm ?? ""}
                    onChange={(event) =>
                      handleSection(
                        "services_second_fix",
                        "floor_area_sqm",
                        parseOptionalNumber(event.target.value)
                      )
                    }
                  />
                </Field>
                <Field label="Second Fix Storeys Override">
                  <input
                    type="number"
                    min={1}
                    className={inputClass}
                    value={request.services_second_fix.storeys ?? ""}
                    onChange={(event) =>
                      handleSection(
                        "services_second_fix",
                        "storeys",
                        parseOptionalNumber(event.target.value)
                      )
                    }
                  />
                </Field>
                <Field label="Finishes Area Override (sqm)">
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    className={inputClass}
                    value={request.finishes.floor_area_sqm ?? ""}
                    onChange={(event) =>
                      handleSection(
                        "finishes",
                        "floor_area_sqm",
                        parseOptionalNumber(event.target.value)
                      )
                    }
                  />
                </Field>
                <Field label="Finishes Storeys Override">
                  <input
                    type="number"
                    min={1}
                    className={inputClass}
                    value={request.finishes.storeys ?? ""}
                    onChange={(event) =>
                      handleSection("finishes", "storeys", parseOptionalNumber(event.target.value))
                    }
                  />
                </Field>
              </div>
            </AdvancedPanel>
          </div>
        </FormSection>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {submitting ? "Generating estimate..." : status ? status : error}
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Generate Estimate"}
        </button>
      </div>

      {validationErrors.length > 0 ? (
        <div className="rounded-md border border-red-300 bg-red-50 text-red-800 px-4 py-3 text-sm dark:border-red-900 dark:bg-red-900/30 dark:text-red-200">
          <div className="font-semibold mb-1">Please fix the following before submit:</div>
          <ul className="list-disc list-inside space-y-0.5">
            {validationErrors.map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default EstimatorWizard;
