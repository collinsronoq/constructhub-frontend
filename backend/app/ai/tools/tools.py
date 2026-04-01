# app/ai/tools.py
from typing import Any, Optional

from sqlalchemy import String, cast, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.estimation.storage import load_estimation_blob
from app.models.estimate import Estimation
from app.models.vendor import VendorProfile
from app.models.vendor_item import VendorItem
from app.models.technician import TechnicianProfile


def _coerce_user_id(user_id: int | str) -> int:
    """
    Normalize user_id into an int for file-path based lookups.
    """
    try:
        return int(user_id)
    except Exception:
        raise ValueError("Invalid user id for estimate lookup")


def _extract_top_costs(
    items: list[dict[str, Any]],
    name_keys: str | list[str],
    total_keys: list[str],
    limit: int = 2,
) -> list[dict[str, Any]]:
    resolved_name_keys = [name_keys] if isinstance(name_keys, str) else name_keys
    totals: list[tuple[str, float]] = []
    for item in items or []:
        name = None
        for key in resolved_name_keys:
            candidate = item.get(key)
            if candidate:
                name = str(candidate)
                break
        total_val = 0.0
        for key in total_keys:
            val = item.get(key)
            if val is not None:
                try:
                    total_val = float(val)
                    break
                except Exception:
                    continue
        if name and total_val:
            totals.append((name, total_val))

    totals.sort(key=lambda t: t[1], reverse=True)
    return [{"name": name, "total": round(total, 2)} for name, total in totals[:limit]]


def _build_phase_insights(breakdown: list[dict[str, Any]], total_cost: float | None) -> list[dict[str, Any]]:
    if not breakdown or not total_cost or total_cost <= 0:
        return []

    insights: list[dict[str, Any]] = []
    for phase in breakdown:
        phase_name = phase.get("phase_name") or phase.get("phase") or "phase"
        totals = phase.get("totals") or {}
        phase_total = float(totals.get("phase_total") or 0)
        share = phase_total / total_cost if total_cost else 0

        materials = phase.get("materials") or []
        labour = phase.get("labour") or []

        top_materials = _extract_top_costs(
            materials,
            ["name", "description", "item_code"],
            ["total", "subtotal", "amount"],
        )
        top_labour = _extract_top_costs(
            labour,
            ["role", "title", "description"],
            ["total", "subtotal", "amount"],
        )

        note: str | None = None
        if share >= 0.25 and top_materials:
            note = f"{phase_name.title()} dominates cost; check {top_materials[0]['name']} pricing."
        elif top_labour:
            note = f"Labour heavy: {top_labour[0]['name']} at ~KES {top_labour[0]['total']}"

        insights.append(
            {
                "phase": phase_name,
                "share_of_total": round(share, 4),
                "top_materials": top_materials,
                "top_labour": top_labour,
                "note": note,
            }
        )

    return insights


async def get_estimate_summary(project_id: str, *, db: AsyncSession, user_id: int | str) -> dict[str, Any]:
    """
    Load a user's estimate JSON (stored on disk) and return summary + breakdown + insights.
    """
    owner_id = _coerce_user_id(user_id)

    est_record = None
    try:
        q = await db.execute(
            select(Estimation).where(Estimation.estimate_id == project_id, Estimation.user_id == owner_id)
        )
        est_record = q.scalars().first()
    except Exception:
        # If the DB lookup fails, we still attempt file-based loading below.
        est_record = None

    estimate_id = est_record.estimate_id if est_record else project_id
    blob = load_estimation_blob(owner_id, estimate_id)
    if not blob:
        return {"error": "Estimation not found", "estimate_id": estimate_id}

    summary = blob.get("summary") or {}
    breakdown = blob.get("breakdown") or []
    total_cost = float(summary.get("total_cost") or 0)

    return {
        "estimate_id": estimate_id,
        "summary": summary,
        "project_details": blob.get("project_details") or {},
        "breakdown": breakdown,
        "phase_insights": _build_phase_insights(breakdown, total_cost),
        "permits": blob.get("permits") or [],
        "recommendations": blob.get("recommendations") or {},
        "source": {
            "storage": f"data/estimations/{owner_id}/{estimate_id}.json",
            "db_blob_path": getattr(est_record, "blob_path", None) if est_record else None,
        },
    }


