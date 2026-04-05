from typing import Any, Dict, List

from app.estimation.phases.site_survey import estimate_site_survey
from app.estimation.phases.site_preparation import estimate_site_preparation
from app.estimation.phases.foundation import estimate_foundation
from app.estimation.phases.superstructure import estimate_superstructure
from app.estimation.geometry.building_geometry_resolver import resolve_building_geometry
from app.estimation.phases.roofing import estimate_roofing_phase
from app.estimation.phases.services_first_fix import estimate_services_first_fix
from app.estimation.phases.services_second_fix import estimate_services_second_fix
from app.estimation.phases.finishes import estimate_finishes
from app.estimation.phases.external_works import estimate_external_works

from app.estimation.schemas.aggregate import EstimationRequest
from app.core.logging import setup_logger
from app.services.recommendation_service import get_recommendations
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.permit import Permit
from app.models.estimate import Estimation
from app.estimation.storage import (
    append_index_entry,
    save_estimation_blob,
)
from uuid import uuid4


logger = setup_logger("estimation_aggregator")

async def generate_estimation(payload: EstimationRequest, db: AsyncSession, user_id: int) -> Dict[str, Any]:
    """
    Run all estimation phases and aggregate summary + breakdown.
    """

    vendor_prices = payload.vendor_prices or {}
    location_hint = getattr(payload.site_survey, "location", None)
    resolved_geometry = resolve_building_geometry(payload)

    phases = []

    logger.info("Starting estimation: site_survey")
    phases.append(estimate_site_survey(payload.site_survey))
    # logger.info(f"\n\n site survey information:\n {phases}")

    # logger.info("Starting estimation: site_preparation")
    phases.append(estimate_site_preparation(payload.site_preparation))
    # logger.info(f"\n\n site preparation information:\n {phases[1]}")

    # logger.info("Starting estimation: foundation")
    phases.append(estimate_foundation(payload.foundation, geometry=resolved_geometry))
    # logger.info(f"\n\n foundation information:\n {phases[2]}")

    # logger.info("Starting estimation: superstructure")
    phases.append(
        estimate_superstructure(
            payload.superstructure,
            geometry=resolved_geometry,
            vendor_prices=vendor_prices,
        )
    )
    # logger.info(f"\n\n superstrucutre information:\n {phases[3]}")

    # logger.info("Starting estimation: roofing")
    phases.append(
        estimate_roofing_phase(
            payload.roofing,
            geometry=resolved_geometry,
            vendor_prices=vendor_prices,
        )
    )
    # logger.info(f"\n\n roofing information:\n {phases[4]}")

    # logger.info("Starting estimation: services_first_fix")
    phases.append(
        estimate_services_first_fix(
            payload.services_first_fix,
            geometry=resolved_geometry,
            vendor_prices=vendor_prices,
        )
    )
    # logger.info(f"\n\n service first fix information:\n {phases[5]}")

    # logger.info("Starting estimation: services_second_fix")
    phases.append(
        estimate_services_second_fix(
            payload.services_second_fix,
            geometry=resolved_geometry,
            vendor_prices=vendor_prices,
        )
    )
    # logger.info(f"\n\n service second fix information:\n {phases[6]}")

    # logger.info("Starting estimation: finishes")
    phases.append(
        estimate_finishes(
            payload.finishes,
            geometry=resolved_geometry,
            vendor_prices=vendor_prices,
        )
    )
    # logger.info(f"\n\n finishes information:\n {phases[7]}")

    # logger.info("Starting estimation: external_works")
    phases.append(
        estimate_external_works(
            payload.external_works,
            geometry=resolved_geometry,
            vendor_prices=vendor_prices,
        )
    )
    # logger.info(f"\n\n external works information:\n {phases[8]}")

    material_total = sum(float(p.totals.materials or 0) for p in phases)
    labour_total = sum(float(p.totals.labour or 0) for p in phases)
    equipment_total = sum(float(getattr(p.totals, "equipment", 0) or 0) for p in phases)
    other_total = sum(float(p.totals.other or 0) for p in phases)

    resolved_floor_area_sqm = resolved_geometry.total_floor_area_sqm

    summary = {
        "total_cost": material_total + labour_total + equipment_total + other_total,
        "material_cost": material_total,
        "labour_cost": labour_total,
        "equipment_cost": equipment_total,
        "other_cost": other_total,
        "phases_count": len(phases),
    }
    project_details = {
        "project_name": payload.project_name or location_hint,
        "location": location_hint,
        "bedrooms": payload.superstructure.bedrooms,
        "bathrooms": payload.superstructure.bathrooms,
        "floor_area_sqm": resolved_floor_area_sqm,
        "footprint_area_sqm": resolved_geometry.footprint_area_sqm,
        "storeys": resolved_geometry.storeys,
        "geometry_area_source": resolved_geometry.area_source,
        "fits_plot_constraints": resolved_geometry.fits_plot_constraints,
        "geometry_caps_applied": resolved_geometry.caps_applied,
        "structure_type": payload.superstructure.structure_type,
        "finishing_level": payload.superstructure.finishing_level,
    }

    permits = [
        Permit(
            id="permit-county",
            name="County Building Permit",
            cost=45000,
            where="County Lands & Physical Planning Office",
            significance="Required to legally begin construction. Submit drawings & site plan.",
            duration_days=14,
            status="required",
        ),
        Permit(
            id="permit-nca",
            name="NCA Registration (if applicable)",
            cost=10000,
            where="National Construction Authority portal",
            significance="Register project; required for larger/structural works.",
            duration_days=7,
            status="recommended",
        ),
        Permit(
            id="permit-nema",
            name="NEMA Clearance (if needed)",
            cost=25000,
            where="NEMA offices / portal",
            significance="Environmental approval for larger sites.",
            duration_days=21,
            status="conditional",
        ),
        Permit(
            id="permit-electrical",
            name="Electrical Compliance Certificate",
            cost=8000,
            where="Kenya Power / ERB certified inspector",
            significance="Electrical safety compliance before connection.",
            duration_days=5,
            status="conditional",
        ),
    ]

    breakdown = [p.model_dump() for p in phases]

    recs = await get_recommendations(
        db=db,
        location=location_hint,
        vendor_category=None,
        technician_specialization=None,
        limit=5,
    )

    estimate_id = str(uuid4())

    response = {
        "id": estimate_id,
        "summary": summary,
        "project_details": project_details,
        "breakdown": breakdown,
        "permits": [p.model_dump() for p in permits],
        "recommendations": recs,
    }

    # Persist to disk with lightweight index
    blob_path_str: str | None = None
    try:
        blob_path = save_estimation_blob(user_id=user_id, estimate_id=estimate_id, data=response)
        blob_path_str = str(blob_path)
        append_index_entry(
            user_id=user_id,
            estimate_id=estimate_id,
            project_name=payload.project_name or location_hint,
            location=location_hint,
            total_cost=summary["total_cost"],
        )
    except Exception:
        logger.exception("Failed to persist estimation to disk/index", extra={"user_id": user_id})

    # Persist a queryable summary row in the DB (id matches JSON id)
    try:
        est_record = Estimation(
            estimate_id=estimate_id,
            user_id=user_id,
            project_title=payload.project_name or location_hint,
            location=location_hint,
            floor_area=resolved_floor_area_sqm,
            quality=payload.superstructure.finishing_level,
            total_cost=summary["total_cost"],
            blob_path=blob_path_str,
            summary_json=summary,
        )
        db.add(est_record)
        await db.commit()
    except Exception:
        await db.rollback()
        logger.exception("Failed to persist estimation summary in DB", extra={"user_id": user_id})

    try:
        logger.info(
            "Generated estimation",
            extra={"total_cost": summary["total_cost"], "phases": summary["phases_count"]},
        )
    except Exception:
        # avoid logging failures breaking response
        pass

    return response
