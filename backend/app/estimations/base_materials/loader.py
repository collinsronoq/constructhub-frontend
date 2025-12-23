# function that will be responsible for loading h=the base materials

import json
from pathlib import Path
from app.estimations.schemas.base_material import BaseMaterialsCatalog

BASE_DIR = Path(__file__).resolve().parent
MATERIALS_FILE = BASE_DIR / "base_materials.json"


def load_base_materials() -> BaseMaterialsCatalog:
    with open(MATERIALS_FILE, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    return BaseMaterialsCatalog(**raw_data)
