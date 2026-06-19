from fastapi import APIRouter, HTTPException
from datetime import datetime
from ..database import get_db
from ..models.timetable import ClassCreate, ClassUpdate, ClassResponse
from ..utils.helpers import serialize_doc, to_object_id

router = APIRouter()

DAY_MAP = {
    0: "monday",
    1: "tuesday",
    2: "wednesday",
    3: "thursday",
    4: "friday",
    5: "saturday",
    6: "sunday",
}


@router.get("/", response_model=list[ClassResponse])
async def get_full_timetable():
    """Get the full weekly timetable."""
    db = get_db()
    day_order = {
        "monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3,
        "friday": 4, "saturday": 5, "sunday": 6,
    }
    cursor = db.timetable.find().sort("start_time", 1)
    classes = []
    async for doc in cursor:
        classes.append(serialize_doc(doc))
    # Sort by day then time
    classes.sort(key=lambda c: (day_order.get(c.get("day", ""), 7), c.get("start_time", "")))
    return classes


@router.get("/today", response_model=list[ClassResponse])
async def get_today_classes():
    """Get today's classes."""
    db = get_db()
    today = DAY_MAP[datetime.now().weekday()]
    cursor = db.timetable.find({"day": today}).sort("start_time", 1)
    classes = []
    async for doc in cursor:
        classes.append(serialize_doc(doc))
    return classes


@router.get("/{day}", response_model=list[ClassResponse])
async def get_day_classes(day: str):
    """Get classes for a specific day."""
    db = get_db()
    day_lower = day.lower()
    valid_days = list(DAY_MAP.values())
    if day_lower not in valid_days:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid day. Use one of: {', '.join(valid_days)}",
        )
    cursor = db.timetable.find({"day": day_lower}).sort("start_time", 1)
    classes = []
    async for doc in cursor:
        classes.append(serialize_doc(doc))
    return classes


@router.post("/", response_model=ClassResponse, status_code=201)
async def add_class(class_data: ClassCreate):
    """Add a new class to the timetable."""
    db = get_db()
    doc = class_data.model_dump()
    result = await db.timetable.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_doc(doc)


@router.put("/{class_id}", response_model=ClassResponse)
async def update_class(class_id: str, class_data: ClassUpdate):
    """Update a class."""
    db = get_db()
    update_data = {k: v for k, v in class_data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = await db.timetable.find_one_and_update(
        {"_id": to_object_id(class_id)},
        {"$set": update_data},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Class not found")
    return serialize_doc(result)


@router.delete("/{class_id}")
async def delete_class(class_id: str):
    """Remove a class from the timetable."""
    db = get_db()
    result = await db.timetable.delete_one({"_id": to_object_id(class_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Class not found")
    return {"message": "Class removed successfully"}
