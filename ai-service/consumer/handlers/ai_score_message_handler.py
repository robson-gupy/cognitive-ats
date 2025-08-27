"""
Handler para processamento de mensagens de score de candidatos
"""

import json
import asyncio
from typing import Optional
from datetime import datetime

from consumer.config.settings import settings
from consumer.utils.logger import logger
from consumer.utils.validators import validate_json_message, is_retry_limit_reached
from consumer.models.message import SQSMessage, AIScoreMessage
from consumer.models.result import ProcessingResult
from consumer.services.sqs_service import SQSService
from consumer.services.applications_service import applications_service
from core.ai.service import AIService


class AIScoreMessageHandler:
    """Handler para processamento de mensagens de score de candidatos"""
    
    def __init__(self):
        self.sqs_service = SQSService(
            sqs_config=settings.get_ai_score_sqs_config(),
            queue_name=settings.ai_score_sqs.queue_name
        )
        try:
            from shared.config import AIProvider
            self.ai_service = AIService(provider=AIProvider.OPENAI)
        except Exception as e:
            logger.warning(f"⚠️ AIService não inicializado: {e}")
            self.ai_service = None
    
    async def process_messages(self):
        """Processa mensagens da fila SQS de scores"""
        if not self.sqs_service.is_connected():
            logger.error("❌ Serviço SQS de scores não conectado")
            return
        
        logger.info("🎧 Iniciando processamento de mensagens de score")
        logger.info("⏳ Aguardando mensagens... (Ctrl+C para parar)")
        
        try:
            while True:
                # Recebe mensagens
                messages = self.sqs_service.receive_messages()
                
                if messages:
                    logger.info(f"📨 Processando {len(messages)} mensagem(s) de score")
                    
                    for message in messages:
                        await self._process_single_score_message(message)
                    
                    logger.info("✅ Lote de mensagens de score processado")
                else:
                    await asyncio.sleep(0.5)
                
        except KeyboardInterrupt:
            logger.info("⏹️ Processamento de scores interrompido pelo usuário")
        except Exception as e:
            logger.error(f"❌ Erro durante processamento de mensagens de score: {e}")
    
    async def _process_single_score_message(self, message: SQSMessage):
        """
        Processa uma única mensagem de score
        
        Args:
            message: Mensagem SQS para processar
        """
        try:
            logger.info(
                "📝 Processando mensagem de score",
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
                self.sqs_service.delete_message(message.receipt_handle)
                return
            
            # Verifica se deve ser processada
            if not self._should_process_score_message(message_data):
                logger.warning(
                    "⚠️ Mensagem não é de score - deletando",
                    message_id=message.message_id,
                    data=message_data
                )
                self.sqs_service.delete_message(message.receipt_handle)
                return
            
            # Valida dados da mensagem
            score_message = self._validate_score_message(message_data)
            if not score_message:
                logger.error(
                    "❌ Dados da mensagem de score inválidos - deletando",
                    message_id=message.message_id,
                    data=message_data
                )
                self.sqs_service.delete_message(message.receipt_handle)
                return
            
            # Verifica limite de tentativas
            if is_retry_limit_reached(message.receive_count, settings.ai_score_sqs.max_retries):
                logger.warning(
                    "⚠️ Limite de tentativas atingido - deletando mensagem",
                    message_id=message.message_id,
                    receive_count=message.receive_count,
                    max_retries=settings.ai_score_sqs.max_retries
                )
                self.sqs_service.delete_message(message.receipt_handle)
                return
            
            # Processa o score
            result = await self._process_candidate_score(
                score_message,
                message.message_id
            )
            
            if result.success:
                logger.info(
                    "✅ Score processado com sucesso",
                    message_id=message.message_id,
                    application_id=score_message.application_id,
                    processing_time=result.processing_time
                )
                
                # Deleta mensagem após processamento bem-sucedido
                self.sqs_service.delete_message(message.receipt_handle)
                
            else:
                logger.error(
                    "❌ Falha no processamento do score",
                    message_id=message.message_id,
                    application_id=score_message.application_id,
                    error=result.error
                )
                
                # Se falhou mas não atingiu limite de tentativas, mantém na fila
                if not is_retry_limit_reached(message.receive_count + 1, settings.ai_score_sqs.max_retries):
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
                        max_retries=settings.ai_score_sqs.max_retries
                    )
                    self.sqs_service.delete_message(message.receipt_handle)
                    
        except Exception as e:
            logger.error(
                "❌ Erro inesperado ao processar mensagem de score",
                message_id=message.message_id,
                error=str(e)
            )
            
            # Em caso de erro inesperado, deleta a mensagem para evitar loop
            self.sqs_service.delete_message(message.receipt_handle)
    
    def _should_process_score_message(self, message_data: dict) -> bool:
        """
        Verifica se a mensagem deve ser processada como score
        
        Args:
            message_data: Dados da mensagem
            
        Returns:
            True se deve ser processada
        """
        required_fields = ['applicationId', 'resumeData', 'jobData']
        return all(field in message_data for field in required_fields)
    
    def _validate_score_message(self, message_data: dict) -> Optional[AIScoreMessage]:
        """
        Valida e cria objeto de mensagem de score
        
        Args:
            message_data: Dados da mensagem
            
        Returns:
            Objeto AIScoreMessage ou None se inválido
        """
        try:
            return AIScoreMessage(
                application_id=message_data['applicationId'],
                resume_data=message_data['resumeData'],
                job_data=message_data['jobData'],
                question_responses=message_data.get('questionResponses'),
                created_at=message_data.get('createdAt')
            )
        except KeyError as e:
            logger.error(f"❌ Campo obrigatório ausente na mensagem: {e}")
            return None
        except Exception as e:
            logger.error(f"❌ Erro ao validar mensagem de score: {e}")
            return None
    
    async def _process_candidate_score(
        self, 
        score_message: AIScoreMessage, 
        message_id: str
    ) -> ProcessingResult:
        """
        Processa o score de um candidato
        
        Args:
            score_message: Mensagem com dados para cálculo do score
            message_id: ID da mensagem para logging
            
        Returns:
            Resultado do processamento
        """
        start_time = datetime.now()
        
        try:
            logger.info(
                "🚀 Calculando score para candidato",
                application_id=score_message.application_id,
                message_id=message_id
            )
            
            # Log antes de chamar o serviço de IA
            logger.info(
                "⏳ Aguardando resposta do serviço de IA...",
                application_id=score_message.application_id,
                message_id=message_id,
                provider=getattr(self.ai_service, 'provider', 'unknown')
            )
            
            # Calcula score usando IA
            evaluation_result = await self.ai_service.evaluate_candidate(
                resume_data=score_message.resume_data,
                job_data=score_message.job_data,
                question_responses=score_message.question_responses
            )
            
            # Log após receber resposta da IA
            logger.info(
                "✅ Resposta recebida do serviço de IA",
                application_id=score_message.application_id,
                message_id=message_id,
                response_received=bool(evaluation_result)
            )
            
            if not evaluation_result:
                raise Exception("Falha ao calcular score com IA")
            
            # Extrai e converte scores para float
            overall_score = self._convert_score_to_float(evaluation_result.get('overall_score'))
            education_score = self._convert_score_to_float(evaluation_result.get('education_score'))
            experience_score = self._convert_score_to_float(evaluation_result.get('experience_score'))
            
            logger.info(
                "📊 Scores calculados",
                application_id=score_message.application_id,
                overall_score=overall_score,
                education_score=education_score,
                experience_score=experience_score
            )
            
            # Valida se pelo menos um score válido foi calculado
            if all(score is None for score in [overall_score, education_score, experience_score]):
                raise Exception("Nenhum score válido foi calculado pela IA")
            
            # Log antes de atualizar o banco
            logger.info(
                "💾 Atualizando scores no banco de dados...",
                application_id=score_message.application_id,
                message_id=message_id
            )
            
            # Atualiza application com os scores
            update_result = await applications_service.update_application_scores(
                application_id=score_message.application_id,
                overall_score=overall_score,
                education_score=education_score,
                experience_score=experience_score
            )
            
            if not update_result['success']:
                raise Exception(f"Falha ao atualizar scores: {update_result['error']}")
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            logger.info(
                "✅ Score processado e atualizado com sucesso",
                application_id=score_message.application_id,
                processing_time=processing_time
            )
            
            return ProcessingResult(
                success=True,
                application_id=score_message.application_id,
                message_id=message_id,
                timestamp=datetime.now(),
                processing_time=processing_time,
                result_data={
                    'overall_score': overall_score,
                    'education_score': education_score,
                    'experience_score': experience_score
                }
            )
            
        except Exception as e:
            processing_time = (datetime.now() - start_time).total_seconds()
            logger.error(
                f"❌ Erro ao processar score - {str(e)}",
                application_id=score_message.application_id,
                message_id=message_id,
                error=str(e),
                processing_time=processing_time
            )
            
            return ProcessingResult(
                success=False,
                application_id=score_message.application_id,
                message_id=message_id,
                timestamp=datetime.now(),
                processing_time=processing_time,
                error=str(e)
            )
    
    def _convert_score_to_float(self, score_value) -> Optional[float]:
        """
        Converte um valor de score para float
        
        Args:
            score_value: Valor do score (pode ser string, int, float, etc.)
            
        Returns:
            Score como float ou None se inválido
        """
        if score_value is None:
            return None
        
        try:
            # Se já for float, retorna como está
            if isinstance(score_value, float):
                return score_value
            
            # Se for int, converte para float
            if isinstance(score_value, int):
                return float(score_value)
            
            # Se for string, tenta converter
            if isinstance(score_value, str):
                # Remove caracteres não numéricos e converte
                cleaned = score_value.strip().replace(',', '.')
                return float(cleaned)
            
            # Para outros tipos, tenta conversão direta
            return float(score_value)
            
        except (ValueError, TypeError):
            logger.warning(f"⚠️ Não foi possível converter score '{score_value}' para float")
            return None
    
    async def get_status(self) -> dict:
        """Retorna status dos serviços"""
        return {
            'sqs': self.sqs_service.get_queue_info(),
            'ai_service': 'initialized' if self.ai_service else 'not_initialized',
            'database': await applications_service.get_database_status()
        }
