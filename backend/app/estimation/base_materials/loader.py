# function that will be responsible for loading h=the base materials

import json
from pathlib import Path
from app.estimation.schemas.base_material import BaseMaterialsCatalog

BASE_DIR = Path(__file__).resolve().parent
MATERIALS_FILE = BASE_DIR / "base_materials.json"


def load_base_materials() -> dict:
    """
    Load base materials JSON as a plain dict.
    """
    with open(MATERIALS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)
