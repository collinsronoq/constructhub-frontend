import math
from typing import Optional, Dict, Any
from pydantic import BaseModel

from app.estimation.schemas.aggregate import EstimationRequest
from app.estimation.phases.site_survey.schemas import SiteSurveyInput
from app.estimation.phases.site_preparation.schemas import SitePreparationInput
from app.estimation.phases.foundation.schemas import FoundationInput
from app.estimation.phases.superstructure.schemas import SuperstructureInput
from app.estimation.phases.roofing.schemas import RoofingInput
from app.estimation.schemas.services import ServicesFirstFixInput, ServicesSecondFixInput
from app.estimation.schemas.finishes import FinishesInput
from app.estimation.schemas.external import ExternalWorksInput


def _pick_literal(value: Optional[str], allowed: tuple[str, ...], default: str) -> str:
    if value and value in allowed:
        return value
    if value:
        # Try case-insensitive match
        for a in allowed:
            if value.lower() == a.lower():
                return a
    return default


class EstimationRequestIn(BaseModel):
    """
    Permissive input schema that accepts optional/looser values and normalises
    into the strict EstimationRequest expected by estimation logic.
    """

    project_name: Optional[str] = None
    site_survey: Optional[Dict[str, Any]] = None
    site_preparation: Optional[Dict[str, Any]] = None
    foundation: Optional[Dict[str, Any]] = None
    superstructure: Optional[Dict[str, Any]] = None
    roofing: Optional[Dict[str, Any]] = None
    services_first_fix: Optional[Dict[str, Any]] = None
    services_second_fix: Optional[Dict[str, Any]] = None
    finishes: Optional[Dict[str, Any]] = None
    external_works: Optional[Dict[str, Any]] = None
    vendor_prices: Optional[Dict[str, Any]] = None

    def to_strict(self) -> EstimationRequest:
        # Core derived numbers
        plot_size = float(self.site_survey.get("plot_size_sqm", 0) if self.site_survey else 0) or 1.0

        declared_floor_area = None
        if self.superstructure:
            raw_declared = self.superstructure.get("declared_floor_area_sqm")
            try:
                if raw_declared and float(raw_declared) > 0:
                    declared_floor_area = float(raw_declared)
            except (TypeError, ValueError):
                declared_floor_area = None

        default_floor_area = declared_floor_area if declared_floor_area is not None else plot_size * 0.4

        roof_type_value = _pick_literal(
            (self.roofing or {}).get("roof_type") or (self.superstructure or {}).get("roof_type"),
            ("gable", "hip", "flat", "mono_pitch"),
            "gable",
        )

        # Site survey
        ss = SiteSurveyInput(
            plot_size_sqm=plot_size,
            location=(self.site_survey or {}).get("location", ""),
            include_soil_test=bool((self.site_survey or {}).get("include_soil_test", False)),
            include_topographical_survey=bool((self.site_survey or {}).get("include_topographical_survey", False)),
            survey_quality=_pick_literal((self.site_survey or {}).get("survey_quality"), ("standard", "premium"), "standard"),
        )

        # Site preparation
        sp = SitePreparationInput(
            plot_size_sqm=plot_size,
            soil_type=_pick_literal((self.site_preparation or {}).get("soil_type"), ("soft", "medium", "rocky"), "medium"),
            excavation_depth_m=float((self.site_preparation or {}).get("excavation_depth_m", 1) or 1),
            include_disposal=bool((self.site_preparation or {}).get("include_disposal", True)),
            access_difficulty=_pick_literal((self.site_preparation or {}).get("access_difficulty"), ("normal", "difficult"), "normal"),
            vegetation_density=_pick_literal((self.site_preparation or {}).get("vegetation_density"), ("light", "medium", "heavy"), "medium"),
            has_existing_structures=bool((self.site_preparation or {}).get("has_existing_structures", False)),
        )

        # Superstructure
        ss_struct = SuperstructureInput(
            land_size_sqm=float((self.superstructure or {}).get("land_size_sqm", plot_size) or plot_size),
            structure_type=_pick_literal((self.superstructure or {}).get("structure_type"), ("bungalow", "two_storey", "three_storey", "multi_storey"), "bungalow"),
            blockwork_type=_pick_literal((self.superstructure or {}).get("blockwork_type"), ("burnt_bricks", "concrete_blocks", "machine_cut_blocks"), "concrete_blocks"),
            roof_type=roof_type_value,
            declared_floor_area_sqm=declared_floor_area,
            bedrooms=int((self.superstructure or {}).get("bedrooms", 3) or 3),
            bathrooms=int((self.superstructure or {}).get("bathrooms", 2) or 2),
            master_bedrooms=int((self.superstructure or {}).get("master_bedrooms", 0) or 0),
            living_rooms=int((self.superstructure or {}).get("living_rooms", 1) or 1),
            dining_rooms=int((self.superstructure or {}).get("dining_rooms", 1) or 1),
            kitchens=int((self.superstructure or {}).get("kitchens", 1) or 1),
            stores=int((self.superstructure or {}).get("stores", 2) or 2),
            additional_rooms=(self.superstructure or {}).get("additional_rooms", {}),
            room_size_preference=_pick_literal((self.superstructure or {}).get("room_size_preference"), ("compact", "standard", "spacious"), "standard"),
            finishing_level=_pick_literal((self.superstructure or {}).get("finishing_level"), ("standard", "premium", "luxury"), "standard"),
        )

        # Foundation (use declared floor area as default footprint)
        footprint = float((self.foundation or {}).get("footprint_sqm", default_floor_area) or default_floor_area)
        foundation = FoundationInput(
            foundation_type=_pick_literal((self.foundation or {}).get("foundation_type"), ("strip", "raft"), "strip"),
            floor_area_sqm=float((self.foundation or {}).get("floor_area_sqm", default_floor_area) or default_floor_area),
            soil_type=_pick_literal((self.foundation or {}).get("soil_type"), ("soft", "medium", "rocky"), sp.soil_type),
            quality_level=_pick_literal((self.foundation or {}).get("quality_level"), ("standard", "premium"), "standard"),
            include_formwork=bool((self.foundation or {}).get("include_formwork", True)),
        )

        # Roofing
        roofing = RoofingInput(
            roof_type=roof_type_value,
            roof_covering=_pick_literal((self.roofing or {}).get("roof_covering"), ("corrugated_mabati", "box_profile_mabati", "stone_coated_tiles", "clay_tiles"), "corrugated_mabati"),
            roof_pitch=_pick_literal((self.roofing or {}).get("roof_pitch"), ("low", "medium", "steep"), "medium"),
            building_footprint_sqm=float((self.roofing or {}).get("building_footprint_sqm", footprint) or footprint),
            storeys=int((self.roofing or {}).get("storeys", 1) or 1),
            include_overhangs=bool((self.roofing or {}).get("include_overhangs", True)),
        )

        # Services - use floor area
        services_floor = float((self.services_first_fix or {}).get("floor_area_sqm", default_floor_area) or default_floor_area)
        sff = ServicesFirstFixInput(
            floor_area_sqm=services_floor,
            storeys=int((self.services_first_fix or {}).get("storeys", roofing.storeys) or roofing.storeys),
            bathrooms=int((self.services_first_fix or {}).get("bathrooms", ss_struct.bathrooms) or ss_struct.bathrooms),
            kitchens=int((self.services_first_fix or {}).get("kitchens", ss_struct.kitchens) or ss_struct.kitchens),
            laundry_rooms=int((self.services_first_fix or {}).get("laundry_rooms", 0) or 0),
            sockets_per_room=int((self.services_first_fix or {}).get("sockets_per_room", 4) or 4),
            light_points_per_room=int((self.services_first_fix or {}).get("light_points_per_room", 2) or 2),
            quality_level=_pick_literal((self.services_first_fix or {}).get("quality_level"), ("standard", "premium"), "standard"),
            include_hot_water=bool((self.services_first_fix or {}).get("include_hot_water", True)),
            include_earthing=bool((self.services_first_fix or {}).get("include_earthing", True)),
        )
        s2f = ServicesSecondFixInput(
            floor_area_sqm=float((self.services_second_fix or {}).get("floor_area_sqm", services_floor) or services_floor),
            storeys=int((self.services_second_fix or {}).get("storeys", roofing.storeys) or roofing.storeys),
            bedrooms=int((self.services_second_fix or {}).get("bedrooms", ss_struct.bedrooms) or ss_struct.bedrooms),
            bathrooms=int((self.services_second_fix or {}).get("bathrooms", ss_struct.bathrooms) or ss_struct.bathrooms),
            kitchens=int((self.services_second_fix or {}).get("kitchens", ss_struct.kitchens) or ss_struct.kitchens),
            living_rooms=int((self.services_second_fix or {}).get("living_rooms", ss_struct.living_rooms) or ss_struct.living_rooms),
            dining_rooms=int((self.services_second_fix or {}).get("dining_rooms", ss_struct.dining_rooms) or ss_struct.dining_rooms),
            sockets_per_room=int((self.services_second_fix or {}).get("sockets_per_room", 4) or 4),
            light_points_per_room=int((self.services_second_fix or {}).get("light_points_per_room", 2) or 2),
            include_shower_mixers=bool((self.services_second_fix or {}).get("include_shower_mixers", True)),
            include_instant_showers=bool((self.services_second_fix or {}).get("include_instant_showers", True)),
            quality_level=_pick_literal((self.services_second_fix or {}).get("quality_level"), ("standard", "premium"), "standard"),
        )

        # Finishes
        finishes_floor = float((self.finishes or {}).get("floor_area_sqm", services_floor) or services_floor)
        fin = FinishesInput(
            floor_area_sqm=finishes_floor,
            storeys=int((self.finishes or {}).get("storeys", roofing.storeys) or roofing.storeys),
            wall_height_m=float((self.finishes or {}).get("wall_height_m", 3.0) or 3.0),
            bedrooms=int((self.finishes or {}).get("bedrooms", ss_struct.bedrooms) or ss_struct.bedrooms),
            bathrooms=int((self.finishes or {}).get("bathrooms", ss_struct.bathrooms) or ss_struct.bathrooms),
            kitchens=int((self.finishes or {}).get("kitchens", ss_struct.kitchens) or ss_struct.kitchens),
            living_rooms=int((self.finishes or {}).get("living_rooms", ss_struct.living_rooms) or ss_struct.living_rooms),
            dining_rooms=int((self.finishes or {}).get("dining_rooms", ss_struct.dining_rooms) or ss_struct.dining_rooms),
            other_rooms=int((self.finishes or {}).get("other_rooms", 0) or 0),
            main_floor_finish=_pick_literal((self.finishes or {}).get("main_floor_finish"), ("tile", "laminate", "parquet", "polished_screed"), "tile"),
            wet_floor_finish=_pick_literal((self.finishes or {}).get("wet_floor_finish"), ("ceramic_tile", "porcelain_tile"), "ceramic_tile"),
            wet_wall_tiling=bool((self.finishes or {}).get("wet_wall_tiling", True)),
            ceiling_type=_pick_literal((self.finishes or {}).get("ceiling_type"), ("gypsum_board", "acoustic_board", "tng", "exposed"), "gypsum_board"),
            paint_system=_pick_literal((self.finishes or {}).get("paint_system"), ("standard_2_coat", "premium_3_coat"), "standard_2_coat"),
            include_cornices=bool((self.finishes or {}).get("include_cornices", True)),
            include_skirting=bool((self.finishes or {}).get("include_skirting", True)),
            include_wardrobes=bool((self.finishes or {}).get("include_wardrobes", True)),
            include_kitchen_cabinets=bool((self.finishes or {}).get("include_kitchen_cabinets", True)),
            joinery_level=_pick_literal((self.finishes or {}).get("joinery_level"), ("standard", "premium"), "standard"),
            quality_level=_pick_literal((self.finishes or {}).get("quality_level"), ("standard", "premium", "luxury"), "standard"),
        )

        # External works
        perimeter_enabled = bool((self.external_works or {}).get("perimeter_wall_enabled", False))
        land_size = float((self.external_works or {}).get("land_size_sqm", plot_size) or plot_size)
        ext_floor = float((self.external_works or {}).get("floor_area_sqm", finishes_floor) or finishes_floor)
        # Heuristic perimeter for square plot if missing
        perimeter_len = (self.external_works or {}).get("perimeter_wall_length_m")
        if perimeter_enabled and (perimeter_len is None or perimeter_len <= 0):
            side = math.sqrt(land_size)
            perimeter_len = 4 * side
        landscaping_area = (self.external_works or {}).get("landscaping_area_sqm")
        if landscaping_area is None or landscaping_area <= 0:
            landscaping_area = land_size * 0.2
        ext = ExternalWorksInput(
            land_size_sqm=land_size,
            floor_area_sqm=ext_floor,
            perimeter_wall_enabled=perimeter_enabled,
            perimeter_wall_type=_pick_literal((self.external_works or {}).get("perimeter_wall_type"), ("block_wall", "precast", "chain_link", "none"), "block_wall"),
            perimeter_wall_length_m=perimeter_len,
            perimeter_wall_height_m=float((self.external_works or {}).get("perimeter_wall_height_m", 2.4) or 2.4),
            gate_count=int((self.external_works or {}).get("gate_count", 1) or 1),
            gate_width_m=float((self.external_works or {}).get("gate_width_m", 3.0) or 3.0),
            razor_wire=bool((self.external_works or {}).get("razor_wire", False)),
            paving_area_sqm=(self.external_works or {}).get("paving_area_sqm"),
            drainage_length_m=(self.external_works or {}).get("drainage_length_m"),
            landscaping_area_sqm=landscaping_area,
            sewerage_system=_pick_literal((self.external_works or {}).get("sewerage_system"), ("septic_tank", "biodigester", "sewer_connection"), "septic_tank"),
            sewer_connection_length_m=float((self.external_works or {}).get("sewer_connection_length_m", 10) or 10),
            biodigester_capacity_users=int((self.external_works or {}).get("biodigester_capacity_users", 8) or 8),
            quality_level=_pick_literal((self.external_works or {}).get("quality_level"), ("standard", "premium"), "standard"),
        )

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
            vendor_prices=self.vendor_prices,
        )
