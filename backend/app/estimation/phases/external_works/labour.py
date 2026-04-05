from __future__ import annotations

from math import ceil

from app.estimation.common_schemas import CostItem, PhaseEstimate, build_phase_totals
from app.estimation.phases.external_works.schemas import ExternalWorksInput, ExternalWorksQuantityModel


MASON_RATE = 1300.0
FENCE_CREW_RATE = 1700.0
PAVER_RATE = 1600.0
LANDSCAPER_RATE = 1800.0
HELPER_RATE = 900.0
GATE_INSTALLER_RATE = 2200.0
RAZOR_INSTALLER_RATE = 1800.0
SEWER_CREW_RATE = 1400.0

QUALITY_FACTOR = {
    "standard": 1.0,
    "premium": 1.12,
}


def build_external_works_labour_items(
    data: ExternalWorksInput,
    quantities: ExternalWorksQuantityModel,
) -> list[CostItem]:
    quality_factor = QUALITY_FACTOR.get(data.quality_level, 1.0)
    items: list[CostItem] = []

    if quantities.paving_area_sqm > 0:
        paving_days = ceil((quantities.paving_area_sqm / 45.0) * quality_factor)
        items.append(
            CostItem(
                item_code="paving_crew",
                description="Paving Crew",
                unit="day",
                quantity=float(paving_days),
                unit_rate=PAVER_RATE,
                total=round(PAVER_RATE * paving_days),
                category="labour",
                source="assumed",
                confidence="medium",
            )
        )

    if quantities.drainage_length_m > 0:
        drainage_days = ceil((quantities.drainage_length_m / 30.0) * quality_factor)
        items.append(
            CostItem(
                item_code="drainage_crew",
                description="Drainage Crew",
                unit="day",
                quantity=float(drainage_days),
                unit_rate=PAVER_RATE,
                total=round(PAVER_RATE * drainage_days),
                category="labour",
                source="assumed",
                confidence="medium",
            )
        )

    if quantities.landscaping_area_sqm > 0:
        landscape_days = ceil((quantities.landscaping_area_sqm / 130.0) * quality_factor)
        items.append(
            CostItem(
                item_code="landscaping_crew",
                description="Landscaping/Topsoil Crew",
                unit="day",
                quantity=float(landscape_days),
                unit_rate=LANDSCAPER_RATE,
                total=round(LANDSCAPER_RATE * landscape_days),
                category="labour",
                source="assumed",
                confidence="medium",
            )
        )

    if data.perimeter_wall_enabled and data.perimeter_wall_type == "block_wall" and quantities.boundary_wall_area_sqm > 0:
        masonry_days = ceil((quantities.boundary_wall_area_sqm / 13.0) * quality_factor)
        items.extend(
            [
                CostItem(
                    item_code="boundary_mason",
                    description="Boundary Wall Mason",
                    unit="day",
                    quantity=float(masonry_days),
                    unit_rate=MASON_RATE,
                    total=round(MASON_RATE * masonry_days),
                    category="labour",
                    source="assumed",
                    confidence="medium",
                ),
                CostItem(
                    item_code="boundary_mason_helper",
                    description="Boundary Wall Helper",
                    unit="day",
                    quantity=float(masonry_days),
                    unit_rate=HELPER_RATE,
                    total=round(HELPER_RATE * masonry_days),
                    category="labour",
                    source="assumed",
                    confidence="medium",
                ),
            ]
        )

    if data.perimeter_wall_enabled and data.perimeter_wall_type in {"chain_link", "precast"} and quantities.boundary_wall_length_m > 0:
        fence_days = ceil((quantities.boundary_wall_length_m / 28.0) * quality_factor)
        items.append(
            CostItem(
                item_code="fence_crew",
                description="Fence Installation Crew",
                unit="day",
                quantity=float(fence_days),
                unit_rate=FENCE_CREW_RATE,
                total=round(FENCE_CREW_RATE * fence_days),
                category="labour",
                source="assumed",
                confidence="medium",
            )
        )

    if quantities.gate_count > 0 and quantities.gate_leaf_equivalent_units > 0:
        gate_days = ceil((quantities.gate_leaf_equivalent_units * 1.2) * quality_factor)
        items.append(
            CostItem(
                item_code="gate_install",
                description="Gate Installation Crew",
                unit="day",
                quantity=float(gate_days),
                unit_rate=GATE_INSTALLER_RATE,
                total=round(GATE_INSTALLER_RATE * gate_days),
                category="labour",
                source="assumed",
                confidence="medium",
            )
        )

    if quantities.razor_wire_length_m > 0:
        razor_days = ceil((quantities.razor_wire_length_m / 80.0) * quality_factor)
        items.append(
            CostItem(
                item_code="razor_wire_install",
                description="Razor Wire Installation Crew",
                unit="day",
                quantity=float(razor_days),
                unit_rate=RAZOR_INSTALLER_RATE,
                total=round(RAZOR_INSTALLER_RATE * razor_days),
                category="labour",
                source="assumed",
                confidence="medium",
            )
        )

    if data.sewerage_system == "septic_tank":
        sewer_days = ceil(((quantities.septic_concrete_volume_m3 / 1.5) + (quantities.sewer_connection_length_m / 30.0) + 1.0) * quality_factor)
    elif data.sewerage_system == "biodigester":
        sewer_days = ceil(((quantities.biodigester_units * 2.5) + (quantities.sewer_connection_length_m / 35.0)) * quality_factor)
    else:
        sewer_days = ceil((quantities.sewer_connection_length_m / 22.0) * quality_factor)

    items.append(
        CostItem(
            item_code="sewerage_crew",
            description="Sewerage Installation Crew",
            unit="day",
            quantity=float(max(sewer_days, 1)),
            unit_rate=SEWER_CREW_RATE,
            total=round(SEWER_CREW_RATE * max(sewer_days, 1)),
            category="labour",
            source="assumed",
            confidence="medium",
        )
    )

    return items


def estimate_external_works_labour(
    data: ExternalWorksInput,
    quantities: ExternalWorksQuantityModel,
) -> PhaseEstimate:
    """
    Transitional compatibility helper for legacy imports.
    """
    items = build_external_works_labour_items(data=data, quantities=quantities)
    return PhaseEstimate(
        phase="external_works",
        materials=[],
        labour=items,
        other_costs=[],
        totals=build_phase_totals(materials=[], labour=items, equipment=[], other_costs=[]),
    )
