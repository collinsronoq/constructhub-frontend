from typing import Optional

PROMPTS = [
    {
        "id": "builder-summary",
        "role": "builder",
        "title": "Summarize my estimate",
        "description": "Brief summary + top phase cost drivers for this estimate.",
        "template": "Summarize this estimate, highlight the top 2 cost-driving phases and any quick savings tips.",
    },
    {
        "id": "builder-rough-cost",
        "role": "builder",
        "title": "Rough cost for 3BR",
        "description": "Get a quick cost band when you don't have an estimate yet.",
        "template": "Give me a rough cost band for a 3-bedroom home in Kenya. Mention key assumptions.",
    },
    {
        "id": "builder-permits",
        "role": "builder",
        "title": "Permit checklist",
        "description": "Which approvals are needed before starting construction?",
        "template": "List key permits/approvals a builder needs before starting construction in Kenya. Keep it concise.",
    },
    {
        "id": "vendor-material-search",
        "role": "vendor",
        "title": "Find material demand",
        "description": "What materials are people commonly asking about?",
        "template": "What construction materials are most in demand right now? Provide 3–5 items with brief notes.",
    },
    {
        "id": "technician-find-work",
        "role": "technician",
        "title": "Find technician leads",
        "description": "Where are technicians needed most?",
        "template": "Where is there high demand for electricians or plumbers in Kenya? Provide practical tips.",
    },
    {
        "id": "general-permits",
        "role": "general",
        "title": "Permit basics",
        "description": "Quick overview of permits for small builds.",
        "template": "Explain the basic permits needed for a small residential build in Kenya in bullet points.",
    },
]


def list_prompts(role: Optional[str] = None) -> list[dict]:
    if not role:
        return PROMPTS
    return [p for p in PROMPTS if p.get("role") in (role, "general")]


def get_prompt(prompt_id: str) -> Optional[dict]:
    for p in PROMPTS:
        if p.get("id") == prompt_id:
            return p
    return None
