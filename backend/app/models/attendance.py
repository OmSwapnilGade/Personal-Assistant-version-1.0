# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class SubjectCreate(BaseModel):
    subject: str = Field(..., min_length=1, max_length=100)
    attended: int = Field(default=0, ge=0)
    total: int = Field(default=0, ge=0)


class SubjectUpdate(BaseModel):
    subject: Optional[str] = Field(None, min_length=1, max_length=100)
    attended: Optional[int] = Field(None, ge=0)
    total: Optional[int] = Field(None, ge=0)


class AttendanceMarkRequest(BaseModel):
    attended: bool = True  # True = present, False = absent


class SubjectResponse(BaseModel):
    id: str
    subject: str
    attended: int
    total: int
    percentage: float
    status: str  # "safe", "warning", "danger"
    classes_needed: int  # classes needed to reach 75%
    updated_at: datetime
