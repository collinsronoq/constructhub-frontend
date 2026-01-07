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
        q.concrete_volume_m3 = round(geometry.roof_area_sqm * 0.3, 2)  # 300mm slab
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
