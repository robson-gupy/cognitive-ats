"""
Serviço para comunicação com o backend
"""

import requests
from typing import Dict, Any, Optional
from datetime import datetime

from config.settings import settings
from models.result import BackendResult
from utils.logger import logger


class BackendService:
    """Serviço para comunicação com o backend"""

    def __init__(self):
        self.base_url = settings.backend.url
        self.timeout = settings.backend.timeout
        self.companies_backend_url = settings.companies_backend.url
        self.companies_backend_timeout = settings.companies_backend.timeout

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
            # URL do endpoint de criação de resumo no companies-backend
            url = f"{self.companies_backend_url}/resumes/{application_id}"

            logger.info(
                f"📤 Enviando dados do currículo para o companies-backend - URL: {url}, Application ID: {application_id}"
            )

            # Faz a requisição POST
            response = requests.post(
                url,
                json=resume_data,
                headers={
                    'Content-Type': 'application/json',
                },
                timeout=self.companies_backend_timeout
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

    async def parse_resume_from_url(self, url: str, application_id: str) -> BackendResult:
        """
        Consome o endpoint /resumes/parse-from-url do backend para processar um currículo a partir de uma URL

        Args:
            url: URL do PDF do currículo
            application_id: ID da aplicação
            provider: Provider de IA (opcional)
            api_key: Chave da API (opcional)

        Returns:
            BackendResult com o resultado da operação
        """
        try:
            # URL do endpoint de parsing de currículo por URL
            endpoint_url = f"{self.base_url.rstrip('/')}/resumes/parse-from-url"

            logger.info(
                f"📤 Enviando requisição para parsing de currículo por URL - URL: {endpoint_url}, "
                f"Application ID: {application_id}, Resume URL: {url}"
            )

            # Prepara os dados da requisição
            request_data = {
                'url': url,
                'application_id': application_id
            }

            # Faz a requisição POST
            response = requests.post(
                endpoint_url,
                json=request_data,
                headers={
                    'Content-Type': 'application/json',
                },
                timeout=self.timeout
            )

            # Log do resultado
            logger.log_backend_communication(endpoint_url, response.status_code)

            if response.status_code in [200, 201]:
                response_data = response.json() if response.content else None
                return BackendResult(
                    success=True,
                    status_code=response.status_code,
                    response=response_data
                )
            else:
                return BackendResult(
                    success=False,
                    status_code=response.status_code,
                    error=response.text
                )

        except requests.exceptions.RequestException as e:
            logger.error(
                f"❌ Erro de conexão com o backend - URL: {endpoint_url}, Erro: {str(e)}"
            )
            return BackendResult(
                success=False,
                error=f"Erro de conexão: {str(e)}"
            )

        except Exception as e:
            logger.error(
                f"❌ Erro inesperado na comunicação com backend - URL: {endpoint_url}, Erro: {str(e)}"
            )
            return BackendResult(
                success=False,
                error=f"Erro inesperado: {str(e)}"
            )

    def get_backend_info(self) -> Dict[str, Any]:
        """Retorna informações sobre o backend"""
        return {
            'base_url': self.base_url,
            'timeout': self.timeout,
            'available': self.is_backend_available()
        }
