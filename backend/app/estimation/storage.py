import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

from app.core.logging import setup_logger

logger = setup_logger("estimation.storage")

BASE_DIR = Path("data/estimations")


def _user_dir(user_id: int) -> Path:
    return BASE_DIR / str(user_id)


def _index_path(user_id: int) -> Path:
    return _user_dir(user_id) / "index.json"


def _ensure_user_dir(user_id: int) -> None:
    path = _user_dir(user_id)
    path.mkdir(parents=True, exist_ok=True)


def load_index(user_id: int) -> List[Dict[str, Any]]:
    """
    Load a user's estimation index (lightweight summaries).
    """
    path = _index_path(user_id)
    if not path.exists():
        return []
    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as exc:
        logger.exception("Failed to load estimation index", extra={"user_id": user_id})
        return []


def save_index(user_id: int, index: List[Dict[str, Any]]) -> None:
    """
    Persist the user's estimation index.
    """
    _ensure_user_dir(user_id)
    path = _index_path(user_id)
    with path.open("w", encoding="utf-8") as f:
        json.dump(index, f, indent=2)


def save_estimation_blob(user_id: int, estimate_id: str, data: Dict[str, Any]) -> Path:
    """
    Save full estimation payload to disk and return the path.
    """
    _ensure_user_dir(user_id)
    path = _user_dir(user_id) / f"{estimate_id}.json"
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    return path


def append_index_entry(
    user_id: int,
    estimate_id: str,
    project_name: str | None,
    location: str | None,
    total_cost: float,
) -> None:
    """
    Add or update an index entry for a saved estimation.
    """
    index = load_index(user_id)
    now = datetime.now(timezone.utc).isoformat()
    entry = {
        "id": estimate_id,
        "project_name": project_name or "Project",
        "location": location,
        "total_cost": total_cost,
        "created_at": now,
    }

    index = [i for i in index if i.get("id") != estimate_id]
    index.append(entry)
    save_index(user_id, index)


def load_estimation_blob(user_id: int, estimate_id: str) -> Dict[str, Any] | None:
    """
    Load a specific estimation JSON for a user.
    """
    path = _user_dir(user_id) / f"{estimate_id}.json"
    if not path.exists():
        return None
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)
