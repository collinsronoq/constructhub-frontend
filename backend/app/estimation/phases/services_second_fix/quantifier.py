from math import ceil

from app.estimation.schemas.services import (
    ServicesSecondFixInput,
    ServicesSecondFixQuantities,
)


def quantify_services_second_fix(data: ServicesSecondFixInput) -> ServicesSecondFixQuantities:
    """
    Derive fixture counts for second-fix services (electrical fittings + sanitary fixtures).
    """

    habitable_rooms = (
        data.bedrooms
        + data.living_rooms
        + data.dining_rooms
        + data.kitchens
    )

    # Electrical fittings
    total_light_points = (habitable_rooms * data.light_points_per_room) + (data.bathrooms * 2)
    total_socket_points = (habitable_rooms * data.sockets_per_room) + (data.kitchens * 4)

    switches = total_light_points  # one per light point as a baseline
    light_fittings = total_light_points
    sockets = total_socket_points

    # Sanitary fixtures
    toilet_sets = max(1, data.bathrooms)
    basins = data.bathrooms + data.dining_rooms  # include basin in dining room
    kitchen_sinks = max(1, data.kitchens)

    shower_mixers = data.bathrooms if data.include_shower_mixers else 0
    instant_showers = data.bathrooms if data.include_instant_showers else 0

    # Multi-storey adjustment: small uplift for risers and duplication
    storey_factor = 1 + 0.1 * max(0, data.storeys - 1)

    switches = ceil(switches * storey_factor)
    sockets = ceil(sockets * storey_factor)
    light_fittings = ceil(light_fittings * storey_factor)
    toilet_sets = ceil(toilet_sets * storey_factor)
    basins = ceil(basins * storey_factor)
    kitchen_sinks = ceil(kitchen_sinks * storey_factor)
    shower_mixers = ceil(shower_mixers * storey_factor)
    instant_showers = ceil(instant_showers * storey_factor)

    print(f''' second service fix details: \n 
          switches: {switches} \n,
          sockets: {sockets} \n,
          light_fittings: {light_fittings} \n,
          toilet_sets: {toilet_sets} \n,
          basins: {basins} \n,
          kitchen_sinks: {kitchen_sinks} \n,
          shower_mixers: {shower_mixers} \n,
          instant_showers: {instant_showers}
  
          ''')
    
    return ServicesSecondFixQuantities(
        switches=switches,
        sockets=sockets,
        light_fittings=light_fittings,
        toilet_sets=toilet_sets,
        basins=basins,
        kitchen_sinks=kitchen_sinks,
        shower_mixers=shower_mixers,
        instant_showers=instant_showers,
    )
