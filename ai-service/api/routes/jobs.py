"""
Rotas para funcionalidades de jobs
"""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
from shared.config import AIProvider, Config
from shared.exceptions import JobCreationError, AIProviderError
from core.ai.service import AIService
from core.jobs.creator import JobCreator
from core.jobs.enhancer import JobEnhancer
from api.models.jobs import (
    JobCreationRequest, JobEnhancementRequest, JobQuestionsRequest,
    JobStagesRequest, JobResponse
)

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.post("/create-from-prompt", response_model=JobResponse)
async def create_job_from_prompt(request: JobCreationRequest):
    """Cria um job a partir de um prompt usando IA"""
    try:
        print(f"Received request: {request}")
        provider_name = request.provider or Config.DEFAULT_AI_PROVIDER
        provider = AIProvider(provider_name)
        
        # Cria o serviço de IA
        ai_service = AIService(provider, api_key=request.api_key)
        
        # Cria o serviço de jobs
        job_creator = JobCreator(ai_service)
        
        # Cria o job
        result = await job_creator.create_job_from_prompt(
            request.prompt,
            generate_questions=request.generate_questions,
            generate_stages=request.generate_stages,
            max_questions=request.max_questions,
            max_stages=request.max_stages,
            max_tokens=request.max_tokens,
            temperature=request.temperature
        )
        
        return JobResponse(
            job=result["job"],
            questions=result.get("questions"),
            stages=result.get("stages"),
            provider=provider_name
        )
        
    except JobCreationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except AIProviderError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/enhance-description")
async def enhance_job_description(request: JobEnhancementRequest):
    """Melhora a descrição de um job usando IA"""
    try:
        provider_name = request.provider or Config.DEFAULT_AI_PROVIDER
        provider = AIProvider(provider_name)
        
        # Cria o serviço de IA
        ai_service = AIService(provider, api_key=request.api_key)
        
        # Cria o serviço de melhoria
        job_enhancer = JobEnhancer(ai_service)
        
        # Melhora a descrição
        enhanced_job = await job_enhancer.enhance_job_description(
            request.job, request.enhancement_prompt
        )
        
        return {
            "job": enhanced_job,
            "provider": provider_name
        }
        
    except JobCreationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except AIProviderError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/enhance-requirements")
async def enhance_job_requirements(request: JobEnhancementRequest):
    """Melhora os requisitos de um job usando IA"""
    try:
        provider_name = request.provider or Config.DEFAULT_AI_PROVIDER
        provider = AIProvider(provider_name)
        
        # Cria o serviço de IA
        ai_service = AIService(provider, api_key=request.api_key)
        
        # Cria o serviço de melhoria
        job_enhancer = JobEnhancer(ai_service)
        
        # Melhora os requisitos
        enhanced_job = await job_enhancer.enhance_job_requirements(
            request.job, request.enhancement_prompt
        )
        
        return {
            "job": enhanced_job,
            "provider": provider_name
        }
        
    except JobCreationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except AIProviderError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/enhance-title")
async def enhance_job_title(request: JobEnhancementRequest):
    """Melhora o título de um job usando IA"""
    try:
        provider_name = request.provider or Config.DEFAULT_AI_PROVIDER
        provider = AIProvider(provider_name)
        
        # Cria o serviço de IA
        ai_service = AIService(provider, api_key=request.api_key)
        
        # Cria o serviço de melhoria
        job_enhancer = JobEnhancer(ai_service)
        
        # Melhora o título
        enhanced_job = await job_enhancer.enhance_job_title(
            request.job, request.enhancement_prompt
        )
        
        return {
            "job": enhanced_job,
            "provider": provider_name
        }
        
    except JobCreationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except AIProviderError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-questions")
async def generate_job_questions(request: JobQuestionsRequest):
    """Gera perguntas para um job usando IA"""
    try:
        provider_name = request.provider or Config.DEFAULT_AI_PROVIDER
        provider = AIProvider(provider_name)
        
        # Cria o serviço de IA
        ai_service = AIService(provider, api_key=request.api_key)
        
        # Cria o serviço de jobs
        job_creator = JobCreator(ai_service)
        
        # Gera as perguntas
        questions = await job_creator.generate_job_questions(
            request.job, request.num_questions
        )
        
        return {
            "questions": questions,
            "provider": provider_name
        }
        
    except JobCreationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except AIProviderError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-stages")
async def generate_job_stages(request: JobStagesRequest):
    """Gera estágios para um job usando IA"""
    try:
        provider_name = request.provider or Config.DEFAULT_AI_PROVIDER
        provider = AIProvider(provider_name)
        
        # Cria o serviço de IA
        ai_service = AIService(provider, api_key=request.api_key)
        
        # Cria o serviço de jobs
        job_creator = JobCreator(ai_service)
        
        # Gera os estágios
        stages = await job_creator.generate_job_stages(
            request.job, request.num_stages
        )
        
        return {
            "stages": stages,
            "provider": provider_name
        }
        
    except JobCreationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except AIProviderError as e:
        raise HTTPException(status_code=500, detail=str(e))
