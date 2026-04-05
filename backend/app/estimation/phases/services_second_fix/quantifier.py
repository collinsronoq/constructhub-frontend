from math import ceil

from app.estimation.common_schemas import QuantityItem
from app.estimation.phases.services_second_fix.schemas import (
    ServicesSecondFixInput,
    ServicesSecondFixQuantityModel,
    ServicesSecondFixResolvedInputs,
)


def derive_services_second_fix_quantities(
    data: ServicesSecondFixInput,
    resolved_inputs: ServicesSecondFixResolvedInputs,
) -> ServicesSecondFixQuantityModel:
    habitable_rooms = (
        data.bedrooms
        + data.living_rooms
        + data.dining_rooms
        + data.kitchens
    )

    total_light_points = (habitable_rooms * data.light_points_per_room) + (data.bathrooms * 2)
    total_socket_points = (habitable_rooms * data.sockets_per_room) + (data.kitchens * 4)

    switches = total_light_points
    sockets = total_socket_points
    light_fittings = total_light_points

    toilet_sets = max(1, data.bathrooms)
    basins = data.bathrooms + data.dining_rooms
    kitchen_sinks = max(1, data.kitchens)

    shower_mixers = data.bathrooms if data.include_shower_mixers else 0
    instant_showers = data.bathrooms if data.include_instant_showers else 0

    storey_factor = 1 + 0.1 * max(0, resolved_inputs.effective_storeys - 1)

    switches = ceil(switches * storey_factor)
    sockets = ceil(sockets * storey_factor)
    light_fittings = ceil(light_fittings * storey_factor)
    toilet_sets = ceil(toilet_sets * storey_factor)
    basins = ceil(basins * storey_factor)
    kitchen_sinks = ceil(kitchen_sinks * storey_factor)
    shower_mixers = ceil(shower_mixers * storey_factor)
    instant_showers = ceil(instant_showers * storey_factor)

    return ServicesSecondFixQuantityModel(
        habitable_rooms_count=habitable_rooms,
        storey_factor=round(storey_factor, 3),
        total_light_points=total_light_points,
        total_socket_points=total_socket_points,
        switches_count=switches,
        sockets_count=sockets,
        light_fittings_count=light_fittings,
        toilet_sets_count=toilet_sets,
        basins_count=basins,
        kitchen_sinks_count=kitchen_sinks,
        shower_mixers_count=shower_mixers,
        instant_showers_count=instant_showers,
    )


def build_services_second_fix_quantity_items(
    data: ServicesSecondFixInput,
    quantities: ServicesSecondFixQuantityModel,
    resolved_inputs: ServicesSecondFixResolvedInputs,
) -> list[QuantityItem]:
    return [
        QuantityItem(
            name="habitable_rooms_count",
            value=float(quantities.habitable_rooms_count),
            unit="count",
            formula="bedrooms + living_rooms + dining_rooms + kitchens",
        ),
        QuantityItem(
            name="storey_factor",
            value=quantities.storey_factor,
            unit="ratio",
            formula="1 + 0.1 * max(0, effective_storeys - 1)",
        ),
        QuantityItem(
            name="total_light_points",
            value=float(quantities.total_light_points),
            unit="point",
            formula="(habitable_rooms_count * light_points_per_room) + (bathrooms * 2)",
        ),
        QuantityItem(
            name="total_socket_points",
            value=float(quantities.total_socket_points),
            unit="point",
            formula="(habitable_rooms_count * sockets_per_room) + (kitchens * 4)",
        ),
        QuantityItem(
            name="switches_count",
            value=float(quantities.switches_count),
            unit="pcs",
            formula="ceil(total_light_points * storey_factor)",
        ),
        QuantityItem(
            name="sockets_count",
            value=float(quantities.sockets_count),
            unit="pcs",
            formula="ceil(total_socket_points * storey_factor)",
        ),
        QuantityItem(
            name="light_fittings_count",
            value=float(quantities.light_fittings_count),
            unit="pcs",
            formula="ceil(total_light_points * storey_factor)",
        ),
        QuantityItem(
            name="toilet_sets_count",
            value=float(quantities.toilet_sets_count),
            unit="set",
            formula="ceil(max(1, bathrooms) * storey_factor)",
        ),
        QuantityItem(
            name="basins_count",
            value=float(quantities.basins_count),
            unit="pcs",
            formula="ceil((bathrooms + dining_rooms) * storey_factor)",
        ),
        QuantityItem(
            name="kitchen_sinks_count",
            value=float(quantities.kitchen_sinks_count),
            unit="pcs",
            formula="ceil(max(1, kitchens) * storey_factor)",
        ),
        QuantityItem(
            name="shower_mixers_count",
            value=float(quantities.shower_mixers_count),
            unit="pcs",
            formula="ceil((bathrooms if include_shower_mixers else 0) * storey_factor)",
        ),
        QuantityItem(
            name="instant_showers_count",
            value=float(quantities.instant_showers_count),
            unit="pcs",
            formula="ceil((bathrooms if include_instant_showers else 0) * storey_factor)",
        ),
        QuantityItem(
            name="effective_floor_area_sqm",
            value=resolved_inputs.effective_floor_area_sqm,
            unit="sqm",
            formula=(
                "shared_geometry.total_floor_area_sqm"
                if resolved_inputs.used_geometry_floor_area
                else "services_second_fix.floor_area_sqm fallback"
            ),
        ),
        QuantityItem(
            name="effective_storeys",
            value=float(resolved_inputs.effective_storeys),
            unit="count",
            formula=(
                "shared_geometry.storeys"
                if resolved_inputs.used_geometry_storeys
                else "services_second_fix.storeys fallback"
            ),
        ),
        QuantityItem(
            name="sockets_per_room",
            value=float(data.sockets_per_room),
            unit="per_room",
            formula="input",
        ),
        QuantityItem(
            name="light_points_per_room",
            value=float(data.light_points_per_room),
            unit="per_room",
            formula="input",
        ),
    ]


def quantify_services_second_fix(data: ServicesSecondFixInput) -> ServicesSecondFixQuantityModel:
    """
    Transitional compatibility helper for callers that do not pass shared geometry.
    """
    fallback_floor_area = max(float(data.floor_area_sqm or 1.0), 1.0)
    fallback_storeys = max(1, int(data.storeys or 1))

    return derive_services_second_fix_quantities(
        data=data,
        resolved_inputs=ServicesSecondFixResolvedInputs(
            effective_floor_area_sqm=fallback_floor_area,
            effective_storeys=fallback_storeys,
            used_geometry_floor_area=False,
            used_geometry_storeys=False,
        ),
    )
