from typing import Any, Dict, List

from app.estimation.phases.site_survey import estimate_site_survey
from app.estimation.phases.site_preparation import estimate_site_preparation
from app.estimation.phases.foundation import estimate_foundation
from app.estimation.phases.superstructure.estimate_superstructure import estimate_superstructure
from app.estimation.phases.roofing.estimate_roofing import estimate_roofing_phase
from app.estimation.phases.services_first_fix.estimate_services_first_fix import estimate_services_first_fix
from app.estimation.phases.services_second_fix.estimate_services_second_fix import estimate_services_second_fix
from app.estimation.phases.finishes.estimate_finishes import estimate_finishes
from app.estimation.phases.external_works.estimate_external_works import estimate_external_works

from app.estimation.schemas.aggregate import EstimationRequest
from app.core.logging import setup_logger
from app.services.recommendation_service import get_recommendations
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.permit import Permit
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

    phases = []

    phases.append(estimate_site_survey(payload.site_survey))
    phases.append(estimate_site_preparation(payload.site_preparation))
    phases.append(estimate_foundation(payload.foundation))
    phases.append(estimate_superstructure(payload.superstructure, vendor_prices=vendor_prices))
    phases.append(estimate_roofing_phase(payload.roofing, vendor_prices=vendor_prices))
    phases.append(estimate_services_first_fix(payload.services_first_fix, vendor_prices=vendor_prices))
    phases.append(estimate_services_second_fix(payload.services_second_fix, vendor_prices=vendor_prices))
    phases.append(estimate_finishes(payload.finishes, vendor_prices=vendor_prices))
    phases.append(estimate_external_works(payload.external_works, vendor_prices=vendor_prices))

    material_total = sum(p.totals.materials for p in phases)
    labour_total = sum(p.totals.labour for p in phases)
    other_total = sum(p.totals.other for p in phases)

    summary = {
        "total_cost": material_total + labour_total + other_total,
        "material_cost": material_total,
        "labour_cost": labour_total,
        "other_cost": other_total,
        "phases_count": len(phases),
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

    # Location hint from site survey for contextual recommendations
    location_hint = getattr(payload.site_survey, "location", None)

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
        "breakdown": breakdown,
        "permits": permits,
        "recommendations": recs,
    }

    # Persist to disk with lightweight index
    try:
        save_estimation_blob(user_id=user_id, estimate_id=estimate_id, data=response)
        append_index_entry(
            user_id=user_id,
            estimate_id=estimate_id,
            project_name=payload.project_name or location_hint,
            location=location_hint,
            total_cost=summary["total_cost"],
        )
    except Exception as exc:
        logger.exception("Failed to persist estimation", extra={"user_id": user_id})

    try:
        logger.info(
            "Generated estimation",
            extra={"total_cost": summary["total_cost"], "phases": summary["phases_count"]},
        )
    except Exception:
        # avoid logging failures breaking response
        pass

    return response
