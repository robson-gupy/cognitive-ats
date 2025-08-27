"""
Orquestrador para processamento de currículos
"""

import sys
import os
from typing import Optional
from datetime import datetime

# Adiciona o diretório pai ao path para importar os módulos
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from consumer.utils.logger import logger
from consumer.models.result import ProcessingResult, DownloadResult
from consumer.services.file_service import FileService
from consumer.services.resume_processor import ResumeProcessor


class ResumeOrchestrator:
    """Orquestrador para processamento de currículos"""
    
    def __init__(self):
        self.file_service = FileService()
        self.resume_processor = ResumeProcessor()
    
    async def process_resume_from_message(self, resume_message, message_id: str) -> ProcessingResult:
        """
        Processa um currículo a partir de uma mensagem SQS
        
        Args:
            resume_message: Mensagem com dados do currículo (ResumeMessage ou dict)
            message_id: ID da mensagem SQS
            
        Returns:
            ProcessingResult com o resultado do processamento
        """
        start_time = datetime.now()
        
        try:
            # Extrai application_id e resume_url da mensagem
            if hasattr(resume_message, 'application_id'):
                # É um objeto ResumeMessage
                application_id = resume_message.application_id
                resume_url = resume_message.resume_url
            else:
                # É um dicionário
                application_id = resume_message.get('application_id')
                resume_url = resume_message.get('resume_url')
            
            if not application_id or not resume_url:
                return ProcessingResult(
                    success=False,
                    application_id=application_id or "unknown",
                    message_id=message_id,
                    timestamp=datetime.now(),
                    error="Mensagem inválida: application_id ou resume_url ausente"
                )
            
            logger.log_processing_start(application_id, message_id)
            
            # Constrói URL completa para download
            full_url = self.file_service.build_full_url(resume_url)
            
            # Faz download do PDF
            download_result = self.file_service.download_pdf(full_url)
            
            if not download_result.success:
                return ProcessingResult(
                    success=False,
                    application_id=application_id,
                    message_id=message_id,
                    timestamp=datetime.now(),
                    error=f"Falha no download: {download_result.error}"
                )
            
            # Valida se é um PDF válido
            if not self.file_service.validate_pdf_content(download_result.file_path):
                return ProcessingResult(
                    success=False,
                    application_id=application_id,
                    message_id=message_id,
                    timestamp=datetime.now(),
                    error="Arquivo não é um PDF válido"
                )
            
            try:
                # Processa o currículo usando o ResumeProcessor
                result = await self.resume_processor.process_resume(
                    download_result.file_path,
                    application_id
                )
                
                # Atualiza o message_id para manter consistência
                result.message_id = message_id
                
                return result
                
            finally:
                # Sempre remove o arquivo temporário
                self.file_service.cleanup_temp_file(download_result.file_path)
                
        except Exception as e:
            processing_time = (datetime.now() - start_time).total_seconds()
            logger.log_processing_error(
                application_id,
                message_id,
                str(e)
            )
            
            return ProcessingResult(
                success=False,
                application_id=application_id,
                message_id=message_id,
                timestamp=datetime.now(),
                error=str(e),
                processing_time=processing_time
            )
    
    async def process_resume_from_file(self, pdf_path: str, application_id: str) -> ProcessingResult:
        """
        Processa um currículo a partir de um arquivo local
        
        Args:
            pdf_path: Caminho local do arquivo PDF
            application_id: ID da aplicação
            
        Returns:
            ProcessingResult com o resultado do processamento
        """
        return await self.resume_processor.process_resume(pdf_path, application_id)
    
    async def process_resume_from_url(self, url: str, application_id: str) -> ProcessingResult:
        """
        Processa um currículo a partir de uma URL
        
        Args:
            url: URL do PDF para download
            application_id: ID da aplicação
            
        Returns:
            ProcessingResult com o resultado do processamento
        """
        start_time = datetime.now()
        
        try:
            logger.log_processing_start(application_id, "url_download")
            
            # Faz download do PDF
            download_result = self.file_service.download_pdf(url)
            
            if not download_result.success:
                return ProcessingResult(
                    success=False,
                    application_id=application_id,
                    message_id="url_download",
                    timestamp=datetime.now(),
                    error=f"Falha no download: {download_result.error}"
                )
            
            # Valida se é um PDF válido
            if not self.file_service.validate_pdf_content(download_result.file_path):
                return ProcessingResult(
                    success=False,
                    application_id=application_id,
                    message_id="url_download",
                    timestamp=datetime.now(),
                    error="Arquivo não é um PDF válido"
                )
            
            try:
                # Processa o currículo usando o ResumeProcessor
                result = await self.resume_processor.process_resume(
                    download_result.file_path,
                    application_id
                )
                
                return result
                
            finally:
                # Sempre remove o arquivo temporário
                self.file_service.cleanup_temp_file(download_result.file_path)
                
        except Exception as e:
            processing_time = (datetime.now() - start_time).total_seconds()
            logger.log_processing_error(
                application_id,
                "url_download",
                str(e)
            )
            
            return ProcessingResult(
                success=False,
                application_id=application_id,
                message_id="url_download",
                timestamp=datetime.now(),
                error=str(e),
                processing_time=processing_time
            )
