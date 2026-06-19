from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ..database import get_db
from ..models.chat import ChatMessageCreate, ChatMessageResponse
from ..services.gemini_service import gemini_service
from ..utils.helpers import serialize_doc, to_object_id, now_utc

router = APIRouter()

# Maximum number of recent messages to send as context to Gemini
MAX_CONTEXT_MESSAGES = 10  # 5 pairs of user+assistant


@router.post("/message", response_model=dict)
async def send_message(message: ChatMessageCreate):
    """Send a message to the AI assistant and get a response."""
    db = get_db()
    now = now_utc()

    # Store user message
    user_doc = {
        "role": "user",
        "content": message.content,
        "category": message.category.value,
        "is_important": False,
        "created_at": now,
    }
    await db.chat_history.insert_one(user_doc)

    # Get recent history for context (only last N messages)
    recent_cursor = (
        db.chat_history.find()
        .sort("created_at", -1)
        .limit(MAX_CONTEXT_MESSAGES)
    )
    recent_messages = []
    async for doc in recent_cursor:
        recent_messages.append({
            "role": "model" if doc["role"] == "assistant" else doc["role"],
            "content": doc["content"],
        })
    # Reverse to chronological order (was reverse-chrono from sort)
    recent_messages.reverse()

    # Get AI response
    ai_response = await gemini_service.chat(
        message=message.content,
        recent_history=recent_messages[:-1],  # Exclude current message (already sent)
    )

    # Store assistant response
    assistant_doc = {
        "role": "assistant",
        "content": ai_response,
        "category": message.category.value,
        "is_important": False,
        "created_at": now_utc(),
    }
    result = await db.chat_history.insert_one(assistant_doc)
    assistant_doc["_id"] = result.inserted_id

    return {
        "user_message": serialize_doc(user_doc),
        "assistant_message": serialize_doc(assistant_doc),
    }


@router.get("/history", response_model=list[ChatMessageResponse])
async def get_chat_history(
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
):
    """Get recent chat history, newest first."""
    db = get_db()
    cursor = (
        db.chat_history.find()
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )
    messages = []
    async for doc in cursor:
        messages.append(serialize_doc(doc))
    messages.reverse()  # Return in chronological order
    return messages


@router.put("/{message_id}/important")
async def toggle_important(message_id: str):
    """Toggle the important flag on a chat message."""
    db = get_db()
    doc = await db.chat_history.find_one({"_id": to_object_id(message_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Message not found")

    new_value = not doc.get("is_important", False)
    await db.chat_history.update_one(
        {"_id": to_object_id(message_id)},
        {"$set": {"is_important": new_value}},
    )
    return {"is_important": new_value}


@router.delete("/clear")
async def clear_history():
    """Clear all non-important chat history."""
    db = get_db()
    result = await db.chat_history.delete_many({"is_important": {"$ne": True}})
    return {"deleted_count": result.deleted_count}
