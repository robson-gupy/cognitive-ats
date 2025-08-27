"""
Serviço para processamento de currículos
"""

import sys
import os
from typing import Dict, Any, Optional
from datetime import datetime

# Adiciona o diretório pai ao path para importar os módulos
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

try:
    from core.ai.service import AIService
    from shared.config import AIProvider
    from core.resume.parser import ResumeParser
except ImportError as e:
    print(f"❌ Erro ao importar módulos: {e}")
    raise

from consumer.utils.logger import logger
from consumer.models.result import ProcessingResult
from consumer.services.backend_service import BackendService


class ResumeProcessor:
    """Serviço para processamento de currículos"""
    
    def __init__(self):
        self.ai_service = None
        self.resume_parser = None
        self.backend_service = BackendService()
        self._initialize_ai_service()
    
    def _initialize_ai_service(self):
        """Inicializa o serviço de IA"""
        try:
            self.ai_service = AIService(provider=AIProvider.OPENAI)
            self.resume_parser = ResumeParser(self.ai_service)
            logger.info("✅ Serviço de IA inicializado")
        except Exception as e:
            logger.error("❌ Erro ao inicializar serviço de IA", error=str(e))
            raise
    
    async def process_resume(self, pdf_path: str, application_id: str) -> ProcessingResult:
        """
        Processa um currículo a partir do path do PDF
        
        Args:
            pdf_path: Caminho local do arquivo PDF
            application_id: ID da aplicação
            
        Returns:
            ProcessingResult com o resultado do processamento
        """
        start_time = datetime.now()
        
        try:
            logger.log_processing_start(application_id, "local_file")
            
            # Valida se o arquivo existe
            if not os.path.exists(pdf_path):
                return ProcessingResult(
                    success=False,
                    application_id=application_id,
                    message_id="local_file",
                    timestamp=datetime.now(),
                    error=f"Arquivo não encontrado: {pdf_path}"
                )
            
            # Valida se é um PDF válido
            if not self._validate_pdf_content(pdf_path):
                return ProcessingResult(
                    success=False,
                    application_id=application_id,
                    message_id="local_file",
                    timestamp=datetime.now(),
                    error="Arquivo não é um PDF válido"
                )
            
            try:
                # Processa o currículo com IA
                resume_data = await self.resume_parser.parse_resume_from_pdf(
                    pdf_path,
                    application_id
                )
                
                logger.info(
                    "✅ Currículo processado com sucesso",
                    application_id=application_id,
                    summary_length=len(resume_data.get('summary', '') or ''),
                    experiences_count=len(resume_data.get('professionalExperiences', [])),
                    formations_count=len(resume_data.get('academicFormations', [])),
                    achievements_count=len(resume_data.get('achievements', [])),
                    languages_count=len(resume_data.get('languages', []))
                )
                
                # Converte datas para formato ISO para serialização JSON
                from consumer.utils.date_utils import convert_dates_to_iso
                resume_data = convert_dates_to_iso(resume_data)
                
                # Mapeia dados para formato do backend
                backend_resume_data = self._map_resume_to_backend_format(resume_data)
                
                # Envia dados para o backend
                backend_result = await self.backend_service.send_resume_data(
                    application_id,
                    backend_resume_data
                )
                
                # Calcula tempo de processamento
                processing_time = (datetime.now() - start_time).total_seconds()
                
                return ProcessingResult(
                    success=True,
                    application_id=application_id,
                    message_id="local_file",
                    timestamp=datetime.now(),
                    resume_data=resume_data,
                    processing_time=processing_time,
                    backend_success=backend_result.success,
                    backend_error=backend_result.error if not backend_result.success else None
                )
                
            except Exception as e:
                logger.error(
                    "❌ Erro ao processar currículo",
                    application_id=application_id,
                    error=str(e)
                )
                raise
                
        except Exception as e:
            processing_time = (datetime.now() - start_time).total_seconds()
            logger.log_processing_error(
                application_id,
                "local_file",
                str(e)
            )
            
            return ProcessingResult(
                success=False,
                application_id=application_id,
                message_id="local_file",
                timestamp=datetime.now(),
                error=str(e),
                processing_time=processing_time
            )
    
    def _validate_pdf_content(self, file_path: str) -> bool:
        """
        Valida se o arquivo é um PDF válido
        
        Args:
            file_path: Caminho do arquivo
            
        Returns:
            True se é um PDF válido
        """
        try:
            with open(file_path, 'rb') as f:
                # Lê os primeiros 4 bytes para verificar o magic number do PDF
                header = f.read(4)
                return header == b'%PDF'
                
        except Exception as e:
            logger.error(f"❌ Erro ao validar PDF: {e}")
            return False
    
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
