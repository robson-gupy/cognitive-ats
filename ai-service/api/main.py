"""
Aplicação FastAPI principal do AI Service
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from shared.config import Config, AIProvider
from api.routes import ai, jobs

# Carrega variáveis de ambiente
load_dotenv()

# Cria a aplicação FastAPI
app = FastAPI(
    title="AI Service API",
    description="API configurável para diferentes providers de IA",
    version="1.0.0"
)

# Configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especifique os domínios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclui as rotas
app.include_router(ai.router)
app.include_router(jobs.router)


@app.get("/")
async def root():
    """Endpoint raiz"""
    return {
        "message": "AI Service API - Serviço configurável para diferentes providers de IA",
        "version": "1.0.0",
        "default_provider": Config.DEFAULT_AI_PROVIDER
    }


@app.get("/health")
async def health_check():
    """Health check do serviço"""
    return {
        "status": "healthy",
        "default_provider": Config.DEFAULT_AI_PROVIDER,
        "available_providers": [provider.value for provider in AIProvider]
    }


@app.get("/info")
async def get_service_info():
    """Informações sobre o serviço"""
    return {
        "service": "AI Service",
        "version": "1.0.0",
        "default_provider": Config.DEFAULT_AI_PROVIDER,
        "available_providers": [provider.value for provider in AIProvider],
        "features": [
            "Text Generation",
            "Chat Completion",
            "Embeddings",
            "Job Creation",
            "Job Enhancement",
            "Resume Parsing"
        ]
    }
