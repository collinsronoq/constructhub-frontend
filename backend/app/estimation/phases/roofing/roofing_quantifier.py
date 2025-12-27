# # app/estimation/phases/roofing/roofing_quantifier.py

# import math
# from app.estimation.schemas.roofing import RoofingQuantities


# def quantify_roofing(
#     roof_type: str,
#     footprint_sqm: float,
#     roofing_material: str | None = None,
#     pitch_deg: float | None = None,
# ) -> RoofingQuantities:

#     quantities = RoofingQuantities(roof_area_sqm=0)

#     # --- FLAT ROOF (SLAB) ---
#     if roof_type == "flat":
#         roof_area = footprint_sqm

#         quantities.roof_area_sqm = roof_area
#         quantities.concrete_volume_m3 = round(roof_area * 0.15, 2)  # 150mm slab
#         quantities.reinforcement_kg = round(roof_area * 80, 2)
#         quantities.formwork_sqm = round(roof_area * 1.05, 2)
#         quantities.waterproofing_sqm = round(roof_area * 1.1, 2)

#         return quantities

#     # --- PITCHED ROOFS ---
#     pitch = pitch_deg or {
#         "gable": 30,
#         "hip": 35,
#         "mono_pitch": 25,
#     }.get(roof_type, 30)

#     slope_multiplier = 1 / math.cos(math.radians(pitch))
#     roof_area = footprint_sqm * slope_multiplier * 1.12  # include overhang

#     quantities.roof_area_sqm = round(roof_area, 2)

#     # Roofing sheets / tiles
#     quantities.roofing_sheets_sqm = round(roof_area * 1.05, 2)  # waste factor

#     # Timber estimation (rule-based)
#     timber_factor = {
#         "gable": 0.035,
#         "hip": 0.045,
#         "mono_pitch": 0.03,
#     }.get(roof_type, 0.04)

#     quantities.timber_cubic_m = round(roof_area * timber_factor, 3)

#     # Accessories
#     quantities.nails_kg = round(roof_area * 0.08, 2)

#     if roof_type in ["gable", "hip"]:
#         quantities.ridge_length_m = round(math.sqrt(footprint_sqm), 2)

#     return quantities

# app/estimation/phases/roofing/roofing_quantifier.py

from app.estimation.schemas.roofing import RoofingQuantities
from app.estimation.phases.roofing.roofing_geometry import RoofGeometry


def quantify_roofing(
    geometry: RoofGeometry,
    roof_type: str,
) -> RoofingQuantities:
    """
    Convert roof geometry into material quantities.
    """

    q = RoofingQuantities(roof_area_sqm=geometry.roof_area_sqm)

    # --- FLAT ROOF (RC SLAB) ---
    if geometry.is_flat:
        q.concrete_volume_m3 = round(geometry.roof_area_sqm * 0.15, 2)  # 150mm slab
        q.reinforcement_kg = round(geometry.roof_area_sqm * 80, 2)
        q.formwork_sqm = round(geometry.roof_area_sqm * 1.05, 2)
        q.waterproofing_sqm = round(geometry.roof_area_sqm * 1.1, 2)
        return q

    # --- PITCHED ROOFS ---
    q.roofing_sheets_sqm = round(geometry.roof_area_sqm * 1.05, 2)

    timber_factor = {
        "gable": 0.035,
        "hip": 0.045,
        "mono_pitch": 0.03,
    }.get(roof_type, 0.04)

    q.timber_cubic_m = round(geometry.roof_area_sqm * timber_factor, 3)
    q.nails_kg = round(geometry.roof_area_sqm * 0.08, 2)

    if geometry.ridge_length_m:
        q.ridge_length_m = geometry.ridge_length_m

    return q
