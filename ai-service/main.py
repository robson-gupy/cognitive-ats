from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import os
from dotenv import load_dotenv
from services.ai_service import AIService, AIProvider
from services.job_ai_service import JobAIService
from models import Job

# Carrega variáveis de ambiente do arquivo .env
load_dotenv()

app = FastAPI(title="AI Service API", description="API configurável para diferentes providers de IA")

# Configuração padrão do provider
DEFAULT_PROVIDER = os.getenv("DEFAULT_AI_PROVIDER", "openai")

# Modelos Pydantic para as requisições
class TextGenerationRequest(BaseModel):
    prompt: str
    provider: Optional[str] = None
    api_key: Optional[str] = None  # API key opcional
    model: Optional[str] = None
    max_tokens: Optional[int] = 1000
    temperature: Optional[float] = 0.7

class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]
    provider: Optional[str] = None
    api_key: Optional[str] = None  # API key opcional
    model: Optional[str] = None
    max_tokens: Optional[int] = 1000
    temperature: Optional[float] = 0.7

class EmbeddingRequest(BaseModel):
    text: str
    provider: Optional[str] = None
    api_key: Optional[str] = None  # API key opcional

class ProviderInfoResponse(BaseModel):
    provider: str
    provider_class: str
    has_embeddings: bool
    api_key_configured: bool
    available_providers: List[str]

class JobCreationRequest(BaseModel):
    prompt: str
    generate_questions: Optional[bool] = True
    generate_stages: Optional[bool] = True
    max_questions: Optional[int] = 5
    max_stages: Optional[int] = 3
    provider: Optional[str] = None
    api_key: Optional[str] = None
    model: Optional[str] = None
    max_tokens: Optional[int] = 2000
    temperature: Optional[float] = 0.7

class JobEnhancementRequest(BaseModel):
    enhancement_prompt: str
    provider: Optional[str] = None
    api_key: Optional[str] = None
    model: Optional[str] = None

class JobQuestionsRequest(BaseModel):
    job: Job
    num_questions: Optional[int] = 5
    provider: Optional[str] = None
    api_key: Optional[str] = None
    model: Optional[str] = None

class JobStagesRequest(BaseModel):
    job: Job
    num_stages: Optional[int] = 3
    provider: Optional[str] = None
    api_key: Optional[str] = None
    model: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "AI Service API - Serviço configurável para diferentes providers de IA"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "default_provider": DEFAULT_PROVIDER}

@app.get("/providers")
async def get_providers():
    """Retorna lista de providers disponíveis"""
    providers = [provider.value for provider in AIProvider]
    return {"available_providers": providers}

@app.post("/generate-text")
async def generate_text(request: TextGenerationRequest):
    """Gera texto usando o provider configurado"""
    try:
        provider_name = request.provider or DEFAULT_PROVIDER
        provider = AIProvider(provider_name)
        
        # Cria o serviço com API key opcional
        ai_service = AIService(
            provider=provider,
            api_key=request.api_key  # Pode ser None para ler do ambiente
        )
        
        response = await ai_service.generate_text(
            request.prompt,
            model=request.model,
            max_tokens=request.max_tokens,
            temperature=request.temperature
        )
        
        return {
            "text": response,
            "provider": provider_name,
            "prompt": request.prompt,
            "api_key_source": "parameter" if request.api_key else "environment"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat(request: ChatRequest):
    """Gera resposta de chat usando o provider configurado"""
    try:
        provider_name = request.provider or DEFAULT_PROVIDER
        provider = AIProvider(provider_name)
        
        # Cria o serviço com API key opcional
        ai_service = AIService(
            provider=provider,
            api_key=request.api_key  # Pode ser None para ler do ambiente
        )
        
        response = await ai_service.generate_chat(
            request.messages,
            model=request.model,
            max_tokens=request.max_tokens,
            temperature=request.temperature
        )
        
        return {
            "response": response,
            "provider": provider_name,
            "messages_count": len(request.messages),
            "api_key_source": "parameter" if request.api_key else "environment"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/embedding")
async def generate_embedding(request: EmbeddingRequest):
    """Gera embedding usando o provider configurado"""
    try:
        provider_name = request.provider or DEFAULT_PROVIDER
        provider = AIProvider(provider_name)
        
        # Cria o serviço com API key opcional
        ai_service = AIService(
            provider=provider,
            api_key=request.api_key  # Pode ser None para ler do ambiente
        )
        
        embedding = await ai_service.generate_embedding(request.text)
        
        return {
            "embedding": embedding,
            "provider": provider_name,
            "text": request.text,
            "embedding_size": len(embedding),
            "api_key_source": "parameter" if request.api_key else "environment"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/provider-info")
async def get_provider_info(provider: Optional[str] = None, api_key: Optional[str] = None):
    """Retorna informações sobre o provider atual ou especificado"""
    try:
        provider_name = provider or DEFAULT_PROVIDER
        provider_enum = AIProvider(provider_name)
        
        # Cria o serviço com API key opcional
        ai_service = AIService(
            provider=provider_enum,
            api_key=api_key  # Pode ser None para ler do ambiente
        )
        info = ai_service.get_provider_info()
        
        # Adiciona lista de providers disponíveis
        available_providers = [p.value for p in AIProvider]
        info["available_providers"] = available_providers
        info["api_key_source"] = "parameter" if api_key else "environment"
        
        return info
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/jobs/create-from-prompt")
async def create_job_from_prompt(request: JobCreationRequest):
    """Cria um Job usando IA baseado em um prompt"""
    try:
        provider_name = request.provider or DEFAULT_PROVIDER
        provider = AIProvider(provider_name)
        
        # Cria o serviço de IA
        ai_service = AIService(
            provider=provider,
            api_key=request.api_key
        )
        
        # Cria o serviço de Jobs com IA
        job_ai_service = JobAIService(ai_service)
        
        # Cria o job a partir do prompt
        job = await job_ai_service.create_job_from_prompt(
            request.prompt,
            generate_questions=request.generate_questions,
            max_questions=request.max_questions,
        )
        
        return job.model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/jobs/generate-questions")
async def generate_job_questions(request: JobQuestionsRequest):
    """Gera perguntas para um job usando IA"""
    try:
        provider_name = request.provider or DEFAULT_PROVIDER
        provider = AIProvider(provider_name)
        
        # Cria o serviço de IA
        ai_service = AIService(
            provider=provider,
            api_key=request.api_key
        )
        
        # Cria o serviço de Jobs com IA
        job_ai_service = JobAIService(ai_service)
        
        # Gera as perguntas
        questions = await job_ai_service.generate_job_questions(
            request.job,
            request.num_questions
        )
        
        return {
            "questions": questions,
            "provider": provider_name,
            "job_title": request.job.title,
            "num_questions": request.num_questions,
            "api_key_source": "parameter" if request.api_key else "environment"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
