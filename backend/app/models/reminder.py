from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class ReminderType(str, Enum):
    DEADLINE = "deadline"
    DAILY_SUMMARY = "daily_summary"
    CUSTOM = "custom"


class ReminderCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    message: str = Field(default="", max_length=1000)
    remind_at: datetime
    type: ReminderType = ReminderType.CUSTOM
    linked_task_id: Optional[str] = None


class ReminderUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    message: Optional[str] = Field(None, max_length=1000)
    remind_at: Optional[datetime] = None
    type: Optional[ReminderType] = None
    is_triggered: Optional[bool] = None
    linked_task_id: Optional[str] = None


class ReminderResponse(BaseModel):
    id: str
    title: str
    message: str
    remind_at: datetime
    type: str
    is_triggered: bool
    linked_task_id: Optional[str]
    created_at: datetime
