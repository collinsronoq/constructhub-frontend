from __future__ import annotations

from collections.abc import Mapping
from typing import Any, Optional

from pydantic import BaseModel

from app.estimation.phases.external_works.schemas import ExternalWorksInput
from app.estimation.phases.finishes.schemas import FinishesInput
from app.estimation.phases.foundation.schemas import FoundationInput
from app.estimation.phases.roofing.schemas import RoofingInput
from app.estimation.phases.services_first_fix.schemas import ServicesFirstFixInput
from app.estimation.phases.services_second_fix.schemas import ServicesSecondFixInput
from app.estimation.phases.site_preparation.schemas import SitePreparationInput
from app.estimation.phases.site_survey.schemas import SiteSurveyInput
from app.estimation.phases.superstructure.schemas import SuperstructureInput
from app.estimation.schemas.aggregate import EstimationRequest


def _as_mapping(
    value: Any,
    field: str,
    errors: list[str],
    *,
    required: bool = False,
) -> dict[str, Any]:
    if value is None:
        if required:
            errors.append(f"{field} is required and must be an object.")
        return {}
    if isinstance(value, Mapping):
        return dict(value)
    errors.append(f"{field} must be an object.")
    return {}


def _parse_float(
    value: Any,
    field: str,
    errors: list[str],
    *,
    minimum: float | None = None,
    default: float | None = None,
    allow_none: bool = False,
) -> float | None:
    if value is None or value == "":
        if allow_none:
            return None
        if default is not None:
            return default
        errors.append(f"{field} is required.")
        return None

    try:
        resolved = float(value)
    except (TypeError, ValueError):
        errors.append(f"{field} must be a valid number.")
        return default

    if minimum is not None and resolved < minimum:
        errors.append(f"{field} must be >= {minimum}.")
        return default
    return resolved


def _parse_int(
    value: Any,
    field: str,
    errors: list[str],
    *,
    minimum: int | None = None,
    default: int | None = None,
    allow_none: bool = False,
) -> int | None:
    if value is None or value == "":
        if allow_none:
            return None
        if default is not None:
            return default
        errors.append(f"{field} is required.")
        return None

    if isinstance(value, bool):
        errors.append(f"{field} must be an integer.")
        return default

    try:
        numeric = float(value)
    except (TypeError, ValueError):
        errors.append(f"{field} must be an integer.")
        return default

    if not numeric.is_integer():
        errors.append(f"{field} must be an integer.")
        return default

    resolved = int(numeric)
    if minimum is not None and resolved < minimum:
        errors.append(f"{field} must be >= {minimum}.")
        return default
    return resolved


def _parse_bool(
    value: Any,
    field: str,
    errors: list[str],
    *,
    default: bool = False,
    allow_none: bool = False,
) -> bool | None:
    if value is None:
        return None if allow_none else default

    if isinstance(value, bool):
        return value

    if isinstance(value, (int, float)) and value in (0, 1):
        return bool(value)

    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in {"1", "true", "yes", "y", "on"}:
            return True
        if normalized in {"0", "false", "no", "n", "off"}:
            return False

    errors.append(f"{field} must be a boolean.")
    return None if allow_none else default


def _normalize_literal(
    value: Any,
    allowed: tuple[str, ...],
    field: str,
    errors: list[str],
    *,
    default: str | None = None,
    allow_none: bool = False,
) -> str | None:
    if value is None or value == "":
        if allow_none:
            return None
        if default is not None:
            return default
        errors.append(f"{field} is required.")
        return allowed[0] if allowed else None

    normalized = str(value).strip()
    for option in allowed:
        if normalized == option or normalized.lower() == option.lower():
            return option

    errors.append(f"{field} must be one of: {', '.join(allowed)}.")
    if default is not None:
        return default
    return allowed[0] if allowed else None


def _normalize_additional_rooms(
    value: Any,
    errors: list[str],
) -> dict[str, dict[str, int]]:
    if value is None:
        return {}
    if not isinstance(value, Mapping):
        errors.append("superstructure.additional_rooms must be an object.")
        return {}

    normalized: dict[str, dict[str, int]] = {}
    for raw_name, raw_room in value.items():
        room_name = str(raw_name).strip()
        if not room_name:
            continue

        if isinstance(raw_room, Mapping):
            count_value = raw_room.get("count")
        else:
            count_value = raw_room

        count = _parse_int(
            count_value,
            f"superstructure.additional_rooms.{room_name}.count",
            errors,
            minimum=0,
            default=0,
        )
        if count and count > 0:
            normalized[room_name] = {"count": count}
    return normalized


