"""
Serviço para operações SQS
"""

import boto3
from typing import List, Optional, Dict, Any
from botocore.exceptions import ClientError, NoCredentialsError

from consumer.config.settings import settings
from consumer.utils.logger import logger
from consumer.models.message import SQSMessage


class SQSService:
    """Serviço para operações com SQS"""
    
    def __init__(self):
        self.client = None
        self.queue_url = None
        self._connect()
    
    def _connect(self):
        """Estabelece conexão com SQS"""
        try:
            # Obtém configurações
            sqs_config = settings.get_sqs_config()
            
            # Cria cliente SQS
            self.client = boto3.client('sqs', **sqs_config)
            
            # Obtém URL da fila
            self.queue_url = self._get_queue_url()
            
            if self.queue_url:
                logger.info(
                    "✅ Cliente SQS conectado com sucesso",
                    endpoint=settings.sqs.endpoint_url,
                    region=settings.sqs.region,
                    queue=settings.sqs.queue_name
                )
            else:
                logger.error("❌ Não foi possível obter URL da fila")
                
        except NoCredentialsError:
            logger.error("❌ Credenciais AWS não configuradas")
        except Exception as e:
            logger.error("❌ Erro ao conectar com SQS", error=str(e))
    
    def _get_queue_url(self) -> Optional[str]:
        """Obtém a URL da fila pelo nome"""
        try:
            # Lista todas as filas
            response = self.client.list_queues()
            queue_urls = response.get('QueueUrls', [])
            
            logger.info(f"📋 Filas encontradas: {len(queue_urls)}")
            
            # Procura pela fila específica
            for url in queue_urls:
                if settings.sqs.queue_name in url:
                    logger.info(f"✅ Fila encontrada: {url}")
                    return url
            
            logger.error(f"❌ Fila '{settings.sqs.queue_name}' não encontrada")
            return None
            
        except Exception as e:
            logger.error("❌ Erro ao listar filas", error=str(e))
            return None
    
    def receive_messages(self) -> List[SQSMessage]:
        """
        Recebe mensagens da fila SQS
        
        Returns:
            Lista de mensagens SQS
        """
        if not self.client or not self.queue_url:
            logger.error("❌ Cliente SQS não conectado")
            return []
        
        try:
            response = self.client.receive_message(
                QueueUrl=self.queue_url,
                MaxNumberOfMessages=settings.sqs.max_messages,
                WaitTimeSeconds=settings.sqs.wait_time_seconds,
                AttributeNames=['All'],
                MessageAttributeNames=['All']
            )
            
            messages = response.get('Messages', [])
            
            if messages:
                logger.info(f"📨 {len(messages)} mensagem(s) recebida(s)")
                
                # Converte para objetos SQSMessage
                sqs_messages = []
                for msg in messages:
                    sqs_message = SQSMessage(
                        message_id=msg.get('MessageId', ''),
                        receipt_handle=msg.get('ReceiptHandle', ''),
                        body=msg.get('Body', ''),
                        attributes=msg.get('Attributes', {}),
                        message_attributes=msg.get('MessageAttributes', {})
                    )
                    sqs_messages.append(sqs_message)
                
                return sqs_messages
            else:
                logger.debug("⏳ Nenhuma mensagem recebida")
                return []
                
        except Exception as e:
            logger.error("❌ Erro ao receber mensagens", error=str(e))
            return []
    
    def delete_message(self, receipt_handle: str) -> bool:
        """
        Deleta uma mensagem da fila
        
        Args:
            receipt_handle: Handle da mensagem para deletar
            
        Returns:
            True se deletada com sucesso
        """
        if not self.client or not self.queue_url:
            logger.error("❌ Cliente SQS não conectado")
            return False
        
        try:
            self.client.delete_message(
                QueueUrl=self.queue_url,
                ReceiptHandle=receipt_handle
            )
            logger.info("🗑️ Mensagem deletada da fila com sucesso")
            return True
            
        except Exception as e:
            logger.error("❌ Erro ao deletar mensagem", error=str(e))
            return False
    
    def is_connected(self) -> bool:
        """Verifica se o serviço está conectado"""
        return self.client is not None and self.queue_url is not None
    
    def get_queue_info(self) -> Dict[str, Any]:
        """Retorna informações sobre a fila"""
        if not self.is_connected():
            return {}
        
        return {
            'queue_name': settings.sqs.queue_name,
            'queue_url': self.queue_url,
            'endpoint': settings.sqs.endpoint_url,
            'region': settings.sqs.region,
            'max_retries': settings.sqs.max_retries,
            'wait_time': settings.sqs.wait_time_seconds
        }
