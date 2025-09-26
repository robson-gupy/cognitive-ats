"""
Modelos Pydantic para requisições de IA
"""
from pydantic import BaseModel
from typing import List, Dict, Optional, Any


class TextGenerationRequest(BaseModel):
    """Modelo para requisição de geração de texto"""
    prompt: str


class ChatRequest(BaseModel):
    """Modelo para requisição de chat"""
    messages: List[Dict[str, str]]
    model: Optional[str] = None


class EmbeddingRequest(BaseModel):
    """Modelo para requisição de embedding"""
    text: str


class ProviderInfoResponse(BaseModel):
    """Modelo para resposta de informações do provider"""
    provider: str
    provider_class: str
    has_embeddings: bool
    api_key_configured: bool
    available_providers: List[str]


class AIResponse(BaseModel):
    """Modelo para resposta de IA"""
    text: str
    provider: str
    model: Optional[str] = None
    usage: Optional[Dict[str, Any]] = None


class EmbeddingResponse(BaseModel):
    """Modelo para resposta de embedding"""
    embedding: List[float]
    provider: str
    model: Optional[str] = None


# Modelos para avaliação de candidatos
class ResumeData(BaseModel):
    """Modelo para dados do currículo"""
    personal_info: Optional[Dict[str, Any]] = None
    education: Optional[List[Dict[str, Any]]] = None
    experience: Optional[List[Dict[str, Any]]] = None
    skills: Optional[List[str]] = None
    languages: Optional[List[Dict[str, Any]]] = None
    achievements: Optional[List[str]] = None


class JobData(BaseModel):
    """Modelo para dados da vaga"""
    title: str
    description: str
    requirements: Optional[List[str]] = None
    responsibilities: Optional[List[str]] = None
    education_required: Optional[str] = None
    experience_required: Optional[str] = None
    skills_required: Optional[List[str]] = None


class QuestionResponse(BaseModel):
    """Modelo para resposta de pergunta"""
    question: str
    answer: str


class CandidateEvaluationRequest(BaseModel):
    """Modelo para requisição de avaliação de candidato"""
    resume: ResumeData
    job: JobData
    question_responses: Optional[List[QuestionResponse]] = None


class CandidateEvaluationResponse(BaseModel):
    """Modelo para resposta de avaliação de candidato"""
    overall_score: int  # 0-100
    question_responses_score: int  # 0-100
    education_score: int  # 0-100
    experience_score: int  # 0-100
    provider: str  # Provider de IA usado para avaliação
    model: str  # Modelo de IA usado para avaliação


# Modelos para avaliação de question responses
class QuestionEvaluationRequest(BaseModel):
    """Modelo para requisição de avaliação de question responses"""
    question_responses: List[QuestionResponse]
    job_data: JobData


class QuestionEvaluationResponse(BaseModel):
    """Modelo para resposta de avaliação de question responses"""
    score: int  # 0-100
    details: Dict[str, Any] = {}
    feedback: str = ""
    improvement_areas: List[str] = []
    evaluated_at: str = ""
    provider: str = ""
    model: str = ""
