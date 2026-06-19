from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class ChatCategory(str, Enum):
    STUDY = "study"
    CODING = "coding"
    GENERAL = "general"
    DEBUG = "debug"


class ChatMessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)
    category: ChatCategory = ChatCategory.GENERAL


class ChatMessageResponse(BaseModel):
    id: str
    role: str  # "user" or "assistant"
    content: str
    category: str
    is_important: bool
    created_at: datetime
