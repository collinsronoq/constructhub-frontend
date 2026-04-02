# app/estimations/phases/site_survey.py
from app.estimation.phases.site_survey.schemas import SiteSurveyInput
from app.estimation.common_schemas import (
    PhaseEstimate,
    CostItem,
    QuantityItem,
    PhaseMetadata,
    build_phase_totals,
)


def estimate_site_survey(data: SiteSurveyInput) -> PhaseEstimate:
    """
    Estimate site survey costs as preconstruction services (v2 pilot phase).
    """
    base_survey_rate = 5000.0
    premium_multiplier = 1.3 if data.survey_quality == "premium" else 1.0
    survey_days = 1 if data.plot_size_sqm <= 500 else 2
    site_visits = 1 if survey_days == 1 else 2
    service_reports = 1 + int(data.include_soil_test) + int(data.include_topographical_survey)

    inspection_rate_per_visit = 1500.0 * premium_multiplier
    boundary_rate_per_day = base_survey_rate * premium_multiplier
    logistics_fee = 2500.0 if data.plot_size_sqm <= 500 else 4000.0

    labour_items = [
        CostItem(
            item_code="site_visit_inspection",
            description="Site Visit / Inspection",
            unit="visit",
            quantity=float(site_visits),
            unit_rate=inspection_rate_per_visit,
            total=inspection_rate_per_visit * site_visits,
            category="labour",
            source="fixed_service",
            confidence="high",
        ),
        CostItem(
            item_code="boundary_survey_setting_out",
            description="Boundary Survey and Setting Out",
            unit="day",
            quantity=float(survey_days),
            unit_rate=boundary_rate_per_day,
            total=boundary_rate_per_day * survey_days,
            category="labour",
            source="fixed_service",
            confidence="high",
        ),
    ]

    other_costs = [
        CostItem(
            item_code="survey_transport_logistics",
            description="Transport and Logistics",
            unit="sum",
            quantity=1.0,
            unit_rate=logistics_fee,
            total=logistics_fee,
            category="other",
            source="assumed",
            confidence="medium",
        )
    ]

    if data.include_soil_test:
        other_costs.append(
            CostItem(
                item_code="soil_investigation",
                description="Soil Investigation / Test",
                unit="test",
                quantity=1.0,
                unit_rate=15000.0,
                total=15000.0,
                category="other",
                source="fixed_service",
                confidence="high",
            )
        )

    if data.include_topographical_survey:
        other_costs.append(
            CostItem(
                item_code="topographical_survey",
                description="Topographical Survey",
                unit="survey",
                quantity=1.0,
                unit_rate=10000.0,
                total=10000.0,
                category="other",
                source="fixed_service",
                confidence="high",
            )
        )

    quantities = [
        QuantityItem(
            name="survey_days",
            value=float(survey_days),
            unit="day",
            formula="1 if plot_size_sqm <= 500 else 2",
        ),
        QuantityItem(
            name="site_visits",
            value=float(site_visits),
            unit="visit",
            formula="1 if survey_days == 1 else 2",
        ),
        QuantityItem(
            name="soil_tests_count",
            value=float(1 if data.include_soil_test else 0),
            unit="test",
            formula=None,
        ),
        QuantityItem(
            name="topographical_surveys_count",
            value=float(1 if data.include_topographical_survey else 0),
            unit="survey",
            formula=None,
        ),
        QuantityItem(
            name="service_reports_count",
            value=float(service_reports),
            unit="report",
            formula="1 + soil_tests_count + topographical_surveys_count",
        ),
    ]

    assumptions = [
        "Survey duration is derived from site size band (<=500 sqm: 1 day, >500 sqm: 2 days).",
        "Premium survey quality applies a 30% uplift to labour service rates.",
        "Soil investigation and topographical survey are priced as fixed add-on services.",
        "Transport and logistics are estimated with a fixed size-band fee and not live-distance pricing.",
    ]

    notes = [
        "Site visit and boundary setting-out services are represented explicitly as labour items.",
        "Soil investigation included." if data.include_soil_test else "Soil investigation excluded.",
        "Topographical survey included." if data.include_topographical_survey else "Topographical survey excluded.",
    ]

    warnings = [
        "No location-distance pricing is applied for survey logistics.",
        "Rates are static service assumptions and are not vendor-sourced.",
    ]

    totals = build_phase_totals(
        materials=[],
        labour=labour_items,
        equipment=[],
        other_costs=other_costs,
    )

    return PhaseEstimate(
        phase="site_survey",
        phase_id="site_survey",
        phase_name="Site Survey",
        inputs_used={
            "plot_size_sqm": data.plot_size_sqm,
            "survey_quality": data.survey_quality,
            "include_soil_test": data.include_soil_test,
            "include_topographical_survey": data.include_topographical_survey,
        },
        quantities=quantities,
        materials=[],
        labour=labour_items,
        equipment=[],
        other_costs=other_costs,
        totals=totals,
        assumptions=assumptions,
        notes=notes,
        warnings=warnings,
        metadata=PhaseMetadata(
            version="v2",
            pricing_source="static",
            confidence="medium",
        ),
    )
