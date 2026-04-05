from __future__ import annotations

from math import sqrt

from app.estimation.phases.external_works.schemas import (
    ExternalWorksGeometryModel,
    ExternalWorksInput,
    ExternalWorksResolvedInputs,
)


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(value, high))


def derive_external_works_geometry(
    data: ExternalWorksInput,
    resolved_inputs: ExternalWorksResolvedInputs,
) -> ExternalWorksGeometryModel:
    """
    Build site geometry from plot + shared building footprint context.
    """

    plot_area = max(float(resolved_inputs.plot_area_sqm), 1.0)
    plot_perimeter = 4 * sqrt(plot_area)

    footprint_area = _clamp(float(resolved_inputs.effective_building_footprint_sqm), 1.0, plot_area * 0.92)
    building_plan_perimeter = max(float(resolved_inputs.effective_building_plan_perimeter_m), 4.0)

    open_external_area = max(plot_area - footprint_area, plot_area * 0.05)

    explicit_hardscape = (data.paving_area_sqm or 0.0) + (data.driveway_area_sqm or 0.0)
    if explicit_hardscape > 0:
        hardscape_candidate = explicit_hardscape
    else:
        hardscape_candidate = open_external_area * 0.40

    explicit_softscape = data.landscaping_area_sqm or 0.0
    if explicit_softscape > 0:
        softscape_candidate = explicit_softscape
    else:
        softscape_candidate = open_external_area * 0.35

    max_allocatable_open_area = open_external_area * 0.95
    hardscape_candidate = max(hardscape_candidate, 0.0)
    softscape_candidate = max(softscape_candidate, 0.0)
    allocation_sum = hardscape_candidate + softscape_candidate
    if allocation_sum > max_allocatable_open_area and allocation_sum > 0:
        scale = max_allocatable_open_area / allocation_sum
        hardscape_candidate *= scale
        softscape_candidate *= scale

    boundary_length = float(data.perimeter_wall_length_m or plot_perimeter)

    gate_opening_length = 0.0
    if data.perimeter_wall_enabled and data.perimeter_wall_type != "none" and data.gate_count > 0:
        gate_opening_length = data.gate_count * float(data.gate_width_m)

    boundary_effective_length = max(boundary_length - gate_opening_length, 0.0)

    # Drainage often follows part of boundary plus building apron collection runs.
    drainage_candidate = float(
        data.drainage_length_m
        or ((boundary_length * 0.55) + (building_plan_perimeter * 0.25))
    )
    drainage_candidate = max(drainage_candidate, 8.0)

    open_unallocated_area = max(open_external_area - hardscape_candidate - softscape_candidate, 0.0)

    return ExternalWorksGeometryModel(
        plot_area_sqm=round(plot_area, 2),
        plot_perimeter_m=round(plot_perimeter, 2),
        building_footprint_area_sqm=round(footprint_area, 2),
        building_plan_perimeter_m=round(building_plan_perimeter, 2),
        open_external_area_sqm=round(open_external_area, 2),
        hardscape_candidate_area_sqm=round(hardscape_candidate, 2),
        softscape_candidate_area_sqm=round(softscape_candidate, 2),
        open_area_unallocated_sqm=round(open_unallocated_area, 2),
        boundary_length_m=round(boundary_length, 2),
        boundary_effective_length_m=round(boundary_effective_length, 2),
        drainage_candidate_length_m=round(drainage_candidate, 2),
        gate_opening_length_m=round(gate_opening_length, 2),
    )

