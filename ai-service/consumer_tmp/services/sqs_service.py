"""
Serviço para operações SQS
"""

import boto3
from typing import List, Optional, Dict, Any
from botocore.exceptions import ClientError, NoCredentialsError

from consumer.config.settings import settings
from consumer.utils.logger import logger
from consumer.models.message import QueueMessage


class SQSService:
    """Serviço para operações com SQS"""
    
    def __init__(self, sqs_config: Optional[Dict[str, Any]] = None, queue_name: Optional[str] = None):
        """
        Inicializa o serviço SQS
        
        Args:
            sqs_config: Configurações SQS (opcional, usa padrão se não fornecido)
            queue_name: Nome da fila (opcional, usa padrão se não fornecido)
        """
        self.client = None
        self.queue_url = None
        self.sqs_config = sqs_config or settings.get_sqs_config()
        self.queue_name = queue_name or settings.sqs.queue_name
        self._connect()
    
    def _connect(self):
        """Estabelece conexão com SQS"""
        try:
            # Cria cliente SQS
            self.client = boto3.client('sqs', **self.sqs_config)
            
            # Obtém URL da fila
            self.queue_url = self._get_queue_url()
            
            if self.queue_url:
                logger.info(
                    f"✅ Cliente SQS conectado com sucesso - Endpoint: {self.sqs_config.get('endpoint_url')}, Região: {self.sqs_config.get('region_name')}, Fila: {self.queue_name}"
                )
            else:
                logger.error("❌ Não foi possível obter URL da fila")
                
        except NoCredentialsError:
            logger.error("❌ Credenciais AWS não configuradas")
        except Exception as e:
            logger.error(f"❌ Erro ao conectar com SQS: {e}")
    
    def _get_queue_url(self) -> Optional[str]:
        """Obtém a URL da fila pelo nome"""
        try:
            # Lista todas as filas
            response = self.client.list_queues()
            queue_urls = response.get('QueueUrls', [])
            
            logger.info(f"📋 Filas encontradas: {len(queue_urls)}")
            
            # Procura pela fila específica
            for url in queue_urls:
                if self.queue_name in url:
                    logger.info(f"✅ Fila encontrada: {url}")
                    return url
            
            logger.error(f"❌ Fila '{self.queue_name}' não encontrada")
            return None
            
        except Exception as e:
            logger.error(f"❌ Erro ao listar filas: {e}")
            return None
    
    def receive_messages(self) -> List[QueueMessage]:
        """
        Recebe mensagens da fila SQS
        
        Returns:
            Lista de mensagens SQS
        """
        if not self.client or not self.queue_url:
            logger.error("❌ Cliente SQS não conectado")
            return []
        
        try:
            # Usa configurações padrão se não especificadas
            max_messages = getattr(settings.sqs, 'max_messages', 10)
            wait_time = getattr(settings.sqs, 'wait_time_seconds', 20)
            
            response = self.client.receive_message(
                QueueUrl=self.queue_url,
                MaxNumberOfMessages=max_messages,
                WaitTimeSeconds=wait_time,
                AttributeNames=['All'],
                MessageAttributeNames=['All']
            )
            
            messages = response.get('Messages', [])
            
            if messages:
                logger.info(f"📨 {len(messages)} mensagem(s) recebida(s)")
                
                # Converte para objetos SQSMessage
                sqs_messages = []
                for msg in messages:
                    sqs_message = QueueMessage(
                        message_id=msg.get('MessageId', ''),
                        ack_token=msg.get('ReceiptHandle', ''),
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
            logger.error(f"❌ Erro ao receber mensagens: {e}")
            return []
    
    def delete_message(self, ack_token: str) -> bool:
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
            self.client.delete_message(QueueUrl=self.queue_url, ReceiptHandle=ack_token)
            logger.info("🗑️ Mensagem deletada da fila com sucesso")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erro ao deletar mensagem: {e}")
            return False
    
    def is_connected(self) -> bool:
        """Verifica se o serviço está conectado"""
        return self.client is not None and self.queue_url is not None
    
    def get_queue_info(self) -> Dict[str, Any]:
        """Retorna informações sobre a fila"""
        if not self.is_connected():
            return {}
        
        return {
            'queue_name': self.queue_name,
            'queue_url': self.queue_url,
            'endpoint': self.sqs_config.get('endpoint_url'),
            'region': self.sqs_config.get('region_name'),
            'max_retries': getattr(settings.sqs, 'max_retries', 3),
            'wait_time': getattr(settings.sqs, 'wait_time_seconds', 20)
        }
    
    def send_message(self, message_body: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Envia uma mensagem para a fila SQS
        
        Args:
            message_body: Corpo da mensagem a ser enviada
            
        Returns:
            Dict com o resultado do envio ou None se falhar
        """
        if not self.client or not self.queue_url:
            logger.error("❌ Cliente SQS não conectado")
            return None
        
        try:
            import json
            
            # Converte a mensagem para JSON
            message_json = json.dumps(message_body, ensure_ascii=False, default=str)
            
            # Envia a mensagem
            response = self.client.send_message(
                QueueUrl=self.queue_url,
                MessageBody=message_json
            )
            
            logger.info(
                "✅ Mensagem enviada para a fila com sucesso",
                message_id=response.get('MessageId'),
                queue_name=self.queue_name
            )
            
            return {
                'MessageId': response.get('MessageId'),
                'MD5OfMessageBody': response.get('MD5OfMessageBody'),
                'queue_name': self.queue_name
            }
            
        except Exception as e:
            logger.error(
                f"❌ Erro ao enviar mensagem para a fila: {e}",
                queue_name=self.queue_name,
                error=str(e)
            )
            return None
