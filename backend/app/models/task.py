from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Status(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="", max_length=2000)
    priority: Priority = Priority.MEDIUM
    status: Status = Status.PENDING
    deadline: Optional[datetime] = None
    tags: list[str] = Field(default_factory=list)


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    priority: Optional[Priority] = None
    status: Optional[Status] = None
    deadline: Optional[datetime] = None
    tags: Optional[list[str]] = None


class TaskResponse(BaseModel):
    id: str
    title: str
    description: str
    priority: str
    status: str
    deadline: Optional[datetime]
    tags: list[str]
    created_at: datetime
    updated_at: datetime
