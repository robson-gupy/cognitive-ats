"""
Modelos para mensagens SQS
"""

from dataclasses import dataclass
from typing import Optional
from datetime import datetime


@dataclass
class ResumeMessage:
    """Mensagem de processamento de currículo"""
    resume_url: str
    application_id: str
    timestamp: Optional[datetime] = None
    priority: Optional[str] = None
    
    def __post_init__(self):
        """Validação pós-inicialização"""
        if not self.resume_url:
            raise ValueError("resume_url é obrigatório")
        if not self.application_id:
            raise ValueError("application_id é obrigatório")


@dataclass
class SQSMessage:
    """Mensagem SQS com metadados"""
    message_id: str
    receipt_handle: str
    body: str
    attributes: dict
    message_attributes: dict
    
    @property
    def receive_count(self) -> int:
        """Número de vezes que a mensagem foi recebida"""
        return int(self.attributes.get('ApproximateReceiveCount', 1))
    
    @property
    def sent_timestamp(self) -> Optional[datetime]:
        """Timestamp de envio da mensagem"""
        timestamp = self.attributes.get('SentTimestamp')
        if timestamp:
            return datetime.fromtimestamp(int(timestamp) / 1000)
        return None
