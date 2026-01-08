import math
from math import ceil, sqrt

from app.estimation.schemas.external import ExternalWorksInput, ExternalWorksQuantities


def _estimate_perimeter_length(land_size_sqm: float) -> float:
    """
    Rough perimeter assuming near-square plot, no added buffer.
    """
    return 4 * sqrt(land_size_sqm)


def quantify_external_works(data: ExternalWorksInput) -> ExternalWorksQuantities:
    """
    Convert external inputs into material quantities.
    """

    wall_length = data.perimeter_wall_length_m or _estimate_perimeter_length(data.land_size_sqm)

    # Surfaces
    paving_area = data.paving_area_sqm or (data.floor_area_sqm * 0.3)
    drainage_length = data.drainage_length_m or (wall_length * 0.5)
    landscaping_area = data.landscaping_area_sqm or (data.floor_area_sqm * 0.2)

    # Perimeter wall quantities
    wall_area = wall_blocks = wall_mortar = footing_conc = column_conc = column_reinf = plaster_area = 0
    chain_link_mesh = chain_link_conc = precast_length = razor_wire = 0
    gate_count = data.gate_count

    if data.perimeter_wall_enabled and data.perimeter_wall_type != "none":
        if data.perimeter_wall_type == "block_wall":
            wall_area = wall_length * data.perimeter_wall_height_m
            wall_blocks = ceil(wall_area * 12)
            wall_mortar = round(wall_blocks * 0.002, 2)

            footing_conc = round(wall_length * 0.4 * 0.6, 2)  # strip footing 400mm x 600mm

            column_spacing = 3.0
            column_count = max(4, ceil(wall_length / column_spacing))
            column_conc = round(column_count * 0.25 * 0.25 * data.perimeter_wall_height_m, 2)
            column_reinf = round(column_conc * 15, 1)  # kg

            plaster_area = round(wall_area * 1.1, 1)  # one side + allowance

            if data.razor_wire:
                razor_wire = wall_length

        elif data.perimeter_wall_type == "chain_link":
            chain_link_mesh = wall_length
            post_spacing = 3.0
            post_count = max(4, ceil(wall_length / post_spacing))
            chain_link_conc = round(post_count * 0.2 * 0.2 * 0.6, 2)
            if data.razor_wire:
                razor_wire = wall_length

        elif data.perimeter_wall_type == "precast":
            precast_length = wall_length
            if data.razor_wire:
                razor_wire = wall_length

    # Sewerage / waste
    septic_conc = septic_reinf = sewer_pipe = 0
    manhole_count = 0
    biodigester_units = 0

    if data.sewerage_system == "septic_tank":
        septic_conc = max(5.0, round(data.floor_area_sqm * 0.03, 2))
        septic_reinf = round(septic_conc * 15, 1)
        sewer_pipe = 20
        manhole_count = 1
    elif data.sewerage_system == "biodigester":
        biodigester_units = 1
        sewer_pipe = 15
        manhole_count = 1
    elif data.sewerage_system == "sewer_connection":
        sewer_pipe = max(data.sewer_connection_length_m, 5)
        manhole_count = max(1, ceil(sewer_pipe / 15))

    print(f''' external works details: \n 
          wall length: {wall_length} \n
          paving area: {paving_area} \n
          
          
          ''')

    return ExternalWorksQuantities(
        paving_area_sqm=round(paving_area, 1),
        drainage_length_m=round(drainage_length, 1),
        landscaping_area_sqm=round(landscaping_area, 1),
        wall_length_m=round(wall_length, 1),
        wall_area_sqm=round(wall_area, 1),
        wall_blocks=wall_blocks,
        wall_mortar_m3=wall_mortar,
        footing_concrete_m3=footing_conc,
        column_concrete_m3=column_conc,
        column_reinf_kg=column_reinf,
        plaster_area_sqm=plaster_area,
        razor_wire_m=razor_wire,
        chain_link_mesh_m=chain_link_mesh,
        chain_link_post_concrete_m3=chain_link_conc,
        precast_length_m=precast_length,
        gate_count=gate_count,
        septic_concrete_m3=septic_conc,
        septic_reinf_kg=septic_reinf,
        sewer_pipe_m=sewer_pipe,
        manhole_count=manhole_count,
        biodigester_units=biodigester_units,
    )
