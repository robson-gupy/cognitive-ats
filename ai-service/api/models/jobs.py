"""
Modelos Pydantic para requisições de jobs
"""
from datetime import date, datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class JobQuestion(BaseModel):
    """Modelo para perguntas de job"""
    question: str
    order_index: int = Field(alias="orderIndex")
    is_required: bool = Field(default=True, alias="isRequired")

    class Config:
        from_attributes = True
        populate_by_name = True


class Job(BaseModel):
    """Modelo completo de job"""
    title: str = Field(..., max_length=255)
    description: str
    requirements: str
    questions: List[JobQuestion] = []

    class Config:
        from_attributes = True
        populate_by_name = True


class JobCreationRequest(BaseModel):
    """Modelo para requisição de criação de job"""
    prompt: str
    generate_questions: Optional[bool] = True
    generate_stages: Optional[bool] = True
    max_questions: Optional[int] = 5
    max_stages: Optional[int] = 3
    provider: Optional[str] = None
    api_key: Optional[str] = None
    max_tokens: Optional[int] = 2000
    temperature: Optional[float] = 0.7


class JobEnhancementRequest(BaseModel):
    """Modelo para requisição de melhoria de job"""
    enhancement_prompt: str
    provider: Optional[str] = None
    api_key: Optional[str] = None


class JobQuestionsRequest(BaseModel):
    """Modelo para requisição de geração de perguntas"""
    job: Dict[str, Any]  # Job como dict para evitar dependência circular
    num_questions: Optional[int] = 5
    provider: Optional[str] = None
    api_key: Optional[str] = None


class JobStagesRequest(BaseModel):
    """Modelo para requisição de geração de estágios"""
    job: Dict[str, Any]  # Job como dict para evitar dependência circular
    num_stages: Optional[int] = 3
    provider: Optional[str] = None
    api_key: Optional[str] = None


class JobResponse(BaseModel):
    """Modelo para resposta de job"""
    job: Dict[str, Any]
    questions: Optional[List[Dict[str, Any]]] = None
    stages: Optional[List[Dict[str, Any]]] = None
    provider: str
