from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from ..database import get_db
from ..models.reminder import ReminderCreate, ReminderUpdate, ReminderResponse
from ..utils.helpers import serialize_doc, to_object_id, now_utc

router = APIRouter()


@router.get("/", response_model=list[ReminderResponse])
async def list_reminders():
    """List all active (non-triggered) reminders."""
    db = get_db()
    cursor = db.reminders.find({"is_triggered": False}).sort("remind_at", 1)
    reminders = []
    async for doc in cursor:
        reminders.append(serialize_doc(doc))
    return reminders


@router.get("/upcoming", response_model=list[ReminderResponse])
async def upcoming_reminders():
    """Get reminders due in the next 24 hours."""
    db = get_db()
    now = now_utc()
    tomorrow = now + timedelta(hours=24)
    cursor = db.reminders.find({
        "is_triggered": False,
        "remind_at": {"$gte": now, "$lte": tomorrow},
    }).sort("remind_at", 1)
    reminders = []
    async for doc in cursor:
        reminders.append(serialize_doc(doc))
    return reminders


@router.get("/check", response_model=list[ReminderResponse])
async def check_due_reminders():
    """Check for reminders that are past due and not yet triggered."""
    db = get_db()
    now = now_utc()
    cursor = db.reminders.find({
        "is_triggered": False,
        "remind_at": {"$lte": now},
    }).sort("remind_at", 1)
    reminders = []
    async for doc in cursor:
        reminders.append(serialize_doc(doc))
    return reminders


@router.post("/", response_model=ReminderResponse, status_code=201)
async def create_reminder(reminder: ReminderCreate):
    """Create a new reminder."""
    db = get_db()
    doc = {
        **reminder.model_dump(),
        "is_triggered": False,
        "created_at": now_utc(),
    }
    result = await db.reminders.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_doc(doc)


@router.put("/{reminder_id}", response_model=ReminderResponse)
async def update_reminder(reminder_id: str, reminder: ReminderUpdate):
    """Update a reminder."""
    db = get_db()
    update_data = {k: v for k, v in reminder.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = await db.reminders.find_one_and_update(
        {"_id": to_object_id(reminder_id)},
        {"$set": update_data},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return serialize_doc(result)


@router.put("/{reminder_id}/trigger")
async def trigger_reminder(reminder_id: str):
    """Mark a reminder as triggered."""
    db = get_db()
    result = await db.reminders.find_one_and_update(
        {"_id": to_object_id(reminder_id)},
        {"$set": {"is_triggered": True}},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return {"message": "Reminder triggered", "id": reminder_id}


@router.delete("/{reminder_id}")
async def delete_reminder(reminder_id: str):
    """Delete a reminder."""
    db = get_db()
    result = await db.reminders.delete_one({"_id": to_object_id(reminder_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return {"message": "Reminder deleted successfully"}
