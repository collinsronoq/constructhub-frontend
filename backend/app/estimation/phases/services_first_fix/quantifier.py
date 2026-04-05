from __future__ import annotations

from math import ceil

from app.estimation.common_schemas import QuantityItem
from app.estimation.phases.services_first_fix.schemas import (
    ServicesFirstFixInput,
    ServicesFirstFixQuantityModel,
    ServicesFirstFixResolvedInputs,
)


ASSUMED_HABITABLE_ROOM_SIZE_SQM = 14.0
CONDUIT_RUN_PER_POINT_M = 7.0
WASTE_FACTOR = 1.05


def derive_services_first_fix_quantities(
    data: ServicesFirstFixInput,
    resolved_inputs: ServicesFirstFixResolvedInputs,
) -> ServicesFirstFixQuantityModel:
    wet_rooms = data.bathrooms + data.kitchens + data.laundry_rooms
    habitable_rooms = max(2, round(resolved_inputs.effective_floor_area_sqm / ASSUMED_HABITABLE_ROOM_SIZE_SQM))

    total_light_points = (habitable_rooms * data.light_points_per_room) + (wet_rooms * 2)
    total_socket_points = (habitable_rooms * data.sockets_per_room) + (data.kitchens * 4) + (data.laundry_rooms * 2)

    storey_factor = 1 + 0.2 * max(0, resolved_inputs.effective_storeys - 1)

    conduit_m = (total_light_points + total_socket_points) * CONDUIT_RUN_PER_POINT_M * storey_factor * WASTE_FACTOR
    lighting_cable_m = total_light_points * CONDUIT_RUN_PER_POINT_M * storey_factor * WASTE_FACTOR
    power_cable_m = total_socket_points * CONDUIT_RUN_PER_POINT_M * storey_factor * WASTE_FACTOR
    junction_boxes = ceil((total_light_points + total_socket_points) / 4)

    cold_water_pipe_m = wet_rooms * 18 * storey_factor * WASTE_FACTOR
    hot_water_pipe_m = 0.0
    if data.include_hot_water:
        hot_rooms = data.bathrooms + data.kitchens
        hot_water_pipe_m = hot_rooms * 12 * storey_factor * WASTE_FACTOR

    waste_pipe_m = wet_rooms * 15 * storey_factor * WASTE_FACTOR
    earthing_rods = 1 if data.include_earthing else 0

    return ServicesFirstFixQuantityModel(
        wet_rooms_count=wet_rooms,
        habitable_rooms_count=habitable_rooms,
        total_light_points=total_light_points,
        total_socket_points=total_socket_points,
        conduit_length_m=round(conduit_m, 1),
        lighting_cable_length_m=round(lighting_cable_m, 1),
        power_cable_length_m=round(power_cable_m, 1),
        junction_boxes_count=junction_boxes,
        cold_water_pipe_length_m=round(cold_water_pipe_m, 1),
        hot_water_pipe_length_m=round(hot_water_pipe_m, 1),
        waste_pipe_length_m=round(waste_pipe_m, 1),
        earthing_rods_count=earthing_rods,
        storey_factor=round(storey_factor, 3),
        waste_factor=WASTE_FACTOR,
        conduit_run_per_point_m=CONDUIT_RUN_PER_POINT_M,
    )


def build_services_first_fix_quantity_items(
    quantities: ServicesFirstFixQuantityModel,
    resolved_inputs: ServicesFirstFixResolvedInputs,
) -> list[QuantityItem]:
    return [
        QuantityItem(
            name="wet_rooms_count",
            value=float(quantities.wet_rooms_count),
            unit="count",
            formula="bathrooms + kitchens + laundry_rooms",
        ),
        QuantityItem(
            name="habitable_rooms_count",
            value=float(quantities.habitable_rooms_count),
            unit="count",
            formula=f"max(2, round(effective_floor_area_sqm / {ASSUMED_HABITABLE_ROOM_SIZE_SQM:.0f}))",
        ),
        QuantityItem(
            name="total_light_points",
            value=float(quantities.total_light_points),
            unit="point",
            formula="(habitable_rooms_count * light_points_per_room) + (wet_rooms_count * 2)",
        ),
        QuantityItem(
            name="total_socket_points",
            value=float(quantities.total_socket_points),
            unit="point",
            formula="(habitable_rooms_count * sockets_per_room) + (kitchens * 4) + (laundry_rooms * 2)",
        ),
        QuantityItem(
            name="storey_factor",
            value=quantities.storey_factor,
            unit="ratio",
            formula="1 + 0.2 * max(0, effective_storeys - 1)",
        ),
        QuantityItem(
            name="conduit_length_m",
            value=quantities.conduit_length_m,
            unit="m",
            formula=(
                "((total_light_points + total_socket_points) * conduit_run_per_point_m) "
                "* storey_factor * waste_factor"
            ),
        ),
        QuantityItem(
            name="lighting_cable_length_m",
            value=quantities.lighting_cable_length_m,
            unit="m",
            formula="total_light_points * conduit_run_per_point_m * storey_factor * waste_factor",
        ),
        QuantityItem(
            name="power_cable_length_m",
            value=quantities.power_cable_length_m,
            unit="m",
            formula="total_socket_points * conduit_run_per_point_m * storey_factor * waste_factor",
        ),
        QuantityItem(
            name="junction_boxes_count",
            value=float(quantities.junction_boxes_count),
            unit="pcs",
            formula="ceil((total_light_points + total_socket_points) / 4)",
        ),
        QuantityItem(
            name="cold_water_pipe_length_m",
            value=quantities.cold_water_pipe_length_m,
            unit="m",
            formula="wet_rooms_count * 18 * storey_factor * waste_factor",
        ),
        QuantityItem(
            name="hot_water_pipe_length_m",
            value=quantities.hot_water_pipe_length_m,
            unit="m",
            formula="(bathrooms + kitchens) * 12 * storey_factor * waste_factor if include_hot_water else 0",
        ),
        QuantityItem(
            name="waste_pipe_length_m",
            value=quantities.waste_pipe_length_m,
            unit="m",
            formula="wet_rooms_count * 15 * storey_factor * waste_factor",
        ),
        QuantityItem(
            name="earthing_rods_count",
            value=float(quantities.earthing_rods_count),
            unit="set",
            formula="1 if include_earthing else 0",
        ),
        QuantityItem(
            name="effective_floor_area_sqm",
            value=resolved_inputs.effective_floor_area_sqm,
            unit="sqm",
            formula=(
                "shared_geometry.total_floor_area_sqm"
                if resolved_inputs.used_geometry_floor_area
                else "services_first_fix.floor_area_sqm fallback"
            ),
        ),
        QuantityItem(
            name="effective_storeys",
            value=float(resolved_inputs.effective_storeys),
            unit="count",
            formula=(
                "shared_geometry.storeys"
                if resolved_inputs.used_geometry_storeys
                else "services_first_fix.storeys fallback"
            ),
        ),
    ]


def quantify_services_first_fix(data: ServicesFirstFixInput) -> ServicesFirstFixQuantityModel:
    """
    Transitional compatibility helper for older callers that don't pass shared geometry.
    """
    fallback_floor_area = max(float(data.floor_area_sqm or 1.0), 1.0)
    fallback_storeys = max(1, int(data.storeys or 1))

    return derive_services_first_fix_quantities(
        data=data,
        resolved_inputs=ServicesFirstFixResolvedInputs(
            effective_floor_area_sqm=fallback_floor_area,
            effective_storeys=fallback_storeys,
            used_geometry_floor_area=False,
            used_geometry_storeys=False,
        ),
    )
