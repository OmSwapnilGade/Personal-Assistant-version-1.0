from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class LinkCategory(str, Enum):
    CP = "cp"
    DEV = "dev"
    COLLEGE = "college"
    OTHER = "other"


class LinkCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    url: str = Field(..., min_length=1)
    category: LinkCategory = LinkCategory.OTHER
    description: str = Field(default="", max_length=500)


class LinkUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    url: Optional[str] = Field(None, min_length=1)
    category: Optional[LinkCategory] = None
    description: Optional[str] = Field(None, max_length=500)


class LinkResponse(BaseModel):
    id: str
    title: str
    url: str
    category: str
    description: str
    created_at: datetime
