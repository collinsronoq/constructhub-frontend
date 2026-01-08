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

    # FLAT ROOF (RC SLAB)
    if geometry.is_flat:
        slab_thickness_m = 0.2  
        steel_rate_kg_per_m2 = 14  # baseline reinforcement rate

        q.concrete_volume_m3 = round(geometry.roof_area_sqm * slab_thickness_m, 2)
        q.reinforcement_kg = round(geometry.roof_area_sqm * steel_rate_kg_per_m2, 2)
        q.formwork_sqm = round(geometry.roof_area_sqm * 1.05, 2)
        q.waterproofing_sqm = round(geometry.roof_area_sqm * 1.10, 2)
        return q


    # PITCHED ROOFS
    q.roofing_sheets_sqm = round(geometry.roof_area_sqm * 1.05, 2)

    timber_factor = {
        "gable": 0.035,
        "hip": 0.045,
        "mono_pitch": 0.03,
    }.get(roof_type, 0.04)

    q.timber_cubic_m = round(geometry.roof_area_sqm * timber_factor, 3)
    q.nails_kg = round(geometry.roof_area_sqm * 0.08, 2)

    print(f'''roofing  quantifier details: \n
          timber cubic metres: {q.timber_cubic_m} \n
          nail in kg: {q.nails_kg} \n
          roofing sheets in sqm: {q.roofing_sheets_sqm}
        
        ''')

    if geometry.ridge_length_m:
        q.ridge_length_m = geometry.ridge_length_m

    return q
