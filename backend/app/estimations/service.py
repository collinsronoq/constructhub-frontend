import json
from pathlib import Path

BASE_MATERIALS_PATH = Path("data/materials/base_materials.json")

def load_base_materials():
    with open(BASE_MATERIALS_PATH, "r") as f:
        return json.load(f)["materials"]


def estimate_materials(floor_area: float, quality: str):
    materials = load_base_materials()
    results = []

    for mat in materials:
        for phase, rate in mat["usage_per_m2"].items():
            qty = floor_area * rate * mat["quality_multiplier"][quality]
            cost = qty * mat["base_price"]

            results.append({
                "phase": phase,
                "id": mat["id"],
                "name": mat["name"],
                "qty": round(qty, 2),
                "unit": mat["unit"],
                "unitCost": mat["base_price"],
                "subtotal": round(cost, 2)
            })

    return results
