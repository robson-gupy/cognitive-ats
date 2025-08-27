"""
Serviço para comunicação com o backend
"""

import requests
from typing import Dict, Any, Optional
from datetime import datetime

from consumer.config.settings import settings
from consumer.utils.logger import logger
from consumer.models.result import BackendResult


class BackendService:
    """Serviço para comunicação com o backend"""
    
    def __init__(self):
        self.base_url = settings.backend.url
        self.timeout = settings.backend.timeout
    
    async def send_resume_data(self, application_id: str, resume_data: dict) -> BackendResult:
        """
        Envia dados do currículo processado para o backend
        
        Args:
            application_id: ID da aplicação
            resume_data: Dados do currículo processado
            
        Returns:
            BackendResult com o resultado da operação
        """
        try:
            # URL do endpoint de criação de resumo
            url = f"{self.base_url}/resumes/{application_id}"
            
            logger.info(
                f"📤 Enviando dados do currículo para o backend - URL: {url}, Application ID: {application_id}"
            )
            
            # Faz a requisição POST
            response = requests.post(
                url,
                json=resume_data,
                headers={
                    'Content-Type': 'application/json',
                },
                timeout=self.timeout
            )
            
            # Log do resultado
            logger.log_backend_communication(url, response.status_code)
            
            if response.status_code in [200, 201]:
                return BackendResult(
                    success=True,
                    status_code=response.status_code,
                    response=response.json() if response.content else None
                )
            else:
                return BackendResult(
                    success=False,
                    status_code=response.status_code,
                    error=response.text
                )
                
        except requests.exceptions.RequestException as e:
            logger.error(
                f"❌ Erro de conexão com o backend - URL: {url}, Erro: {str(e)}"
            )
            return BackendResult(
                success=False,
                error=f"Erro de conexão: {str(e)}"
            )
            
        except Exception as e:
            logger.error(
                f"❌ Erro inesperado na comunicação com backend - URL: {url}, Erro: {str(e)}"
            )
            return BackendResult(
                success=False,
                error=f"Erro inesperado: {str(e)}"
            )
    
    def is_backend_available(self) -> bool:
        """
        Verifica se o backend está disponível
        
        Returns:
            True se o backend responde
        """
        try:
            response = requests.get(
                self.base_url,
                timeout=5
            )
            return response.status_code in [200, 404, 405]  # Qualquer resposta indica que está online
            
        except Exception:
            return False
    
    def get_backend_info(self) -> Dict[str, Any]:
        """Retorna informações sobre o backend"""
        return {
            'base_url': self.base_url,
            'timeout': self.timeout,
            'available': self.is_backend_available()
        }
