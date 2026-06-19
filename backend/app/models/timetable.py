from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class DayOfWeek(str, Enum):
    MONDAY = "monday"
    TUESDAY = "tuesday"
    WEDNESDAY = "wednesday"
    THURSDAY = "thursday"
    FRIDAY = "friday"
    SATURDAY = "saturday"
    SUNDAY = "sunday"


class ClassType(str, Enum):
    LECTURE = "lecture"
    LAB = "lab"
    TUTORIAL = "tutorial"


class ClassCreate(BaseModel):
    day: DayOfWeek
    subject: str = Field(..., min_length=1, max_length=100)
    start_time: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    end_time: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    room: str = Field(default="", max_length=50)
    type: ClassType = ClassType.LECTURE


class ClassUpdate(BaseModel):
    day: Optional[DayOfWeek] = None
    subject: Optional[str] = Field(None, min_length=1, max_length=100)
    start_time: Optional[str] = Field(None, pattern=r"^\d{2}:\d{2}$")
    end_time: Optional[str] = Field(None, pattern=r"^\d{2}:\d{2}$")
    room: Optional[str] = Field(None, max_length=50)
    type: Optional[ClassType] = None


class ClassResponse(BaseModel):
    id: str
    day: str
    subject: str
    start_time: str
    end_time: str
    room: str
    type: str
