"""
Orquestrador para processamento de currículos
"""

import sys
import os
from typing import Optional
from datetime import datetime

from models.result import ProcessingResult
from services.file_service import FileService
from services.resume_processor import ResumeProcessor
from services.backend_service import BackendService
from utils.logger import logger

# Adiciona o diretório pai ao path para importar os módulos
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))



class ResumeOrchestrator:
    """Orquestrador para processamento de currículos"""

    def __init__(self):
        self.file_service = FileService()
        self.resume_processor = ResumeProcessor()
        self.backend_service = BackendService()

    async def process_resume_from_url(self, url: str, application_id: str) -> ProcessingResult:
        """
        Processa um currículo a partir de uma URL usando o BackendService

        Args:
            url: URL do PDF para download
            application_id: ID da aplicação
            provider: Provider de IA (opcional)
            api_key: Chave da API (opcional)

        Returns:
            ProcessingResult com o resultado do processamento
        """
        start_time = datetime.now()

        try:
            logger.log_processing_start(application_id, "url_backend_parse")
            logger.info(f"🌐 Processando currículo via backend - URL: {url}, Application ID: {application_id}")

            # Monta a URL completa usando o FileService
            full_url = self.file_service.build_full_url(url)
            logger.info(f"🔗 URL completa construída: {full_url}")

            # Usa o BackendService para processar o currículo via URL
            backend_result = await self.backend_service.parse_resume_from_url(
                url=full_url,
                application_id=application_id
            )

            processing_time = (datetime.now() - start_time).total_seconds()

            if backend_result.success:
                logger.info(f"✅ Currículo processado com sucesso via backend - Application ID: {application_id}")

                # Extrai os dados do currículo da resposta do backend
                resume_data = None
                if backend_result.response and 'data' in backend_result.response:
                    resume_data = backend_result.response['data']
                    logger.info(
                        f"📊 Dados extraídos - Resumo: {len(resume_data.get('summary', '') or '')} caracteres, "
                        f"Experiências: {len(resume_data.get('professionalExperiences', []))}, "
                        f"Formações: {len(resume_data.get('academicFormations', []))}, "
                        f"Conquistas: {len(resume_data.get('achievements', []))}, "
                        f"Idiomas: {len(resume_data.get('languages', []))}"
                    )

                    # Mapeia dados para formato do backend
                    backend_resume_data = self._map_resume_to_backend_format(resume_data)

                    # Envia dados para o backend usando send_resume_data
                    logger.info("📤 Enviando dados do currículo para o backend...")
                    send_result = await self.backend_service.send_resume_data(
                        application_id,
                        backend_resume_data
                    )

                    if send_result.success:
                        logger.info("✅ Dados do currículo enviados com sucesso para o backend")
                    else:
                        logger.warning(f"⚠️ Falha ao enviar dados para o backend: {send_result.error}")

                    return ProcessingResult(
                        success=True,
                        application_id=application_id,
                        message_id="url_backend_parse",
                        timestamp=datetime.now(),
                        resume_data=resume_data,
                        processing_time=processing_time,
                        backend_success=send_result.success,
                        backend_error=send_result.error if not send_result.success else None
                    )
                else:
                    logger.warning("⚠️ Resposta do backend não contém dados estruturados")
                    return ProcessingResult(
                        success=False,
                        application_id=application_id,
                        message_id="url_backend_parse",
                        timestamp=datetime.now(),
                        error="Resposta do backend não contém dados estruturados",
                        processing_time=processing_time,
                        backend_success=False
                    )
            else:
                logger.error(f"❌ Falha no processamento via backend - Application ID: {application_id}, Erro: {backend_result.error}")

                return ProcessingResult(
                    success=False,
                    application_id=application_id,
                    message_id="url_backend_parse",
                    timestamp=datetime.now(),
                    error=f"Falha no backend: {backend_result.error}",
                    processing_time=processing_time,
                    backend_success=False,
                    backend_error=backend_result.error
                )

        except Exception as e:
            processing_time = (datetime.now() - start_time).total_seconds()
            logger.log_processing_error(
                application_id,
                "url_backend_parse",
                str(e)
            )

            return ProcessingResult(
                success=False,
                application_id=application_id,
                message_id="url_backend_parse",
                timestamp=datetime.now(),
                error=str(e),
                processing_time=processing_time
            )

    def _map_resume_to_backend_format(self, resume_data: dict) -> dict:
        """
        Mapeia os dados do currículo para o formato esperado pelo backend

        Args:
            resume_data: Dados do currículo processado

        Returns:
            Dados mapeados para o formato do backend
        """
        mapped_data = {}

        # Campos básicos
        if 'summary' in resume_data:
            mapped_data['summary'] = resume_data['summary']

        # Mapear experiências profissionais
        if 'professionalExperiences' in resume_data and resume_data['professionalExperiences']:
            mapped_data['professionalExperiences'] = []
            for exp in resume_data['professionalExperiences']:
                mapped_exp = {
                    'companyName': exp.get('companyName', ''),
                    'position': exp.get('position', ''),
                    'startDate': exp.get('startDate', ''),
                    'endDate': exp.get('endDate'),
                    'isCurrent': exp.get('isCurrent', False),
                    'description': exp.get('description'),
                    'responsibilities': exp.get('responsibilities'),
                    'achievements': exp.get('achievements')
                }
                # Remove campos None
                mapped_exp = {k: v for k, v in mapped_exp.items() if v is not None}
                mapped_data['professionalExperiences'].append(mapped_exp)

        # Mapear formações acadêmicas
        if 'academicFormations' in resume_data and resume_data['academicFormations']:
            mapped_data['academicFormations'] = []
            for formation in resume_data['academicFormations']:
                mapped_formation = {
                    'institution': formation.get('institution', ''),
                    'course': formation.get('course', ''),
                    'degree': formation.get('degree', ''),
                    'startDate': formation.get('startDate', ''),
                    'endDate': formation.get('endDate'),
                    'isCurrent': formation.get('is_current', False),
                    'status': formation.get('status', 'completed'),
                    'description': formation.get('description')
                }
                # Remove campos None
                mapped_formation = {k: v for k, v in mapped_formation.items() if v is not None}
                mapped_data['academicFormations'].append(mapped_formation)

        # Mapear conquistas
        if 'achievements' in resume_data and resume_data['achievements']:
            mapped_data['achievements'] = []
            for achievement in resume_data['achievements']:
                mapped_achievement = {
                    'title': achievement.get('title', ''),
                    'description': achievement.get('description')
                }
                # Remove campos None
                mapped_achievement = {k: v for k, v in mapped_achievement.items() if v is not None}
                mapped_data['achievements'].append(mapped_achievement)

        # Mapear idiomas
        if 'languages' in resume_data and resume_data['languages']:
            mapped_data['languages'] = []
            for language in resume_data['languages']:
                mapped_language = {
                    'language': language.get('language', ''),
                    'proficiencyLevel': language.get('proficiency_level', '')
                }
                # Remove campos None
                mapped_language = {k: v for k, v in mapped_language.items() if v is not None}
                mapped_data['languages'].append(mapped_language)

        return mapped_data
