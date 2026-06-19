from fastapi import APIRouter, HTTPException
from ..database import get_db
from ..models.attendance import (
    SubjectCreate,
    SubjectUpdate,
    AttendanceMarkRequest,
    SubjectResponse,
)
from ..utils.helpers import serialize_doc, to_object_id, calculate_attendance, now_utc

router = APIRouter()


def enrich_attendance(doc: dict) -> dict:
    """Add computed attendance fields to a document."""
    serialized = serialize_doc(doc)
    calc = calculate_attendance(doc.get("attended", 0), doc.get("total", 0))
    serialized.update(calc)
    return serialized


@router.get("/", response_model=list[SubjectResponse])
async def list_subjects():
    """List all subjects with attendance data."""
    db = get_db()
    cursor = db.attendance.find().sort("subject", 1)
    subjects = []
    async for doc in cursor:
        subjects.append(enrich_attendance(doc))
    return subjects


@router.get("/warnings")
async def get_warnings():
    """Get subjects below 75% attendance threshold."""
    db = get_db()
    cursor = db.attendance.find()
    warnings = []
    async for doc in cursor:
        enriched = enrich_attendance(doc)
        if enriched["status"] in ("warning", "danger"):
            warnings.append(enriched)
    # Sort by percentage ascending (worst first)
    warnings.sort(key=lambda x: x["percentage"])
    return warnings


@router.post("/", response_model=SubjectResponse, status_code=201)
async def add_subject(subject_data: SubjectCreate):
    """Add a new subject for attendance tracking."""
    db = get_db()

    # Check if subject already exists
    existing = await db.attendance.find_one({"subject": subject_data.subject})
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Subject '{subject_data.subject}' already exists",
        )

    doc = {
        **subject_data.model_dump(),
        "updated_at": now_utc(),
    }
    result = await db.attendance.insert_one(doc)
    doc["_id"] = result.inserted_id
    return enrich_attendance(doc)


@router.put("/{subject_id}/mark", response_model=SubjectResponse)
async def mark_attendance(subject_id: str, mark: AttendanceMarkRequest):
    """Mark a class as attended or missed. Increments total and optionally attended."""
    db = get_db()
    update = {
        "$inc": {"total": 1},
        "$set": {"updated_at": now_utc()},
    }
    if mark.attended:
        update["$inc"]["attended"] = 1

    result = await db.attendance.find_one_and_update(
        {"_id": to_object_id(subject_id)},
        update,
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Subject not found")
    return enrich_attendance(result)


@router.put("/{subject_id}", response_model=SubjectResponse)
async def update_subject(subject_id: str, subject_data: SubjectUpdate):
    """Manually update subject attendance counts."""
    db = get_db()
    update_data = {k: v for k, v in subject_data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    update_data["updated_at"] = now_utc()

    result = await db.attendance.find_one_and_update(
        {"_id": to_object_id(subject_id)},
        {"$set": update_data},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Subject not found")
    return enrich_attendance(result)


@router.delete("/{subject_id}")
async def delete_subject(subject_id: str):
    """Remove a subject from attendance tracking."""
    db = get_db()
    result = await db.attendance.delete_one({"_id": to_object_id(subject_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Subject not found")
    return {"message": "Subject removed successfully"}
