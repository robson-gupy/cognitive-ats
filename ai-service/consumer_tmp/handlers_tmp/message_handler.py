"""
Handler principal para processamento de mensagens SQS
"""

import json
from typing import List, Optional
from datetime import datetime

from consumer.config.settings import settings
from consumer.utils.logger import logger
from consumer.utils.validators import validate_json_message, validate_resume_message, is_retry_limit_reached
from consumer.models.message import QueueMessage, ResumeMessage
from consumer.models.result import ProcessingResult
from consumer.services.sqs_service import SQSService
from consumer.services.resume_orchestrator import ResumeOrchestrator
from consumer.services.applications_service import applications_service
import asyncio


class MessageHandler:
    """Handler principal para processamento de mensagens"""
    
    def __init__(self):
        if getattr(settings, 'queue_provider', 'SQS') == 'REDIS':
            from consumer.services.streams_redis_service import StreamsRedisService
            self.sqs_service = StreamsRedisService(settings.get_redis_config())
        else:
            self.sqs_service = SQSService()
        self.resume_orchestrator = ResumeOrchestrator()
    
    async def process_messages(self):
        """Processa mensagens da fila SQS"""
        if not self.sqs_service.is_connected():
            logger.error("❌ Serviço SQS não conectado")
            return
        
        logger.info("🎧 Iniciando processamento de mensagens")
        logger.info("⏳ Aguardando mensagens... (Ctrl+C para parar)")
        
        try:
            while True:
                # Recebe mensagens
                messages = self.sqs_service.receive_messages()
                
                if messages:
                    logger.info(f"📨 Processando {len(messages)} mensagem(s)")
                    
                    for message in messages:
                        await self._process_single_message(message)
                    
                    logger.info("✅ Lote de mensagens processado")
                else:
                    await asyncio.sleep(0.5)
                
        except KeyboardInterrupt:
            logger.info("⏹️ Processamento interrompido pelo usuário")
        except Exception as e:
            logger.error(f"❌ Erro durante processamento de mensagens: {e}")
    
    async def _process_single_message(self, message: QueueMessage):
        """
        Processa uma única mensagem
        
        Args:
            message: Mensagem SQS para processar
        """
        try:
            logger.info(
                "📝 Processando mensagem",
                message_id=message.message_id,
                receive_count=message.receive_count
            )
            
            # Valida se é JSON válido
            message_data = validate_json_message(message.body)
            if not message_data:
                logger.warning(
                    "⚠️ Mensagem com JSON inválido - deletando",
                    message_id=message.message_id
                )
                self.sqs_service.delete_message(message.ack_token)
                return
            
            # Verifica se deve ser processada
            if not self._should_process_message(message_data):
                logger.warning(
                    "⚠️ Mensagem não é de currículo - deletando",
                    message_id=message.message_id,
                    data=message_data
                )
                self.sqs_service.delete_message(message.ack_token)
                return
            
            # Valida dados da mensagem
            resume_message = validate_resume_message(message_data)
            if not resume_message:
                logger.error(
                    "❌ Dados da mensagem inválidos - deletando",
                    message_id=message.message_id,
                    data=message_data
                )
                self.sqs_service.delete_message(message.ack_token)
                return
            
            # Verifica limite de tentativas
            if is_retry_limit_reached(message.receive_count, settings.sqs.max_retries):
                logger.warning(
                    "⚠️ Limite de tentativas atingido - deletando mensagem",
                    message_id=message.message_id,
                    receive_count=message.receive_count,
                    max_retries=settings.sqs.max_retries
                )
                self.sqs_service.delete_message(message.ack_token)
                return
            
            # Processa o currículo
            result = await self.resume_orchestrator.process_resume_from_message(
                resume_message,
                message.message_id
            )
            
            if result.success:
                logger.info(
                    "✅ Mensagem processada com sucesso",
                    message_id=message.message_id,
                    application_id=resume_message.application_id,
                    processing_time=result.processing_time
                )
                
                # Log adicional sobre o envio para fila de scores
                if hasattr(result, 'score_queue_success') and result.score_queue_success:
                    logger.info(
                        "🚀 Currículo enviado para fila de scores",
                        message_id=message.message_id,
                        application_id=resume_message.application_id
                    )
                elif hasattr(result, 'score_queue_error') and result.score_queue_error:
                    logger.warning(
                        "⚠️ Falha ao enviar para fila de scores",
                        message_id=message.message_id,
                        application_id=resume_message.application_id,
                        error=result.score_queue_error
                    )
                
                # Deleta mensagem após processamento bem-sucedido
                self.sqs_service.delete_message(message.ack_token)
                
            else:
                logger.error(
                    "❌ Falha no processamento da mensagem",
                    message_id=message.message_id,
                    application_id=resume_message.application_id,
                    error=result.error
                )
                
                # Se falhou mas não atingiu limite de tentativas, mantém na fila
                if not is_retry_limit_reached(message.receive_count + 1, settings.sqs.max_retries):
                    logger.info(
                        "🔄 Mensagem mantida na fila para retry",
                        message_id=message.message_id,
                        next_attempt=message.receive_count + 1
                    )
                else:
                    logger.warning(
                        "⚠️ Próxima tentativa atingirá limite - deletando mensagem",
                        message_id=message.message_id,
                        receive_count=message.receive_count,
                        max_retries=settings.sqs.max_retries
                    )
                    self.sqs_service.delete_message(message.ack_token)
                    
        except Exception as e:
            logger.error(
                "❌ Erro inesperado ao processar mensagem",
                message_id=message.message_id,
                error=str(e)
            )
            
            # Em caso de erro inesperado, deleta a mensagem para evitar loop
            self.sqs_service.delete_message(message.ack_token)
    
    def _should_process_message(self, message_data: dict) -> bool:
        """
        Verifica se a mensagem deve ser processada
        
        Args:
            message_data: Dados da mensagem
            
        Returns:
            True se deve ser processada
        """
        required_fields = ['resumeUrl', 'applicationId']
        print(message_data)
        return all(field in message_data for field in required_fields)
    
    async def get_status(self) -> dict:
        """Retorna status dos serviços"""
        return {
            'sqs': self.sqs_service.get_queue_info(),
            'backend': self.resume_orchestrator.resume_processor.backend_service.get_backend_info(),
            'ai_service': 'initialized' if self.resume_orchestrator.resume_processor.ai_service else 'not_initialized',
            'database': await applications_service.get_database_status()
        }
