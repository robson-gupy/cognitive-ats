"""
Modelos Pydantic para currículos
"""
from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class ResumeProfessionalExperience(BaseModel):
    """Modelo para experiência profissional"""
    id: Optional[str] = None
    company_name: str = Field(..., max_length=255, alias="companyName")
    position: str = Field(..., max_length=255)
    start_date: date = Field(..., alias="startDate")
    end_date: Optional[date] = Field(None, alias="endDate")
    is_current: bool = Field(default=False, alias="isCurrent")
    description: Optional[str] = None
    responsibilities: Optional[str] = None
    achievements: Optional[str] = None
    created_at: Optional[datetime] = Field(None, alias="createdAt")
    updated_at: Optional[datetime] = Field(None, alias="updatedAt")

    class Config:
        from_attributes = True
        populate_by_name = True


class ResumeAcademicFormation(BaseModel):
    """Modelo para formação acadêmica"""
    id: Optional[str] = None
    institution: str = Field(..., max_length=255)
    course: str = Field(..., max_length=255)
    degree: str = Field(..., max_length=100)
    start_date: date = Field(..., alias="startDate")
    end_date: Optional[date] = Field(None, alias="endDate")
    is_current: bool = Field(default=False, alias="isCurrent")
    status: str = Field(default="completed", max_length=50)
    description: Optional[str] = None
    created_at: Optional[datetime] = Field(None, alias="createdAt")
    updated_at: Optional[datetime] = Field(None, alias="updatedAt")

    class Config:
        from_attributes = True
        populate_by_name = True


class ResumeAchievement(BaseModel):
    """Modelo para conquistas"""
    id: Optional[str] = None
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    created_at: Optional[datetime] = Field(None, alias="createdAt")
    updated_at: Optional[datetime] = Field(None, alias="updatedAt")

    class Config:
        from_attributes = True
        populate_by_name = True


class ResumeLanguage(BaseModel):
    """Modelo para idiomas"""
    id: Optional[str] = None
    language: str = Field(..., max_length=100)
    proficiency_level: str = Field(..., max_length=50, alias="proficiencyLevel")
    created_at: Optional[datetime] = Field(None, alias="createdAt")
    updated_at: Optional[datetime] = Field(None, alias="updatedAt")

    class Config:
        from_attributes = True
        populate_by_name = True


class Resume(BaseModel):
    """Modelo completo de currículo"""
    id: Optional[str] = None
    application_id: str = Field(..., alias="applicationId")
    summary: Optional[str] = None
    professional_experiences: List[ResumeProfessionalExperience] = Field(
        default=[], alias="professionalExperiences"
    )
    academic_formations: List[ResumeAcademicFormation] = Field(
        default=[], alias="academicFormations"
    )
    achievements: List[ResumeAchievement] = Field(default=[])
    languages: List[ResumeLanguage] = Field(default=[])
    created_at: Optional[datetime] = Field(None, alias="createdAt")
    updated_at: Optional[datetime] = Field(None, alias="updatedAt")

    class Config:
        from_attributes = True
        populate_by_name = True
