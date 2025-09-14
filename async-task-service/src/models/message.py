"""
Modelos para mensagens de fila Redis
"""

from dataclasses import dataclass
from typing import Optional, Dict, Any, List
from datetime import datetime


@dataclass
class ResumeMessage:
    """Mensagem de currículo para processamento"""
    resume_url: str
    application_id: str
    job_id: Optional[str] = None
    company_id: Optional[str] = None
    user_id: Optional[str] = None
    created_at: Optional[str] = None
    
    def __post_init__(self):
        """Validação pós-inicialização"""
        if not self.resume_url:
            raise ValueError("resume_url é obrigatório")
        if not self.application_id:
            raise ValueError("application_id é obrigatório")


@dataclass
class AIScoreMessage:
    """Mensagem para cálculo de score de candidato"""
    application_id: str
    resume_data: Dict[str, Any]
    job_data: Dict[str, Any]
    question_responses: Optional[List[Dict[str, str]]] = None
    created_at: Optional[str] = None


@dataclass
class QueueMessage:
    """Mensagem genérica de fila Redis Streams"""
    message_id: str
    ack_token: str
    body: str
    attributes: Dict[str, Any]
    message_attributes: Dict[str, Any]

    @property
    def receive_count(self) -> int:
        """Número de vezes que a mensagem foi entregue/recebida.
        - Redis Streams: usa deliveries (XPENDING) quando disponível
        """
        if 'ApproximateReceiveCount' in self.attributes:
            try:
                return int(self.attributes.get('ApproximateReceiveCount', 1))
            except Exception:
                return 1
        if 'deliveries' in self.attributes:
            try:
                return int(self.attributes.get('deliveries', 1))
            except Exception:
                return 1
        return 1

    @property
    def sent_timestamp(self) -> Optional[datetime]:
        """Timestamp de envio quando disponível."""
        timestamp = self.attributes.get('SentTimestamp')
        if timestamp:
            try:
                return datetime.fromtimestamp(int(timestamp) / 1000)
            except Exception:
                return None
        return None
