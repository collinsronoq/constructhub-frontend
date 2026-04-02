from __future__ import annotations

from app.estimation.common_schemas import QuantityItem
from app.estimation.phases.roofing.schemas import RoofingPhaseGeometry, RoofingQuantityModel


SLAB_THICKNESS_M = 0.2
STEEL_RATE_KG_PER_M2 = 14.0
ROOF_COVER_WASTAGE_FACTOR = 1.05
FORMWORK_WASTAGE_FACTOR = 1.05
WATERPROOFING_WASTAGE_FACTOR = 1.10
NAILS_KG_PER_SQM = 0.08

# Timber factors are bulk structural allowances in m3 per sqm of sloped roof area.
# They represent grouped timber members (rafters, purlins, wall plates, bracing)
# and are not a member-by-member takeoff.
TIMBER_FACTOR_M3_PER_SQM = {
    "gable": 0.035,
    "hip": 0.045,
    "mono_pitch": 0.03,
}
DEFAULT_TIMBER_FACTOR_M3_PER_SQM = 0.04


def derive_roofing_quantities(geometry: RoofingPhaseGeometry) -> RoofingQuantityModel:
    if geometry.is_flat:
        # 200mm slab and 14kg/sqm steel are deliberate preliminary-design defaults.
        return RoofingQuantityModel(
            roof_covering_area_sqm=0.0,
            timber_factor_m3_per_sqm=0.0,
            timber_cubic_m=0.0,
            nails_kg=0.0,
            ridge_length_m=0.0,
            concrete_volume_m3=round(geometry.roof_cover_area_sqm * SLAB_THICKNESS_M, 2),
            reinforcement_kg=round(geometry.roof_cover_area_sqm * STEEL_RATE_KG_PER_M2, 2),
            formwork_sqm=round(geometry.roof_cover_area_sqm * FORMWORK_WASTAGE_FACTOR, 2),
            waterproofing_sqm=round(geometry.roof_cover_area_sqm * WATERPROOFING_WASTAGE_FACTOR, 2),
        )

    timber_factor = TIMBER_FACTOR_M3_PER_SQM.get(
        geometry.roof_type,
        DEFAULT_TIMBER_FACTOR_M3_PER_SQM,
    )
    return RoofingQuantityModel(
        roof_covering_area_sqm=round(geometry.roof_cover_area_sqm * ROOF_COVER_WASTAGE_FACTOR, 2),
        timber_factor_m3_per_sqm=timber_factor,
        timber_cubic_m=round(geometry.roof_cover_area_sqm * timber_factor, 3),
        nails_kg=round(geometry.roof_cover_area_sqm * NAILS_KG_PER_SQM, 2),
        ridge_length_m=round(max(geometry.ridge_length_m, 0.0), 2),
        concrete_volume_m3=0.0,
        reinforcement_kg=0.0,
        formwork_sqm=0.0,
        waterproofing_sqm=0.0,
    )


def build_roofing_quantity_items(
    geometry: RoofingPhaseGeometry,
    quantities: RoofingQuantityModel,
) -> list[QuantityItem]:
    items = [
        QuantityItem(
            name="roof_plan_area_sqm",
            value=geometry.selected_plan_area_sqm,
            unit="sqm",
            formula="shared_geometry.ground_footprint_area_sqm",
        ),
        QuantityItem(
            name="roof_cover_area_sqm",
            value=geometry.roof_cover_area_sqm,
            unit="sqm",
            formula=(
                "roof_plan_area_sqm * slope_factor * overhang_factor"
                if not geometry.is_flat
                else "roof_plan_area_sqm"
            ),
        ),
        QuantityItem(
            name="slope_factor",
            value=geometry.slope_factor,
            unit="ratio",
            formula="1 / cos(pitch_degrees)",
        ),
        QuantityItem(
            name="overhang_factor",
            value=geometry.overhang_factor,
            unit="ratio",
            formula="1.12 if include_overhangs else 1.0",
        ),
        QuantityItem(
            name="ridge_length_m",
            value=geometry.ridge_length_m,
            unit="m",
            formula="sqrt(roof_plan_area_sqm) for gable/hip",
        ),
    ]

    if geometry.is_flat:
        items.extend(
            [
                QuantityItem(
                    name="roof_slab_concrete_volume_m3",
                    value=quantities.concrete_volume_m3,
                    unit="m3",
                    formula=f"roof_cover_area_sqm * {SLAB_THICKNESS_M:.2f}m",
                ),
                QuantityItem(
                    name="roof_slab_reinforcement_kg",
                    value=quantities.reinforcement_kg,
                    unit="kg",
                    formula=f"roof_cover_area_sqm * {STEEL_RATE_KG_PER_M2:.0f}kg_per_sqm",
                ),
                QuantityItem(
                    name="roof_formwork_area_sqm",
                    value=quantities.formwork_sqm,
                    unit="sqm",
                    formula=f"roof_cover_area_sqm * {FORMWORK_WASTAGE_FACTOR:.2f}",
                ),
                QuantityItem(
                    name="roof_waterproofing_area_sqm",
                    value=quantities.waterproofing_sqm,
                    unit="sqm",
                    formula=f"roof_cover_area_sqm * {WATERPROOFING_WASTAGE_FACTOR:.2f}",
                ),
            ]
        )
    else:
        items.extend(
            [
                QuantityItem(
                    name="roof_covering_area_sqm",
                    value=quantities.roof_covering_area_sqm,
                    unit="sqm",
                    formula=f"roof_cover_area_sqm * {ROOF_COVER_WASTAGE_FACTOR:.2f} wastage",
                ),
                QuantityItem(
                    name="timber_factor_m3_per_sqm",
                    value=quantities.timber_factor_m3_per_sqm,
                    unit="m3_per_sqm",
                    formula=(
                        "gable=0.035, hip=0.045, mono_pitch=0.030, default=0.040 "
                        "(bulk structural timber allowance)"
                    ),
                ),
                QuantityItem(
                    name="timber_cubic_m",
                    value=quantities.timber_cubic_m,
                    unit="m3",
                    formula="roof_cover_area_sqm * timber_factor_m3_per_sqm",
                ),
                QuantityItem(
                    name="nails_kg",
                    value=quantities.nails_kg,
                    unit="kg",
                    formula=f"roof_cover_area_sqm * {NAILS_KG_PER_SQM:.2f}",
                ),
            ]
        )

    return items