async def search_material_listings(
    material: str,
    location: Optional[str],
    max_price: Optional[float],
    *,
    limit: int = 5,
    db: AsyncSession,
) -> dict[str, Any]:
    """
    Query vendor listings for a material (joins vendor profile for location/verification).
    """
    stmt = (
        select(VendorItem, VendorProfile)
        .join(VendorProfile, VendorProfile.id == VendorItem.vendor_id)
        .where(
            or_(
                VendorItem.name.ilike(f"%{material}%"),
                VendorItem.description.ilike(f"%{material}%"),
            ),
            VendorItem.available.is_(True),
        )
    )

    if location:
        stmt = stmt.where(VendorProfile.location.ilike(f"%{location}%"))

    if max_price is not None:
        stmt = stmt.where(VendorItem.price <= max_price)

    stmt = stmt.order_by(VendorItem.price.asc(), VendorProfile.average_rating.desc()).limit(limit)
    result = await db.execute(stmt)
    rows = result.all()

    listings = []
    for item, vendor in rows:
        listings.append(
            {
                "id": item.id,
                "name": item.name,
                "category": item.category,
                "price": item.price,
                "unit": item.unit,
                "description": item.description,
                "imageUrl": item.image_url,
                "vendor": {
                    "id": vendor.id,
                    "name": vendor.name,
                    "location": vendor.location,
                    "verified": vendor.verified,
                    "rating": vendor.average_rating or 0.0,
                },
            }
        )

    return {
        "query": {"material": material, "location": location, "max_price": max_price, "limit": limit},
        "results": listings,
    }


async def search_technicians(
    profession: str,
    location: Optional[str],
    *,
    verified_only: bool = True,
    limit: int = 5,
    db: AsyncSession,
) -> dict[str, Any]:
    """
    Search technician directory by specialization/skills.
    """
    stmt = select(TechnicianProfile).where(
        or_(
            TechnicianProfile.specialization.ilike(f"%{profession}%"),
            cast(TechnicianProfile.skills, String).ilike(f"%{profession}%"),
        )
    )

    if location:
        stmt = stmt.where(TechnicianProfile.location.ilike(f"%{location}%"))

    if verified_only:
        stmt = stmt.where(TechnicianProfile.verified.is_(True))

    stmt = stmt.order_by(TechnicianProfile.average_rating.desc()).limit(limit)
    result = await db.execute(stmt)
    technicians = result.scalars().all()

    output = []
    for t in technicians:
        contact = t.contact or {}
        output.append(
            {
                "id": t.id,
                "name": t.name,
                "specialization": t.specialization,
                "skills": t.skills,
                "location": t.location,
                "verified": t.verified,
                "rating": t.average_rating or 0.0,
                "profile_image_url": t.profile_image_url,
                "contact": {
                    "phone": contact.get("phone"),
                    "email": contact.get("email"),
                },
            }
        )

    return {
        "query": {"profession": profession, "location": location, "verified_only": verified_only, "limit": limit},
        "results": output,
    }


async def rough_cost_estimate(
    *,
    bedrooms: Optional[int] = None,
    bathrooms: Optional[int] = None,
    floor_area_sqm: Optional[float] = None,
    quality: str = "standard",
    location: Optional[str] = None,
    db: AsyncSession | None = None,  # db unused; kept for signature compatibility
) -> dict[str, Any]:
    """
    Return a rough cost band for residential builds when no detailed estimate exists.
    """
    # Heuristic per-sqm rates (KES)
    quality_rate = {
        "basic": 32000,
        "standard": 38000,
        "premium": 48000,
    }
    base_rate = quality_rate.get(quality.lower(), quality_rate["standard"])

    loc_factor = 1.0
    if location:
        loc = location.lower()
        if "nairobi" in loc or "kiambu" in loc:
            loc_factor = 1.08
        elif "mombasa" in loc:
            loc_factor = 1.04

    if floor_area_sqm and floor_area_sqm > 0:
        area = float(floor_area_sqm)
        area_source = "provided_floor_area"
    else:
        # Rough area guess from bedrooms/bathrooms
        if bedrooms is None and bathrooms is None:
            return {
                "error": "Provide floor_area_sqm or at least bedrooms/bathrooms for a rough cost.",
                "expected_fields": ["floor_area_sqm"] + ["bedrooms", "bathrooms"],
            }
        est_area = 30.0  # base for living/kitchen/circulation
        if bedrooms:
            est_area += bedrooms * 18.0
        if bathrooms:
            est_area += bathrooms * 5.0
        area = max(est_area, 60.0)
        area_source = "estimated_from_rooms"

    rate = base_rate * loc_factor
    mid = area * rate
    low = mid * 0.9
    high = mid * 1.15

    assumptions = [
        f"Quality level: {quality.lower()}",
        f"Location factor: {loc_factor:.2f} (1.0 = baseline)",
        f"Area source: {area_source}",
        "Excludes land, approvals, and major site irregularities.",
    ]
    if area_source == "estimated_from_rooms":
        assumptions.append("Room-area heuristic used; provide floor_area_sqm for a tighter estimate.")

    return {
        "inputs": {
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "floor_area_sqm": floor_area_sqm,
            "quality": quality,
            "location": location,
        },
        "area_sqm_used": round(area, 2),
        "rate_per_sqm_kes": round(rate, 2),
        "total_kes": {
            "low": round(low),
            "mid": round(mid),
            "high": round(high),
        },
        "assumptions": assumptions,
    }
