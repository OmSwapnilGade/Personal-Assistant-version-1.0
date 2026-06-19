from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ..database import get_db
from ..models.task import TaskCreate, TaskUpdate, TaskResponse
from ..utils.helpers import serialize_doc, to_object_id, now_utc

router = APIRouter()


@router.get("/", response_model=list[TaskResponse])
async def list_tasks(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
):
    """List tasks with optional filters."""
    db = get_db()
    query = {}
    if status:
        query["status"] = status
    if priority:
        query["priority"] = priority
    if tag:
        query["tags"] = tag

    cursor = db.tasks.find(query).sort([("priority_order", -1), ("created_at", -1)])
    tasks = []
    async for doc in cursor:
        tasks.append(serialize_doc(doc))
    return tasks


@router.get("/summary")
async def task_summary():
    """Get task counts by status and priority."""
    db = get_db()
    pipeline = [
        {
            "$group": {
                "_id": None,
                "total": {"$sum": 1},
                "pending": {
                    "$sum": {"$cond": [{"$eq": ["$status", "pending"]}, 1, 0]}
                },
                "in_progress": {
                    "$sum": {
                        "$cond": [{"$eq": ["$status", "in_progress"]}, 1, 0]
                    }
                },
                "completed": {
                    "$sum": {
                        "$cond": [{"$eq": ["$status", "completed"]}, 1, 0]
                    }
                },
                "high_priority": {
                    "$sum": {
                        "$cond": [{"$eq": ["$priority", "high"]}, 1, 0]
                    }
                },
            }
        }
    ]
    result = await db.tasks.aggregate(pipeline).to_list(1)
    if result:
        summary = result[0]
        summary.pop("_id", None)
        return summary
    return {
        "total": 0,
        "pending": 0,
        "in_progress": 0,
        "completed": 0,
        "high_priority": 0,
    }


@router.post("/", response_model=TaskResponse, status_code=201)
async def create_task(task: TaskCreate):
    """Create a new task."""
    db = get_db()
    now = now_utc()

    # Map priority to numeric order for sorting
    priority_map = {"high": 3, "medium": 2, "low": 1}

    doc = {
        **task.model_dump(),
        "priority_order": priority_map.get(task.priority.value, 2),
        "created_at": now,
        "updated_at": now,
    }
    result = await db.tasks.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_doc(doc)


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str):
    """Get a specific task by ID."""
    db = get_db()
    doc = await db.tasks.find_one({"_id": to_object_id(task_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Task not found")
    return serialize_doc(doc)


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, task: TaskUpdate):
    """Update a task."""
    db = get_db()
    update_data = {k: v for k, v in task.model_dump().items() if v is not None}

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Update priority_order if priority changed
    if "priority" in update_data:
        priority_map = {"high": 3, "medium": 2, "low": 1}
        update_data["priority_order"] = priority_map.get(update_data["priority"], 2)

    update_data["updated_at"] = now_utc()

    result = await db.tasks.find_one_and_update(
        {"_id": to_object_id(task_id)},
        {"$set": update_data},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Task not found")
    return serialize_doc(result)


@router.delete("/{task_id}")
async def delete_task(task_id: str):
    """Delete a task."""
    db = get_db()
    result = await db.tasks.delete_one({"_id": to_object_id(task_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}
