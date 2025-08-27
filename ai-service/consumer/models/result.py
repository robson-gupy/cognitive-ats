"""
Modelos para resultados de processamento
"""

from dataclasses import dataclass
from typing import Optional, Dict, Any
from datetime import datetime


@dataclass
class ProcessingResult:
    """Resultado do processamento de um currículo"""
    success: bool
    application_id: str
    message_id: str
    timestamp: datetime
    resume_data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    processing_time: Optional[float] = None
    backend_success: Optional[bool] = None
    backend_error: Optional[str] = None
    
    def __post_init__(self):
        """Validação pós-inicialização"""
        if self.timestamp is None:
            self.timestamp = datetime.now()


@dataclass
class BackendResult:
    """Resultado da comunicação com o backend"""
    success: bool
    status_code: Optional[int] = None
    response: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: Optional[datetime] = None
    
    def __post_init__(self):
        """Validação pós-inicialização"""
        if self.timestamp is None:
            self.timestamp = datetime.now()


@dataclass
class DownloadResult:
    """Resultado do download de arquivo"""
    success: bool
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    content_type: Optional[str] = None
    error: Optional[str] = None
    download_time: Optional[float] = None
