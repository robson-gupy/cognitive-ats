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
        self.ai_service_url = settings.ai_service.url
        self.ai_service_timeout = settings.ai_service.timeout

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
        Consome o endpoint /resumes/parse-from-url do AI service para processar um currículo a partir de uma URL

        Args:
            url: URL do PDF do currículo
            application_id: ID da aplicação

        Returns:
            BackendResult com o resultado da operação
        """
        try:
            # URL do endpoint de parsing de currículo por URL no AI service
            endpoint_url = f"{self.ai_service_url.rstrip('/')}/resumes/parse-from-url"

            logger.info(
                f"📤 Enviando requisição para parsing de currículo por URL - URL: {endpoint_url}, "
                f"Application ID: {application_id}, Resume URL: {url}"
            )

            # Prepara os dados da requisição no formato esperado pelo AI service
            request_data = {
                'url': url,
                'application_id': application_id
            }

            # Faz a requisição POST com timeout configurado para AI service
            response = requests.post(
                endpoint_url,
                json=request_data,
                headers={
                    'Content-Type': 'application/json',
                },
                timeout=self.ai_service_timeout
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

    async def evaluate_candidate(
        self, 
        application_id: str, 
        resume_data: Dict[str, Any], 
        job_data: Dict[str, Any], 
        question_responses: Optional[list] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Avalia um candidato usando IA

        Args:
            application_id: ID da aplicação
            resume_data: Dados do currículo
            job_data: Dados da vaga
            question_responses: Respostas das perguntas (opcional)

        Returns:
            Dados da avaliação ou None se falhou
        """
        try:
            # URL do endpoint de avaliação de candidato no ai-service
            endpoint_url = f"{self.ai_service_url.rstrip('/')}/candidates/evaluate"

            logger.info(
                f"📤 Enviando requisição para avaliação de candidato - URL: {endpoint_url}, "
                f"Application ID: {application_id}"
            )

            # Prepara os dados da requisição no formato esperado pelo ai-service
            request_data = {
                'resume': resume_data,
                'job': job_data
            }

            # Adiciona respostas das perguntas se existirem
            if question_responses:
                request_data['question_responses'] = question_responses

            # Faz a requisição POST com timeout configurado para processamento de IA
            response = requests.post(
                endpoint_url,
                json=request_data,
                headers={
                    'Content-Type': 'application/json',
                },
                timeout=self.ai_service_timeout
            )

            # Log do resultado
            logger.log_backend_communication(endpoint_url, response.status_code)

            if response.status_code in [200, 201]:
                response_data = response.json() if response.content else None
                return response_data
            else:
                logger.error(
                    f"❌ Falha na avaliação de candidato - Status: {response.status_code}, "
                    f"Response: {response.text}"
                )
                return None

        except requests.exceptions.RequestException as e:
            logger.error(
                f"❌ Erro de conexão na avaliação de candidato - URL: {endpoint_url}, Erro: {str(e)}"
            )
            return None

        except Exception as e:
            logger.error(
                f"❌ Erro inesperado na avaliação de candidato - URL: {endpoint_url}, Erro: {str(e)}"
            )
            return None

    async def update_application_scores(
        self,
        application_id: str,
        overall_score: Optional[float],
        education_score: Optional[float],
        experience_score: Optional[float]
    ) -> Dict[str, Any]:
        """
        Atualiza os scores de uma aplicação usando o endpoint de avaliação

        Args:
            application_id: ID da aplicação
            overall_score: Score geral
            education_score: Score de educação
            experience_score: Score de experiência

        Returns:
            Dict com o resultado da operação
        """
        try:
            # URL do endpoint de atualização de avaliação no companies-backend
            endpoint_url = f"{self.companies_backend_url}/applications/{application_id}/evaluation"

            logger.info(
                f"📤 Enviando requisição para atualização de scores - URL: {endpoint_url}, "
                f"Application ID: {application_id}"
            )

            # Prepara os dados da requisição no formato esperado pelo companies-backend
            request_data = {}
            if overall_score is not None:
                request_data['aiScore'] = overall_score
            if education_score is not None:
                request_data['educationScore'] = education_score
            if experience_score is not None:
                request_data['experienceScore'] = experience_score

            # Faz a requisição PATCH
            response = requests.patch(
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
                return {
                    'success': True,
                    'status_code': response.status_code,
                    'response': response.json() if response.content else None
                }
            else:
                return {
                    'success': False,
                    'status_code': response.status_code,
                    'error': response.text
                }

        except requests.exceptions.RequestException as e:
            logger.error(
                f"❌ Erro de conexão na atualização de scores - URL: {endpoint_url}, Erro: {str(e)}"
            )
            return {
                'success': False,
                'error': f"Erro de conexão: {str(e)}"
            }

        except Exception as e:
            logger.error(
                f"❌ Erro inesperado na atualização de scores - URL: {endpoint_url}, Erro: {str(e)}"
            )
            return {
                'success': False,
                'error': f"Erro inesperado: {str(e)}"
            }

    def get_backend_info(self) -> Dict[str, Any]:
        """Retorna informações sobre o backend"""
        return {
            'base_url': self.base_url,
            'timeout': self.timeout,
            'available': self.is_backend_available(),
            'ai_service_url': self.ai_service_url,
            'ai_service_timeout': self.ai_service_timeout,
            'companies_backend_url': self.companies_backend_url,
            'companies_backend_timeout': self.companies_backend_timeout
        }

