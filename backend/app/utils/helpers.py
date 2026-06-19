from bson import ObjectId
from datetime import datetime
import math


def serialize_doc(doc: dict) -> dict:
    """Convert MongoDB document to JSON-serializable dict."""
    if doc is None:
        return None
    result = {**doc}
    if "_id" in result:
        result["id"] = str(result.pop("_id"))
    return result


def to_object_id(id_str: str) -> ObjectId:
    """Convert string to MongoDB ObjectId with validation."""
    try:
        return ObjectId(id_str)
    except Exception:
        raise ValueError(f"Invalid ID format: {id_str}")


def calculate_attendance(attended: int, total: int) -> dict:
    """
    Calculate attendance percentage and status.
    Returns percentage, status, and classes needed to reach 75%.
    """
    if total == 0:
        return {
            "percentage": 0.0,
            "status": "safe",
            "classes_needed": 0,
        }

    percentage = round((attended / total) * 100, 1)

    if percentage >= 85:
        status = "safe"
    elif percentage >= 75:
        status = "warning"
    else:
        status = "danger"

    # Calculate classes needed to reach 75%
    # Formula: (attended + x) / (total + x) >= 0.75
    # attended + x >= 0.75 * total + 0.75 * x
    # 0.25 * x >= 0.75 * total - attended
    # x >= (0.75 * total - attended) / 0.25
    # x >= 3 * total - 4 * attended
    classes_needed = max(0, math.ceil(3 * total - 4 * attended))

    return {
        "percentage": percentage,
        "status": status,
        "classes_needed": classes_needed,
    }


def now_utc() -> datetime:
    """Get current UTC datetime."""
    return datetime.utcnow()
