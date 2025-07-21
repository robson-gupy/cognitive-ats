from datetime import date, datetime
from enum import Enum
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field


class JobQuestion(BaseModel):
    question: str
    order_index: int = Field(alias="orderIndex")
    is_required: bool = Field(default=True, alias="isRequired")

    class Config:
        from_attributes = True
        populate_by_name = True


class Job(BaseModel):
    title: str = Field(..., max_length=255)
    description: str
    requirements: str
    questions: List[JobQuestion] = []

    class Config:
        from_attributes = True
        populate_by_name = True
