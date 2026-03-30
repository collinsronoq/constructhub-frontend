import React, { useCallback, useMemo, useState } from "react";
import { useEstimationWizard } from "../../hooks/useEstimationWizard";
import type { EstimationRequest } from "../../services/api/estimationTypes";
import { mapEstimationDetailToBreakdown } from "../../hooks/Estimator/estimationMapper";
import EstimatorBreakdown from "./EstimatorBreakdown";

const WizardSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({
  title,
  children,
  defaultOpen = true,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg mb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex justify-between items-center px-4 py-3 bg-background-light dark:bg-background-dark hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <span className="font-semibold text-sm md:text-base text-gray-900 dark:text-gray-100">{title}</span>
        <span className="text-xs text-gray-600 dark:text-gray-300">{open ? "Hide" : "Show"}</span>
      </button>
      <div className={open ? "p-4 space-y-3" : "hidden"}>{children}</div>
    </div>
  );
};

const EstimatorWizard: React.FC = () => {
  const { request, updateSection, submit, submitting, result, error } = useEstimationWizard();
  const [status, setStatus] = useState<string | null>(null);
  const [view, setView] = useState<"form" | "summary" | "breakdown">("form");

  const handleSection = useCallback(
    <K extends keyof EstimationRequest, F extends keyof EstimationRequest[K]>(
      section: K,
      field: F,
      value: EstimationRequest[K][F]
    ) => {
      updateSection(section, { ...(request[section] as any), [field]: value } as EstimationRequest[K]);
    },
    [request, updateSection]
  );

  const handleSubmit = async () => {
    setStatus(null);
    try {
      const res = await submit();
      console.info("Estimation generated", res);
      setStatus("Estimate generated");
      setView("summary");
    } catch (err: any) {
      // Surface the error to both UI and dev console
      const detail = err?.detail || err?.message || "Failed to create estimation";
      console.error("Estimation submit error", err);
      setStatus(typeof detail === "string" ? detail : JSON.stringify(detail));
    }
  };

  const uiBreakdown = useMemo(() => {
    if (!result) return null;
    return mapEstimationDetailToBreakdown(result as any, {
      request,
      projectName: request.project_name,
      finishing: request.superstructure.finishing_level,
    });
  }, [result, request]);

  if (view !== "form" && uiBreakdown) {
    if (view === "summary") {
      const total = uiBreakdown.totalCost || 0;
      const materialTotal = uiBreakdown.phases.reduce(
        (sum, p) => sum + p.materials.reduce((mSum, m) => mSum + (m.subtotal || 0), 0),
        0
      );
      const labourTotal = uiBreakdown.phases.reduce(
        (sum, p) => sum + p.labour.reduce((lSum, l) => lSum + (l.subtotal || 0), 0),
        0
      );
      const otherTotal = uiBreakdown.phases.reduce(
        (sum, p) => sum + p.otherCosts.reduce((oSum, o) => oSum + (o.amount || 0), 0),
        0
      );
      return (
        <div className="mx-auto max-w-4xl px-4 py-6 space-y-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Estimate Summary</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {uiBreakdown.projectTitle} · KSh {total.toLocaleString()}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Cost</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                KSh {total.toLocaleString()}
              </div>
            </div>
            <div className="p-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400">Materials</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                KSh {materialTotal.toLocaleString()}
              </div>
            </div>
            <div className="p-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400">Labour</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                KSh {labourTotal.toLocaleString()}
              </div>
            </div>
            <div className="p-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400">Other Costs</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                KSh {otherTotal.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="p-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Phase Costs</div>
            <div className="space-y-2">
              {uiBreakdown.phases.map((p) => (
                <div key={p.id} className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                  <span>{p.title}</span>
                  <span>KSh {p.subtotal.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (view === "breakdown") {
      return (
        <div className="mx-auto max-w-6xl px-4 py-6 space-y-4 bg-surface-light dark:bg-surface-dark rounded-xl shadow">
          {/* <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Estimate Breakdown</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Project: {uiBreakdown.projectTitle} · Total: KSh {uiBreakdown.totalCost?.toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-700"
                onClick={() => setView("summary")}
              >
                Back to Summary
              </button>
              <button
                className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-700"
                onClick={() => setView("form")}
              >
                Start New
              </button>
            </div>
          </div> */}
          <EstimatorBreakdown data={uiBreakdown} onBackToSummary={() => setView("summary")} />
        </div>
      );
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-4 bg-surface-light dark:bg-surface-dark rounded-xl shadow">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Estimator</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Provide the basics. Advanced fields have defaults; adjust them if you want finer control.
        </p>
      </div>

      <WizardSection title="Project & Site (Survey + Prep)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-800 dark:text-gray-200">Project Name</label>
            <input
              className="w-full border rounded p-2"
              value={request.project_name ?? ""}
              onChange={(e) => updateSection("project_name", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800 dark:text-gray-200">Location</label>
            <input
              className="w-full border rounded p-2"
              value={request.site_survey.location}
              onChange={(e) => handleSection("site_survey", "location", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800 dark:text-gray-200">Plot Size (sqm)</label>
            <input
              type="number"
              className="w-full border rounded p-2"
              value={request.site_survey.plot_size_sqm || ""}
              onChange={(e) => {
                const v = Number(e.target.value || 0);
                handleSection("site_survey", "plot_size_sqm", v);
                handleSection("site_preparation", "plot_size_sqm", v);
                handleSection("superstructure", "land_size_sqm", v);
                handleSection("external_works", "land_size_sqm", v);
              }}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800 dark:text-gray-200">Soil Type</label>
            <select
              className="w-full border rounded p-2"
              value={request.site_preparation.soil_type || ""}
              onChange={(e) => {
                handleSection("site_preparation", "soil_type", e.target.value);
                handleSection("foundation", "soil_type", e.target.value);
              }}
            >
              <option value="">Select</option>
              <option value="soft">Soft</option>
              <option value="medium">Medium</option>
              <option value="rocky">Rocky</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Excavation Depth (m)</label>
            <input
              type="number"
              className="w-full border rounded p-2"
              value={request.site_preparation.excavation_depth_m ?? ""}
              onChange={(e) => handleSection("site_preparation", "excavation_depth_m", Number(e.target.value || 0))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Access Difficulty</label>
            <select
              className="w-full border rounded p-2"
              value={request.site_preparation.access_difficulty || "normal"}
              onChange={(e) => handleSection("site_preparation", "access_difficulty", e.target.value as any)}
            >
              <option value="normal">Normal</option>
              <option value="difficult">Difficult</option>
            </select>
          </div>
          <div className="flex items-center space-x-2 mt-6">
            <input
              type="checkbox"
              checked={request.site_preparation.include_disposal ?? true}
              onChange={(e) => handleSection("site_preparation", "include_disposal", e.target.checked)}
            />
            <label className="text-sm font-medium">Include Disposal</label>
          </div>
        </div>
      </WizardSection>

      <WizardSection title="Structure & Superstructure">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Structure Type</label>
            <select
              className="w-full border rounded p-2"
              value={request.superstructure.structure_type}
              onChange={(e) => handleSection("superstructure", "structure_type", e.target.value as any)}
            >
              <option value="bungalow">Bungalow</option>
              <option value="two_storey">Two Storey</option>
              <option value="three_storey">Three Storey</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Bedrooms</label>
            <input
              type="number"
              className="w-full border rounded p-2"
              value={request.superstructure.bedrooms}
              onChange={(e) => handleSection("superstructure", "bedrooms", Number(e.target.value || 0))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Bathrooms</label>
            <input
              type="number"
              className="w-full border rounded p-2"
              value={request.superstructure.bathrooms}
              onChange={(e) => handleSection("superstructure", "bathrooms", Number(e.target.value || 0))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Declared Floor Area (sqm)</label>
            <input
              type="number"
              className="w-full border rounded p-2"
              value={request.superstructure.declared_floor_area_sqm ?? ""}
              onChange={(e) =>
                handleSection("superstructure", "declared_floor_area_sqm", Number(e.target.value || 0))
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">Blockwork Type</label>
            <select
              className="w-full border rounded p-2"
              value={request.superstructure.blockwork_type}
              onChange={(e) => handleSection("superstructure", "blockwork_type", e.target.value as any)}
            >
              <option value="burnt_bricks">Burnt bricks</option>
              <option value="concrete_blocks">Concrete blocks</option>
              <option value="machine_cut_blocks">Machine cut blocks</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Finishing Level</label>
            <select
              className="w-full border rounded p-2"
              value={request.superstructure.finishing_level || "standard"}
              onChange={(e) => handleSection("superstructure", "finishing_level", e.target.value as any)}
            >
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>
        </div>
      </WizardSection>

      <WizardSection title="Foundation & Roofing">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Foundation Type</label>
            <select
              className="w-full border rounded p-2"
              value={request.foundation.foundation_type}
              onChange={(e) => handleSection("foundation", "foundation_type", e.target.value as any)}
            >
              <option value="strip">Strip</option>
              <option value="raft">Raft</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Foundation Floor Area (sqm)</label>
            <input
              type="number"
              className="w-full border rounded p-2"
              value={request.foundation.floor_area_sqm}
              onChange={(e) => handleSection("foundation", "floor_area_sqm", Number(e.target.value || 0))}
            />
          </div>
          <div className="flex items-center space-x-2 mt-6">
            <input
              type="checkbox"
              checked={request.foundation.include_formwork ?? true}
              onChange={(e) => handleSection("foundation", "include_formwork", e.target.checked)}
            />
            <label className="text-sm font-medium">Include Formwork</label>
          </div>
          <div>
            <label className="text-sm font-medium">Roof Type</label>
            <select
              className="w-full border rounded p-2"
              value={request.roofing.roof_type}
              onChange={(e) => handleSection("roofing", "roof_type", e.target.value as any)}
            >
              <option value="gable">Gable</option>
              <option value="hip">Hip</option>
              <option value="flat">Flat</option>
              <option value="mono_pitch">Mono pitch</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Roof Covering</label>
            <select
              className="w-full border rounded p-2"
              value={request.roofing.roof_covering}
              onChange={(e) => handleSection("roofing", "roof_covering", e.target.value as any)}
            >
              <option value="corrugated_mabati">Corrugated mabati</option>
              <option value="box_profile_mabati">Box profile mabati</option>
              <option value="stone_coated_tiles">Stone coated tiles</option>
              <option value="clay_tiles">Clay tiles</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Building Footprint (sqm)</label>
            <input
              type="number"
              className="w-full border rounded p-2"
              value={request.roofing.building_footprint_sqm}
              onChange={(e) =>
                handleSection("roofing", "building_footprint_sqm", Number(e.target.value || 0))
              }
            />
          </div>
        </div>
      </WizardSection>

      <WizardSection title="Services (First & Second Fix)" defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Services Floor Area (sqm)</label>
            <input
              type="number"
              className="w-full border rounded p-2"
              value={request.services_first_fix.floor_area_sqm}
              onChange={(e) => {
                const v = Number(e.target.value || 0);
                handleSection("services_first_fix", "floor_area_sqm", v);
                handleSection("services_second_fix", "floor_area_sqm", v);
              }}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Sockets per Room</label>
            <input
              type="number"
              className="w-full border rounded p-2"
              value={request.services_first_fix.sockets_per_room ?? 4}
              onChange={(e) => handleSection("services_first_fix", "sockets_per_room", Number(e.target.value || 0))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Light Points per Room</label>
            <input
              type="number"
              className="w-full border rounded p-2"
              value={request.services_first_fix.light_points_per_room ?? 2}
              onChange={(e) =>
                handleSection("services_first_fix", "light_points_per_room", Number(e.target.value || 0))
              }
            />
          </div>
          <div className="flex items-center space-x-2 mt-6">
            <input
              type="checkbox"
              checked={request.services_first_fix.include_hot_water ?? true}
              onChange={(e) => handleSection("services_first_fix", "include_hot_water", e.target.checked)}
            />
            <label className="text-sm font-medium">Include Hot Water</label>
          </div>
          <div className="flex items-center space-x-2 mt-6">
            <input
              type="checkbox"
              checked={request.services_first_fix.include_earthing ?? true}
              onChange={(e) => handleSection("services_first_fix", "include_earthing", e.target.checked)}
            />
            <label className="text-sm font-medium">Include Earthing</label>
          </div>
        </div>
      </WizardSection>

      <WizardSection title="Finishes" defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Floor Area (sqm)</label>
            <input
              type="number"
              className="w-full border rounded p-2"
              value={request.finishes.floor_area_sqm}
              onChange={(e) =>
                handleSection("finishes", "floor_area_sqm", Number(e.target.value || 0))
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">Wall Height (m)</label>
            <input
              type="number"
              className="w-full border rounded p-2"
              value={request.finishes.wall_height_m ?? 3}
              onChange={(e) => handleSection("finishes", "wall_height_m", Number(e.target.value || 0))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Main Floor Finish</label>
            <select
              className="w-full border rounded p-2"
              value={request.finishes.main_floor_finish || "tile"}
              onChange={(e) => handleSection("finishes", "main_floor_finish", e.target.value as any)}
            >
              <option value="tile">Tile</option>
              <option value="laminate">Laminate</option>
              <option value="parquet">Parquet</option>
              <option value="polished_screed">Polished screed</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Wet Floor Finish</label>
            <select
              className="w-full border rounded p-2"
              value={request.finishes.wet_floor_finish || "ceramic_tile"}
              onChange={(e) => handleSection("finishes", "wet_floor_finish", e.target.value as any)}
            >
              <option value="ceramic_tile">Ceramic tile</option>
              <option value="porcelain_tile">Porcelain tile</option>
            </select>
          </div>
          <div className="flex items-center space-x-2 mt-6">
            <input
              type="checkbox"
              checked={request.finishes.wet_wall_tiling ?? true}
              onChange={(e) => handleSection("finishes", "wet_wall_tiling", e.target.checked)}
            />
            <label className="text-sm font-medium">Wet Wall Tiling</label>
          </div>
          <div>
            <label className="text-sm font-medium">Ceiling Type</label>
            <select
              className="w-full border rounded p-2"
              value={request.finishes.ceiling_type || "gypsum_board"}
              onChange={(e) => handleSection("finishes", "ceiling_type", e.target.value as any)}
            >
              <option value="gypsum_board">Gypsum board</option>
              <option value="acoustic_board">Acoustic board</option>
              <option value="tng">T&amp;G</option>
              <option value="exposed">Exposed</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Paint System</label>
            <select
              className="w-full border rounded p-2"
              value={request.finishes.paint_system || "standard_2_coat"}
              onChange={(e) => handleSection("finishes", "paint_system", e.target.value as any)}
            >
              <option value="standard_2_coat">Standard (2 coat)</option>
              <option value="premium_3_coat">Premium (3 coat)</option>
            </select>
          </div>
          <div className="flex items-center space-x-2 mt-6">
            <input
              type="checkbox"
              checked={request.finishes.include_cornices ?? true}
              onChange={(e) => handleSection("finishes", "include_cornices", e.target.checked)}
            />
            <label className="text-sm font-medium">Include Cornices</label>
          </div>
          <div className="flex items-center space-x-2 mt-6">
            <input
              type="checkbox"
              checked={request.finishes.include_skirting ?? true}
              onChange={(e) => handleSection("finishes", "include_skirting", e.target.checked)}
            />
            <label className="text-sm font-medium">Include Skirting</label>
          </div>
          <div className="flex items-center space-x-2 mt-6">
            <input
              type="checkbox"
              checked={request.finishes.include_wardrobes ?? true}
              onChange={(e) => handleSection("finishes", "include_wardrobes", e.target.checked)}
            />
            <label className="text-sm font-medium">Include Wardrobes</label>
          </div>
          <div className="flex items-center space-x-2 mt-6">
            <input
              type="checkbox"
              checked={request.finishes.include_kitchen_cabinets ?? true}
              onChange={(e) => handleSection("finishes", "include_kitchen_cabinets", e.target.checked)}
            />
            <label className="text-sm font-medium">Include Kitchen Cabinets</label>
          </div>
        </div>
      </WizardSection>

      <WizardSection title="External Works" defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={request.external_works.perimeter_wall_enabled ?? false}
              onChange={(e) => handleSection("external_works", "perimeter_wall_enabled", e.target.checked)}
            />
            <label className="text-sm font-medium">Include Perimeter Wall</label>
          </div>
          <div>
            <label className="text-sm font-medium">Perimeter Length (m)</label>
            <input
              type="number"
              className="w-full border rounded p-2"
              value={request.external_works.perimeter_wall_length_m ?? ""}
              onChange={(e) =>
                handleSection("external_works", "perimeter_wall_length_m", Number(e.target.value || 0))
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">Perimeter Height (m)</label>
            <input
              type="number"
              className="w-full border rounded p-2"
              value={request.external_works.perimeter_wall_height_m ?? 2.4}
              onChange={(e) =>
                handleSection("external_works", "perimeter_wall_height_m", Number(e.target.value || 0))
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">Gate Count</label>
            <input
              type="number"
              className="w-full border rounded p-2"
              value={request.external_works.gate_count ?? 1}
              onChange={(e) => handleSection("external_works", "gate_count", Number(e.target.value || 0))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Sewerage System</label>
            <select
              className="w-full border rounded p-2"
              value={request.external_works.sewerage_system || "septic_tank"}
              onChange={(e) => handleSection("external_works", "sewerage_system", e.target.value as any)}
            >
              <option value="septic_tank">Septic tank</option>
              <option value="sewer_connection">Sewer connection</option>
              <option value="biodigester">Biodigester</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Biodigester Capacity (users)</label>
            <input
              type="number"
              className="w-full border rounded p-2"
              value={request.external_works.biodigester_capacity_users ?? ""}
              onChange={(e) =>
                handleSection("external_works", "biodigester_capacity_users", Number(e.target.value || 0))
              }
            />
          </div>
        </div>
      </WizardSection>

      <div className="flex items-center justify-between">
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

      {result && (
        <div className="border rounded p-4 text-sm bg-gray-50 dark:bg-gray-800">
          <div className="font-semibold mb-2">Estimate Summary</div>
          <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(result.summary ?? result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default EstimatorWizard;
