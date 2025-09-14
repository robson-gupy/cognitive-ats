"""
Rotas para funcionalidades relacionadas a processamento de currículos
"""
import logging
import tempfile
import requests
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from pydantic import BaseModel, HttpUrl
import os
import sys

# Adiciona o diretório pai ao path para importar os módulos
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from core.ai.service import AIService
from core.resume.parser import ResumeParser
from shared.config import AIProvider, Config
from shared.exceptions import ResumeParsingError

# Configurar logger
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/resumes", tags=["Resumes"])


class ResumeParseRequest(BaseModel):
    """Modelo para requisição de parsing de currículo"""
    url: HttpUrl
    application_id: str = "api_request"
    provider: str = None
    api_key: str = None


class ResumeParseResponse(BaseModel):
    """Modelo para resposta de parsing de currículo"""
    success: bool
    data: Dict[str, Any] = None
    error: str = None
    application_id: str


def download_pdf_from_url(url: str) -> str:
    """
    Faz download de um PDF de uma URL e retorna o caminho do arquivo temporário
    
    Args:
        url: URL do PDF para download
        
    Returns:
        str: Caminho do arquivo temporário
        
    Raises:
        HTTPException: Se houver erro no download
    """
    try:
        logger.info(f"📥 Iniciando download do PDF: {url}")
        
        # Faz a requisição HTTP
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        # Verifica se o conteúdo é um PDF
        content_type = response.headers.get('content-type', '').lower()
        if 'pdf' not in content_type and not str(url).lower().endswith('.pdf'):
            logger.warning(f"⚠️ Content-Type não é PDF - Content-Type: {content_type}")
        
        # Cria arquivo temporário
        temp_file = tempfile.NamedTemporaryFile(
            delete=False, 
            suffix='.pdf'
        )
        temp_file.write(response.content)
        temp_file.close()
        
        logger.info(f"✅ PDF baixado com sucesso: {temp_file.name}")
        return temp_file.name
        
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Erro no download: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Erro no download do PDF: {str(e)}")
    except Exception as e:
        logger.error(f"❌ Erro inesperado no download: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno no download: {str(e)}")


def validate_pdf_file(file_path: str) -> bool:
    """
    Valida se o arquivo é um PDF válido
    
    Args:
        file_path: Caminho do arquivo
        
    Returns:
        bool: True se for um PDF válido
    """
    try:
        if not os.path.exists(file_path):
            return False
            
        # Verifica se o arquivo não está vazio
        if os.path.getsize(file_path) == 0:
            return False
            
        # Tenta ler o cabeçalho do PDF
        with open(file_path, 'rb') as f:
            header = f.read(4)
            if header != b'%PDF':
                return False
                
        return True
        
    except Exception as e:
        logger.error(f"❌ Erro na validação do PDF: {str(e)}")
        return False


@router.post("/parse-from-url", response_model=ResumeParseResponse)
async def parse_resume_from_url(request: ResumeParseRequest):
    """
    Faz download de um PDF de uma URL e processa o currículo usando IA
    
    Args:
        request: Requisição com URL do PDF e application_id
        
    Returns:
        ResumeParseResponse: Dados do currículo processado
    """
    temp_file_path = None
    
    try:
        logger.info(f"🎯 Recebida requisição para parsing de currículo")
        logger.info(f"📄 URL: {request.url}")
        logger.info(f"🆔 Application ID: {request.application_id}")
        logger.info(f"🤖 Provider: {request.provider or 'padrão'}")
        
        # Faz download do PDF
        temp_file_path = download_pdf_from_url(str(request.url))
        
        # Valida se é um PDF válido
        if not validate_pdf_file(temp_file_path):
            raise HTTPException(status_code=400, detail="Arquivo não é um PDF válido")
        
        # Configura o provider de IA
        provider_name = request.provider or Config.DEFAULT_AI_PROVIDER
        provider = AIProvider(provider_name)
        
        logger.info(f"🔧 Usando provider: {provider_name}")
        
        # Inicializa o serviço de IA
        ai_service = AIService(provider, api_key=request.api_key)
        resume_parser = ResumeParser(ai_service)
        
        logger.info("🚀 Iniciando parsing com IA...")
        
        # Processa o currículo
        resume_data = await resume_parser.parse_resume_from_pdf(
            temp_file_path,
            request.application_id
        )
        
        logger.info("✅ Currículo processado com sucesso")
        logger.info(f"📊 Dados extraídos:")
        logger.info(f"   - Resumo: {len(resume_data.get('summary', '') or '')} caracteres")
        logger.info(f"   - Experiências: {len(resume_data.get('professionalExperiences', []))}")
        logger.info(f"   - Formações: {len(resume_data.get('academicFormations', []))}")
        logger.info(f"   - Conquistas: {len(resume_data.get('achievements', []))}")
        logger.info(f"   - Idiomas: {len(resume_data.get('languages', []))}")
        
        return ResumeParseResponse(
            success=True,
            data=resume_data,
            application_id=request.application_id
        )
        
    except ResumeParsingError as e:
        logger.error(f"❌ Erro no parsing do currículo: {str(e)}")
        raise HTTPException(status_code=422, detail=f"Erro no processamento do currículo: {str(e)}")
    except Exception as e:
        logger.error(f"❌ Erro inesperado: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {str(e)}")
    finally:
        # Remove arquivo temporário
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
                logger.info(f"🗑️ Arquivo temporário removido: {temp_file_path}")
            except Exception as e:
                logger.warning(f"⚠️ Erro ao remover arquivo temporário: {str(e)}")


@router.get("/health")
async def resume_service_health():
    """Health check do serviço de resumes"""
    return {
        "status": "healthy",
        "service": "Resume Parser",
        "available_providers": [provider.value for provider in AIProvider]
    }
