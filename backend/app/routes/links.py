from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ..database import get_db
from ..models.link import LinkCreate, LinkUpdate, LinkResponse
from ..utils.helpers import serialize_doc, to_object_id, now_utc

router = APIRouter()


@router.get("/", response_model=list[LinkResponse])
async def list_links(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    """List links with optional category filter and text search."""
    db = get_db()
    query = {}

    if category:
        query["category"] = category

    if search:
        query["$text"] = {"$search": search}

    cursor = db.links.find(query).sort("created_at", -1)
    links = []
    async for doc in cursor:
        links.append(serialize_doc(doc))
    return links


@router.post("/", response_model=LinkResponse, status_code=201)
async def add_link(link: LinkCreate):
    """Add a new link/bookmark."""
    db = get_db()
    doc = {
        **link.model_dump(),
        "created_at": now_utc(),
    }
    result = await db.links.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_doc(doc)


@router.put("/{link_id}", response_model=LinkResponse)
async def update_link(link_id: str, link: LinkUpdate):
    """Update a link."""
    db = get_db()
    update_data = {k: v for k, v in link.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = await db.links.find_one_and_update(
        {"_id": to_object_id(link_id)},
        {"$set": update_data},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Link not found")
    return serialize_doc(result)


@router.delete("/{link_id}")
async def delete_link(link_id: str):
    """Delete a link."""
    db = get_db()
    result = await db.links.delete_one({"_id": to_object_id(link_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Link not found")
    return {"message": "Link deleted successfully"}