def _derived_store_count(additional_rooms: dict[str, dict[str, int]]) -> int:
    labels = {"store", "stores", "storage", "store_room", "pantry"}
    return sum(room["count"] for name, room in additional_rooms.items() if name.lower() in labels)


class EstimationRequestIn(BaseModel):
    """
    Permissive input schema accepted by the API.
    `to_strict()` normalizes into the strict EstimationRequest contract consumed
    by estimator phases.
    """

    project_name: Optional[str] = None
    site_survey: Optional[dict[str, Any]] = None
    site_preparation: Optional[dict[str, Any]] = None
    foundation: Optional[dict[str, Any]] = None
    superstructure: Optional[dict[str, Any]] = None
    roofing: Optional[dict[str, Any]] = None
    services_first_fix: Optional[dict[str, Any]] = None
    services_second_fix: Optional[dict[str, Any]] = None
    finishes: Optional[dict[str, Any]] = None
    external_works: Optional[dict[str, Any]] = None
    vendor_prices: Optional[dict[str, Any]] = None

    def to_strict(self) -> EstimationRequest:
        errors: list[str] = []

        site_survey_raw = _as_mapping(self.site_survey, "site_survey", errors, required=True)
        superstructure_raw = _as_mapping(self.superstructure, "superstructure", errors, required=True)
        site_preparation_raw = _as_mapping(self.site_preparation, "site_preparation", errors)
        foundation_raw = _as_mapping(self.foundation, "foundation", errors)
        roofing_raw = _as_mapping(self.roofing, "roofing", errors)
        services_first_fix_raw = _as_mapping(self.services_first_fix, "services_first_fix", errors)
        services_second_fix_raw = _as_mapping(self.services_second_fix, "services_second_fix", errors)
        finishes_raw = _as_mapping(self.finishes, "finishes", errors)
        external_works_raw = _as_mapping(self.external_works, "external_works", errors)

        plot_size = _parse_float(
            site_survey_raw.get("plot_size_sqm"),
            "site_survey.plot_size_sqm",
            errors,
            minimum=0.1,
            allow_none=True,
        )
        if plot_size is None:
            plot_size = _parse_float(
                superstructure_raw.get("land_size_sqm"),
                "superstructure.land_size_sqm",
                errors,
                minimum=0.1,
                allow_none=True,
            )
        if plot_size is None:
            errors.append("site_survey.plot_size_sqm is required and must be > 0.")
            plot_size = 1.0

        declared_floor_area = _parse_float(
            superstructure_raw.get("declared_floor_area_sqm"),
            "superstructure.declared_floor_area_sqm",
            errors,
            minimum=0.1,
            allow_none=True,
        )
        land_size = _parse_float(
            superstructure_raw.get("land_size_sqm"),
            "superstructure.land_size_sqm",
            errors,
            minimum=0.1,
            allow_none=True,
        ) or plot_size

        roof_type_value = _normalize_literal(
            roofing_raw.get("roof_type") if roofing_raw.get("roof_type") is not None else superstructure_raw.get("roof_type"),
            ("gable", "hip", "flat", "mono_pitch"),
            "roofing.roof_type",
            errors,
            default="gable",
        )

        additional_rooms = _normalize_additional_rooms(superstructure_raw.get("additional_rooms"), errors)
        superstructure_stores = _parse_int(
            superstructure_raw.get("stores"),
            "superstructure.stores",
            errors,
            minimum=0,
            allow_none=True,
        )
        default_stores = (
            superstructure_stores
            if superstructure_stores is not None
            else _derived_store_count(additional_rooms)
        )

        ss = SiteSurveyInput(
            plot_size_sqm=plot_size,
            location=str(site_survey_raw.get("location") or "").strip(),
            include_soil_test=bool(
                _parse_bool(site_survey_raw.get("include_soil_test"), "site_survey.include_soil_test", errors, default=False)
            ),
            include_topographical_survey=bool(
                _parse_bool(
                    site_survey_raw.get("include_topographical_survey"),
                    "site_survey.include_topographical_survey",
                    errors,
                    default=False,
                )
            ),
            survey_quality=_normalize_literal(
                site_survey_raw.get("survey_quality"),
                ("standard", "premium"),
                "site_survey.survey_quality",
                errors,
                default="standard",
            ) or "standard",
        )

        sp = SitePreparationInput(
            plot_size_sqm=plot_size,
            soil_type=_normalize_literal(
                site_preparation_raw.get("soil_type"),
                ("soft", "medium", "rocky"),
                "site_preparation.soil_type",
                errors,
                default="medium",
            ) or "medium",
            excavation_depth_m=_parse_float(
                site_preparation_raw.get("excavation_depth_m"),
                "site_preparation.excavation_depth_m",
                errors,
                minimum=0.1,
                default=1.0,
            ) or 1.0,
            include_disposal=bool(
                _parse_bool(site_preparation_raw.get("include_disposal"), "site_preparation.include_disposal", errors, default=True)
            ),
            access_difficulty=_normalize_literal(
                site_preparation_raw.get("access_difficulty"),
                ("normal", "difficult"),
                "site_preparation.access_difficulty",
                errors,
                default="normal",
            ) or "normal",
            vegetation_density=_normalize_literal(
                site_preparation_raw.get("vegetation_density"),
                ("light", "medium", "heavy"),
                "site_preparation.vegetation_density",
                errors,
                default="medium",
            ) or "medium",
            has_existing_structures=bool(
                _parse_bool(
                    site_preparation_raw.get("has_existing_structures"),
                    "site_preparation.has_existing_structures",
                    errors,
                    default=False,
                )
            ),
        )

        ss_struct = SuperstructureInput(
            land_size_sqm=land_size,
            structure_type=_normalize_literal(
                superstructure_raw.get("structure_type"),
                ("bungalow", "two_storey", "three_storey", "multi_storey"),
                "superstructure.structure_type",
                errors,
                default="bungalow",
            ) or "bungalow",
            blockwork_type=_normalize_literal(
                superstructure_raw.get("blockwork_type"),
                ("burnt_bricks", "concrete_blocks", "machine_cut_blocks"),
                "superstructure.blockwork_type",
                errors,
                default="concrete_blocks",
            ) or "concrete_blocks",
            roof_type=roof_type_value or "gable",
            declared_floor_area_sqm=declared_floor_area,
            bedrooms=_parse_int(
                superstructure_raw.get("bedrooms"),
                "superstructure.bedrooms",
                errors,
                minimum=1,
                default=3,
            ) or 3,
            bathrooms=_parse_int(
                superstructure_raw.get("bathrooms"),
                "superstructure.bathrooms",
                errors,
                minimum=1,
                default=2,
            ) or 2,
            master_bedrooms=_parse_int(
                superstructure_raw.get("master_bedrooms"),
                "superstructure.master_bedrooms",
                errors,
                minimum=0,
                default=0,
            ) or 0,
            living_rooms=_parse_int(
                superstructure_raw.get("living_rooms"),
                "superstructure.living_rooms",
                errors,
                minimum=0,
                default=1,
            ) or 1,
            dining_rooms=_parse_int(
                superstructure_raw.get("dining_rooms"),
                "superstructure.dining_rooms",
                errors,
                minimum=0,
                default=1,
            ) or 1,
            kitchens=_parse_int(
                superstructure_raw.get("kitchens"),
                "superstructure.kitchens",
                errors,
                minimum=0,
                default=1,
            ) or 1,
            additional_rooms=additional_rooms,
            room_size_preference=_normalize_literal(
                superstructure_raw.get("room_size_preference"),
                ("compact", "standard", "spacious"),
                "superstructure.room_size_preference",
                errors,
                default="standard",
            ) or "standard",
            finishing_level=_normalize_literal(
                superstructure_raw.get("finishing_level"),
                ("standard", "premium", "luxury"),
                "superstructure.finishing_level",
                errors,
                default="standard",
            ) or "standard",
        )

        foundation_floor_area_value = (
            foundation_raw.get("floor_area_sqm")
            if foundation_raw.get("floor_area_sqm") is not None
            else foundation_raw.get("footprint_sqm")
        )

        foundation = FoundationInput(
            foundation_type=_normalize_literal(
                foundation_raw.get("foundation_type"),
                ("strip", "raft"),
                "foundation.foundation_type",
                errors,
                default="strip",
            ) or "strip",
            floor_area_sqm=_parse_float(
                foundation_floor_area_value,
                "foundation.floor_area_sqm",
                errors,
                minimum=0.1,
                allow_none=True,
            ),
            soil_type=_normalize_literal(
                foundation_raw.get("soil_type"),
                ("soft", "medium", "rocky"),
                "foundation.soil_type",
                errors,
                default=sp.soil_type,
            ) or sp.soil_type,
            quality_level=_normalize_literal(
                foundation_raw.get("quality_level"),
                ("standard", "premium"),
                "foundation.quality_level",
                errors,
                default="standard",
            ) or "standard",
            include_formwork=bool(
                _parse_bool(foundation_raw.get("include_formwork"), "foundation.include_formwork", errors, default=True)
            ),
        )

        roofing = RoofingInput(
            roof_type=roof_type_value or "gable",
            roof_covering=_normalize_literal(
                roofing_raw.get("roof_covering"),
                ("corrugated_mabati", "box_profile_mabati", "stone_coated_tiles", "clay_tiles"),
                "roofing.roof_covering",
                errors,
                default="corrugated_mabati",
            ) or "corrugated_mabati",
            roof_pitch=_normalize_literal(
                roofing_raw.get("roof_pitch"),
                ("low", "medium", "steep"),
                "roofing.roof_pitch",
                errors,
                default="medium",
            ) or "medium",
            building_footprint_sqm=_parse_float(
                roofing_raw.get("building_footprint_sqm"),
                "roofing.building_footprint_sqm",
                errors,
                minimum=0.1,
                allow_none=True,
            ),
            storeys=_parse_int(
                roofing_raw.get("storeys"),
                "roofing.storeys",
                errors,
                minimum=1,
                allow_none=True,
            ),
            include_overhangs=bool(
                _parse_bool(roofing_raw.get("include_overhangs"), "roofing.include_overhangs", errors, default=True)
            ),
        )

        sff = ServicesFirstFixInput(
            floor_area_sqm=_parse_float(
                services_first_fix_raw.get("floor_area_sqm"),
                "services_first_fix.floor_area_sqm",
                errors,
                minimum=0.1,
                allow_none=True,
            ),
            storeys=_parse_int(
                services_first_fix_raw.get("storeys"),
                "services_first_fix.storeys",
                errors,
                minimum=1,
                allow_none=True,
            ),
            bathrooms=_parse_int(
                services_first_fix_raw.get("bathrooms"),
                "services_first_fix.bathrooms",
                errors,
                minimum=0,
                default=ss_struct.bathrooms,
            )
            if services_first_fix_raw.get("bathrooms") is not None
            else ss_struct.bathrooms,
            kitchens=_parse_int(
                services_first_fix_raw.get("kitchens"),
                "services_first_fix.kitchens",
                errors,
                minimum=0,
                default=ss_struct.kitchens,
            )
            if services_first_fix_raw.get("kitchens") is not None
            else ss_struct.kitchens,
            laundry_rooms=_parse_int(
                services_first_fix_raw.get("laundry_rooms"),
                "services_first_fix.laundry_rooms",
                errors,
                minimum=0,
                default=0,
            )
            or 0,
            sockets_per_room=_parse_int(
                services_first_fix_raw.get("sockets_per_room"),
                "services_first_fix.sockets_per_room",
                errors,
                minimum=0,
                default=4,
            )
            or 4,
            light_points_per_room=_parse_int(
                services_first_fix_raw.get("light_points_per_room"),
                "services_first_fix.light_points_per_room",
                errors,
                minimum=0,
                default=2,
            )
            or 2,
            quality_level=_normalize_literal(
                services_first_fix_raw.get("quality_level"),
                ("standard", "premium"),
                "services_first_fix.quality_level",
                errors,
                default="standard",
            )
            or "standard",
            include_hot_water=bool(
                _parse_bool(
                    services_first_fix_raw.get("include_hot_water"),
                    "services_first_fix.include_hot_water",
                    errors,
                    default=True,
                )
            ),
            include_earthing=bool(
                _parse_bool(
                    services_first_fix_raw.get("include_earthing"),
                    "services_first_fix.include_earthing",
                    errors,
                    default=True,
                )
            ),
        )

        s2f = ServicesSecondFixInput(
            floor_area_sqm=_parse_float(
                services_second_fix_raw.get("floor_area_sqm"),
                "services_second_fix.floor_area_sqm",
                errors,
                minimum=0.1,
                allow_none=True,
            ),
            storeys=_parse_int(
                services_second_fix_raw.get("storeys"),
                "services_second_fix.storeys",
                errors,
                minimum=1,
                allow_none=True,
            ),
            bedrooms=_parse_int(
                services_second_fix_raw.get("bedrooms"),
                "services_second_fix.bedrooms",
                errors,
                minimum=0,
                default=ss_struct.bedrooms,
            )
            if services_second_fix_raw.get("bedrooms") is not None
            else ss_struct.bedrooms,
            bathrooms=_parse_int(
                services_second_fix_raw.get("bathrooms"),
                "services_second_fix.bathrooms",
                errors,
                minimum=0,
                default=ss_struct.bathrooms,
            )
            if services_second_fix_raw.get("bathrooms") is not None
            else ss_struct.bathrooms,
            kitchens=_parse_int(
                services_second_fix_raw.get("kitchens"),
                "services_second_fix.kitchens",
                errors,
                minimum=0,
                default=ss_struct.kitchens,
            )
            if services_second_fix_raw.get("kitchens") is not None
            else ss_struct.kitchens,
            living_rooms=_parse_int(
                services_second_fix_raw.get("living_rooms"),
                "services_second_fix.living_rooms",
                errors,
                minimum=0,
                default=ss_struct.living_rooms,
            )
            if services_second_fix_raw.get("living_rooms") is not None
            else ss_struct.living_rooms,
            dining_rooms=_parse_int(
                services_second_fix_raw.get("dining_rooms"),
                "services_second_fix.dining_rooms",
                errors,
                minimum=0,
                default=ss_struct.dining_rooms,
            )
            if services_second_fix_raw.get("dining_rooms") is not None
            else ss_struct.dining_rooms,
            sockets_per_room=_parse_int(
                services_second_fix_raw.get("sockets_per_room"),
                "services_second_fix.sockets_per_room",
                errors,
                minimum=0,
                default=4,
            )
            or 4,
            light_points_per_room=_parse_int(
                services_second_fix_raw.get("light_points_per_room"),
                "services_second_fix.light_points_per_room",
                errors,
                minimum=0,
                default=2,
            )
            or 2,
            include_shower_mixers=bool(
                _parse_bool(
                    services_second_fix_raw.get("include_shower_mixers"),
                    "services_second_fix.include_shower_mixers",
                    errors,
                    default=True,
                )
            ),
            include_instant_showers=bool(
                _parse_bool(
                    services_second_fix_raw.get("include_instant_showers"),
                    "services_second_fix.include_instant_showers",
                    errors,
                    default=True,
                )
            ),
            quality_level=_normalize_literal(
                services_second_fix_raw.get("quality_level"),
                ("standard", "premium"),
                "services_second_fix.quality_level",
                errors,
                default="standard",
            )
            or "standard",
        )

        fin = FinishesInput(
            floor_area_sqm=_parse_float(
                finishes_raw.get("floor_area_sqm"),
                "finishes.floor_area_sqm",
                errors,
                minimum=0.1,
                allow_none=True,
            ),
            storeys=_parse_int(
                finishes_raw.get("storeys"),
                "finishes.storeys",
                errors,
                minimum=1,
                allow_none=True,
            ),
            wall_height_m=_parse_float(
                finishes_raw.get("wall_height_m"),
                "finishes.wall_height_m",
                errors,
                minimum=2.0,
                default=3.0,
            )
            or 3.0,
            bedrooms=_parse_int(
                finishes_raw.get("bedrooms"),
                "finishes.bedrooms",
                errors,
                minimum=0,
                default=ss_struct.bedrooms,
            )
            if finishes_raw.get("bedrooms") is not None
            else ss_struct.bedrooms,
            master_bedrooms=_parse_int(
                finishes_raw.get("master_bedrooms"),
                "finishes.master_bedrooms",
                errors,
                minimum=0,
                default=ss_struct.master_bedrooms,
            )
            if finishes_raw.get("master_bedrooms") is not None
            else ss_struct.master_bedrooms,
            bathrooms=_parse_int(
                finishes_raw.get("bathrooms"),
                "finishes.bathrooms",
                errors,
                minimum=0,
                default=ss_struct.bathrooms,
            )
            if finishes_raw.get("bathrooms") is not None
            else ss_struct.bathrooms,
            kitchens=_parse_int(
                finishes_raw.get("kitchens"),
                "finishes.kitchens",
                errors,
                minimum=0,
                default=ss_struct.kitchens,
            )
            if finishes_raw.get("kitchens") is not None
            else ss_struct.kitchens,
            living_rooms=_parse_int(
                finishes_raw.get("living_rooms"),
                "finishes.living_rooms",
                errors,
                minimum=0,
                default=ss_struct.living_rooms,
            )
            if finishes_raw.get("living_rooms") is not None
            else ss_struct.living_rooms,
            dining_rooms=_parse_int(
                finishes_raw.get("dining_rooms"),
                "finishes.dining_rooms",
                errors,
                minimum=0,
                default=ss_struct.dining_rooms,
            )
            if finishes_raw.get("dining_rooms") is not None
            else ss_struct.dining_rooms,
            stores=_parse_int(
                finishes_raw.get("stores"),
                "finishes.stores",
                errors,
                minimum=0,
                default=default_stores,
            )
            if finishes_raw.get("stores") is not None
            else default_stores,
            other_rooms=_parse_int(
                finishes_raw.get("other_rooms"),
                "finishes.other_rooms",
                errors,
                minimum=0,
                default=0,
            )
            or 0,
            main_floor_finish=_normalize_literal(
                finishes_raw.get("main_floor_finish"),
                ("tile", "laminate", "parquet", "polished_screed"),
                "finishes.main_floor_finish",
                errors,
                default="tile",
            )
            or "tile",
            wet_floor_finish=_normalize_literal(
                finishes_raw.get("wet_floor_finish"),
                ("ceramic_tile", "porcelain_tile"),
                "finishes.wet_floor_finish",
                errors,
                default="ceramic_tile",
            )
            or "ceramic_tile",
            wet_wall_tiling=bool(
                _parse_bool(finishes_raw.get("wet_wall_tiling"), "finishes.wet_wall_tiling", errors, default=True)
            ),
            ceiling_type=_normalize_literal(
                finishes_raw.get("ceiling_type"),
                ("gypsum_board", "acoustic_board", "tng", "exposed"),
                "finishes.ceiling_type",
                errors,
                default="gypsum_board",
            )
            or "gypsum_board",
            paint_system=_normalize_literal(
                finishes_raw.get("paint_system"),
                ("standard_2_coat", "premium_3_coat"),
                "finishes.paint_system",
                errors,
                default="standard_2_coat",
            )
            or "standard_2_coat",
            include_cornices=bool(
                _parse_bool(finishes_raw.get("include_cornices"), "finishes.include_cornices", errors, default=True)
            ),
            include_skirting=bool(
                _parse_bool(finishes_raw.get("include_skirting"), "finishes.include_skirting", errors, default=True)
            ),
            include_wardrobes=bool(
                _parse_bool(finishes_raw.get("include_wardrobes"), "finishes.include_wardrobes", errors, default=True)
            ),
            include_kitchen_cabinets=bool(
                _parse_bool(
                    finishes_raw.get("include_kitchen_cabinets"),
                    "finishes.include_kitchen_cabinets",
                    errors,
                    default=True,
                )
            ),
            include_bathroom_cabinetry=bool(
                _parse_bool(
                    finishes_raw.get("include_bathroom_cabinetry"),
                    "finishes.include_bathroom_cabinetry",
                    errors,
                    default=True,
                )
            ),
            include_store_cabinetry=bool(
                _parse_bool(
                    finishes_raw.get("include_store_cabinetry"),
                    "finishes.include_store_cabinetry",
                    errors,
                    default=True,
                )
            ),
            joinery_level=_normalize_literal(
                finishes_raw.get("joinery_level"),
                ("standard", "premium"),
                "finishes.joinery_level",
                errors,
                default="standard",
            )
            or "standard",
            quality_level=_normalize_literal(
                finishes_raw.get("quality_level"),
                ("standard", "premium", "luxury"),
                "finishes.quality_level",
                errors,
                default="standard",
            )
            or "standard",
        )

        legacy_include_gate = _parse_bool(
            external_works_raw.get("include_gate"),
            "external_works.include_gate",
            errors,
            allow_none=True,
        )
        perimeter_default = bool(legacy_include_gate) if legacy_include_gate is not None else False
        perimeter_enabled = bool(
            _parse_bool(
                external_works_raw.get("perimeter_wall_enabled"),
                "external_works.perimeter_wall_enabled",
                errors,
                default=perimeter_default,
            )
        )

        gate_default_count = 1 if perimeter_enabled else 0
        external_land_size = _parse_float(
            external_works_raw.get("land_size_sqm"),
            "external_works.land_size_sqm",
            errors,
            minimum=0.1,
            allow_none=True,
        ) or plot_size

        ext = ExternalWorksInput(
            land_size_sqm=external_land_size,
            floor_area_sqm=_parse_float(
                external_works_raw.get("floor_area_sqm"),
                "external_works.floor_area_sqm",
                errors,
                minimum=0.1,
                allow_none=True,
            ),
            perimeter_wall_enabled=perimeter_enabled,
            perimeter_wall_type=_normalize_literal(
                external_works_raw.get("perimeter_wall_type"),
                ("block_wall", "precast", "chain_link", "none"),
                "external_works.perimeter_wall_type",
                errors,
                default="block_wall",
            )
            or "block_wall",
            perimeter_wall_length_m=_parse_float(
                external_works_raw.get("perimeter_wall_length_m"),
                "external_works.perimeter_wall_length_m",
                errors,
                minimum=0.1,
                allow_none=True,
            ),
            perimeter_wall_height_m=_parse_float(
                external_works_raw.get("perimeter_wall_height_m"),
                "external_works.perimeter_wall_height_m",
                errors,
                minimum=1.0,
                default=2.4,
            )
            or 2.4,
            gate_count=_parse_int(
                external_works_raw.get("gate_count"),
                "external_works.gate_count",
                errors,
                minimum=0,
                default=gate_default_count,
            )
            if external_works_raw.get("gate_count") is not None
            else gate_default_count,
            gate_width_m=_parse_float(
                external_works_raw.get("gate_width_m"),
                "external_works.gate_width_m",
                errors,
                minimum=0.5,
                default=3.0,
            )
            or 3.0,
            razor_wire=bool(
                _parse_bool(external_works_raw.get("razor_wire"), "external_works.razor_wire", errors, default=False)
            ),
            paving_area_sqm=_parse_float(
                external_works_raw.get("paving_area_sqm"),
                "external_works.paving_area_sqm",
                errors,
                minimum=0.1,
                allow_none=True,
            ),
            driveway_area_sqm=_parse_float(
                external_works_raw.get("driveway_area_sqm"),
                "external_works.driveway_area_sqm",
                errors,
                minimum=0.1,
                allow_none=True,
            ),
            drainage_length_m=_parse_float(
                external_works_raw.get("drainage_length_m"),
                "external_works.drainage_length_m",
                errors,
                minimum=0.1,
                allow_none=True,
            ),
            landscaping_area_sqm=_parse_float(
                external_works_raw.get("landscaping_area_sqm"),
                "external_works.landscaping_area_sqm",
                errors,
                minimum=0.1,
                allow_none=True,
            ),
            sewerage_system=_normalize_literal(
                external_works_raw.get("sewerage_system"),
                ("septic_tank", "biodigester", "sewer_connection"),
                "external_works.sewerage_system",
                errors,
                default="septic_tank",
            )
            or "septic_tank",
            sewer_connection_length_m=_parse_float(
                external_works_raw.get("sewer_connection_length_m"),
                "external_works.sewer_connection_length_m",
                errors,
                minimum=0.1,
                default=10.0,
            )
            or 10.0,
            biodigester_capacity_users=_parse_int(
                external_works_raw.get("biodigester_capacity_users"),
                "external_works.biodigester_capacity_users",
                errors,
                minimum=1,
                default=8,
            )
            or 8,
            quality_level=_normalize_literal(
                external_works_raw.get("quality_level"),
                ("standard", "premium"),
                "external_works.quality_level",
                errors,
                default="standard",
            )
            or "standard",
        )

        if self.vendor_prices is not None and not isinstance(self.vendor_prices, Mapping):
            errors.append("vendor_prices must be an object.")

        if errors:
            details = "; ".join(errors[:12])
            if len(errors) > 12:
                details = f"{details}; ... (+{len(errors) - 12} more)"
            raise ValueError(f"Request validation failed: {details}")

        return EstimationRequest(
            project_name=self.project_name,
            site_survey=ss,
            site_preparation=sp,
            foundation=foundation,
            superstructure=ss_struct,
            roofing=roofing,
            services_first_fix=sff,
            services_second_fix=s2f,
            finishes=fin,
            external_works=ext,
            vendor_prices=dict(self.vendor_prices) if isinstance(self.vendor_prices, Mapping) else None,
        )
