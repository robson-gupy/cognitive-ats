"""
Serviço para download e gerenciamento de arquivos
"""

import os
import tempfile
import requests
from typing import Optional
from datetime import datetime

from consumer.config.settings import settings
from consumer.utils.logger import logger
from consumer.models.result import DownloadResult


class FileService:
    """Serviço para operações com arquivos"""
    
    def __init__(self):
        self.download_timeout = settings.processing.download_timeout
        self.temp_file_suffix = settings.processing.temp_file_suffix
    
    def download_pdf(self, url: str) -> DownloadResult:
        """
        Faz download de um PDF de uma URL
        
        Args:
            url: URL do PDF para download
            
        Returns:
            DownloadResult com o resultado da operação
        """
        start_time = datetime.now()
        
        try:
            logger.log_download_start(url)
            
            # Faz a requisição HTTP
            response = requests.get(url, timeout=self.download_timeout)
            response.raise_for_status()
            
            # Verifica se o conteúdo é um PDF
            content_type = response.headers.get('content-type', '').lower()
            if 'pdf' not in content_type and not url.lower().endswith('.pdf'):
                logger.warning(
                    "⚠️ Content-Type não é PDF",
                    content_type=content_type,
                    url=url
                )
            
            # Cria arquivo temporário
            temp_file = tempfile.NamedTemporaryFile(
                delete=False, 
                suffix=self.temp_file_suffix
            )
            temp_file.write(response.content)
            temp_file.close()
            
            # Calcula tempo de download
            download_time = (datetime.now() - start_time).total_seconds()
            
            # Obtém tamanho do arquivo
            file_size = len(response.content)
            
            logger.log_download_success(temp_file.name, file_size)
            
            return DownloadResult(
                success=True,
                file_path=temp_file.name,
                file_size=file_size,
                content_type=content_type,
                download_time=download_time
            )
            
        except requests.exceptions.RequestException as e:
            download_time = (datetime.now() - start_time).total_seconds()
            logger.log_download_error(url, str(e))
            
            return DownloadResult(
                success=False,
                error=f"Erro de requisição: {str(e)}",
                download_time=download_time
            )
            
        except Exception as e:
            download_time = (datetime.now() - start_time).total_seconds()
            logger.log_download_error(url, str(e))
            
            return DownloadResult(
                success=False,
                error=f"Erro inesperado: {str(e)}",
                download_time=download_time
            )
    
    def cleanup_temp_file(self, file_path: str) -> bool:
        """
        Remove arquivo temporário
        
        Args:
            file_path: Caminho do arquivo para remover
            
        Returns:
            True se removido com sucesso
        """
        try:
            if os.path.exists(file_path):
                os.unlink(file_path)
                logger.info(f"🗑️ Arquivo temporário removido: {file_path}")
                return True
            else:
                logger.warning(f"⚠️ Arquivo não encontrado para remoção: {file_path}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Erro ao remover arquivo temporário: {e}")
            return False
    
    def build_full_url(self, resume_url: str) -> str:
        """
        Constrói a URL completa para download
        
        Args:
            resume_url: URL ou path do currículo
            
        Returns:
            URL completa para download
        """
        # Se já é uma URL completa, usa como está
        if resume_url.startswith('http'):
            return resume_url
        
        # Se é apenas um path, constrói a URL completa
        # Remove a barra inicial se existir para evitar duplicação
        path = resume_url.lstrip('/')
        full_url = f"{settings.sqs.endpoint_url}/{path}"
        
        logger.info(
            "🔗 URL construída",
            original_path=resume_url,
            full_url=full_url
        )
        
        return full_url
    
    def validate_pdf_content(self, file_path: str) -> bool:
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
