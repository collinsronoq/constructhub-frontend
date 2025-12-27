from math import ceil

from app.estimation.schemas.services_1 import (
    ServicesFirstFixInput,
    ServicesFirstFixQuantities,
)


def quantify_services_first_fix(
    data: ServicesFirstFixInput,
) -> ServicesFirstFixQuantities:
    """
    Convert floor area + room counts into first-fix material quantities.
    """

    wet_rooms = data.bathrooms + data.kitchens + data.laundry_rooms

    # Approximate number of habitable rooms from floor area (excludes wet rooms)
    assumed_room_size = 14  # sqm
    habitable_rooms = max(2, round(data.floor_area_sqm / assumed_room_size))

    total_light_points = (habitable_rooms * data.light_points_per_room) + (wet_rooms * 2)
    total_socket_points = (habitable_rooms * data.sockets_per_room) + (data.kitchens * 4) + (data.laundry_rooms * 2)

    storey_factor = 1 + 0.2 * max(0, data.storeys - 1)
    waste_factor = 1.05

    # Runs per point (average)
    conduit_run_per_point_m = 7

    conduit_m = (total_light_points + total_socket_points) * conduit_run_per_point_m * storey_factor * waste_factor
    lighting_cable_m = total_light_points * conduit_run_per_point_m * storey_factor * waste_factor
    power_cable_m = total_socket_points * conduit_run_per_point_m * storey_factor * waste_factor

    junction_boxes = ceil((total_light_points + total_socket_points) / 4)

    # Plumbing
    cold_water_pipe_m = wet_rooms * 18 * storey_factor * waste_factor
    hot_water_pipe_m = 0
    if data.include_hot_water:
        # kitchens and bathrooms only; laundry hot water is optional so we keep it lean
        hot_rooms = data.bathrooms + data.kitchens
        hot_water_pipe_m = hot_rooms * 12 * storey_factor * waste_factor

    waste_pipe_m = wet_rooms * 15 * storey_factor * waste_factor

    earthing_rods = 1 if data.include_earthing else 0

    return ServicesFirstFixQuantities(
        total_light_points=total_light_points,
        total_socket_points=total_socket_points,
        conduit_m=round(conduit_m, 1),
        lighting_cable_m=round(lighting_cable_m, 1),
        power_cable_m=round(power_cable_m, 1),
        junction_boxes=junction_boxes,
        cold_water_pipe_m=round(cold_water_pipe_m, 1),
        hot_water_pipe_m=round(hot_water_pipe_m, 1),
        waste_pipe_m=round(waste_pipe_m, 1),
        earthing_rods=earthing_rods,
    )
