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

            # Log dos dados que estão sendo enviados para debug
            logger.info(f"📋 Resume data keys: {list(resume_data.keys()) if resume_data else 'None'}")
            logger.info(f"💼 Job data keys: {list(job_data.keys()) if job_data else 'None'}")
            logger.info(f"❓ Question responses: {len(question_responses) if question_responses else 0}")

            # Log detalhado dos dados para debug do erro 422
            logger.info(f"🔍 Resume data completo: {resume_data}")
            logger.info(f"🔍 Job data completo: {job_data}")
            if question_responses:
                logger.info(f"🔍 Question responses: {question_responses}")

            # Valida se os dados obrigatórios estão presentes
            if not resume_data:
                logger.error("❌ Resume data está vazio")
                return None

            if not job_data:
                logger.error("❌ Job data está vazio")
                return None

            # Valida campos obrigatórios do job_data
            if not job_data.get('id'):
                logger.error("❌ Job data não possui 'id' obrigatório")
                return None

            # Converte os dados para o formato esperado pelo AI service
            converted_resume_data = self._convert_resume_for_ai_service(resume_data)
            converted_job_data = self._convert_job_for_ai_service(job_data)

            # Prepara os dados da requisição no formato esperado pelo ai-service
            request_data = {
                'resume': converted_resume_data,
                'job': converted_job_data
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
                logger.info(f"✅ Avaliação de candidato bem-sucedida - Status: {response.status_code}")
                return response_data
            else:
                logger.error(
                    f"❌ Falha na avaliação de candidato - Status: {response.status_code}, "
                    f"Response: {response.text}"
                )
                # Log adicional para debug
                try:
                    error_detail = response.json() if response.content else None
                    logger.error(f"🔍 Detalhes do erro: {error_detail}")
                except Exception:
                    logger.error(f"🔍 Resposta não é JSON válido: {response.text}")
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
        overall_score: Optional[float] = None,
        education_score: Optional[float] = None,
        experience_score: Optional[float] = None,
        question_responses_score: Optional[float] = None,
        ai_score: Optional[float] = None,
        evaluation_provider: Optional[str] = None,
        evaluation_model: Optional[str] = None,
        evaluation_details: Optional[Dict[str, Any]] = None,
        evaluated_at: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Atualiza os scores de uma aplicação usando o endpoint interno de comunicação

        Args:
            application_id: ID da aplicação
            overall_score: Score geral da avaliação
            education_score: Score de educação
            experience_score: Score de experiência
            question_responses_score: Score das respostas às perguntas
            ai_score: Score geral de IA
            evaluation_provider: Provedor da avaliação (ex: "openai")
            evaluation_model: Modelo usado (ex: "gpt-4")
            evaluation_details: Detalhes completos da avaliação
            evaluated_at: Data/hora da avaliação (ISO string)

        Returns:
            Dict com o resultado da operação
        """
        try:
            # URL do endpoint interno de atualização de aplicação
            endpoint_url = f"{self.companies_backend_url}/internal/applications/{application_id}"

            logger.info(
                f"📤 Enviando requisição para atualização de scores via endpoint interno - URL: {endpoint_url}, "
                f"Application ID: {application_id}"
            )

            # Prepara os dados da requisição no formato esperado pelo endpoint interno
            request_data = {}
            if ai_score is not None:
                request_data['aiScore'] = ai_score
            if overall_score is not None:
                request_data['overallScore'] = overall_score
            if education_score is not None:
                request_data['educationScore'] = education_score
            if experience_score is not None:
                request_data['experienceScore'] = experience_score
            if question_responses_score is not None:
                request_data['questionResponsesScore'] = question_responses_score

            # Usa configurações padrão se não fornecidas explicitamente
            provider = evaluation_provider if evaluation_provider is not None else settings.evaluation.provider
            model = evaluation_model if evaluation_model is not None else settings.evaluation.model

            if provider is not None:
                request_data['evaluationProvider'] = provider
            if model is not None:
                request_data['evaluationModel'] = model
            if evaluation_details is not None:
                request_data['evaluationDetails'] = evaluation_details
            if evaluated_at is not None:
                request_data['evaluatedAt'] = evaluated_at

            # Log dos dados que estão sendo enviados
            logger.info(f"📊 Scores a serem atualizados: {request_data}")
            logger.info(f"🔧 Configurações de avaliação - Provider: {provider}, Model: {model}")

            # Faz a requisição PATCH
            response = requests.patch(
                endpoint_url,
                json=request_data,
                headers={
                    'Content-Type': 'application/json',
                },
                timeout=self.companies_backend_timeout
            )

            # Log do resultado
            logger.log_backend_communication(endpoint_url, response.status_code)

            if response.status_code in [200, 201]:
                logger.info(f"✅ Scores atualizados com sucesso para application {application_id}")
                return {
                    'success': True,
                    'status_code': response.status_code,
                    'response': response.json() if response.content else None
                }
            else:
                logger.error(
                    f"❌ Falha na atualização de scores - Status: {response.status_code}, "
                    f"Response: {response.text}"
                )
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

    def _convert_resume_for_ai_service(self, resume_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Converte dados do currículo para o formato esperado pelo AI service

        Args:
            resume_data: Dados do currículo no formato do score_queue_service

        Returns:
            Dados convertidos para o formato do AI service
        """
        converted = {
            "personal_info": resume_data.get("personal_info", {}),
            "education": resume_data.get("education", []),
            "experience": resume_data.get("experience", []),
            "skills": resume_data.get("skills", []),
            "languages": resume_data.get("languages", []),
            "achievements": resume_data.get("achievements", [])
        }

        return converted

    def _convert_job_for_ai_service(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Converte dados da vaga para o formato esperado pelo AI service

        Args:
            job_data: Dados da vaga

        Returns:
            Dados convertidos para o formato do AI service
        """
        converted = {
            "id": job_data.get("id", ""),
            "title": job_data.get("title", ""),
            "description": job_data.get("description", ""),
            "requirements": job_data.get("requirements", []),
            "responsibilities": job_data.get("responsibilities", []),
            "education_required": job_data.get("education_required", ""),
            "experience_required": job_data.get("experience_required", ""),
            "skills_required": job_data.get("skills_required", [])
        }

        return converted

