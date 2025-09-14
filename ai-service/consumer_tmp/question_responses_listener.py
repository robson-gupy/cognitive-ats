#!/usr/bin/env python3
"""
Script para escutar a fila SQS de respostas das perguntas

Este script conecta à fila SQS especificada, recebe mensagens com respostas das perguntas,
avalia as respostas usando IA e salva o score na tabela applications.
"""

import os
import sys
import json
import asyncio
import boto3
from datetime import datetime
from botocore.exceptions import ClientError, NoCredentialsError
from dotenv import load_dotenv

# Adicionar o diretório raiz ao path para importar os módulos core
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.question_evaluator import QuestionEvaluator
from core.ai.service import AIService
from shared.config import AIProvider
from consumer.services.applications_service import applications_service
from consumer.services.database_service import database_service
from consumer.utils.logger import logger

# Carrega variáveis de ambiente
load_dotenv()


def get_sqs_client():
    """
    Cria e retorna um cliente SQS configurado
    
    Returns:
        boto3.client: Cliente SQS configurado
    """
    try:
        # Configurações para LocalStack (desenvolvimento local)
        if os.getenv('STORAGE_SERVICE_ENDPOINT'):
            sqs = boto3.client(
                'sqs',
                endpoint_url=os.getenv('STORAGE_SERVICE_ENDPOINT'),
                region_name=os.getenv('AWS_REGION', 'us-east-1'),
                aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID', 'test'),
                aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY', 'test')
            )
            logger.info(f"✅ Cliente SQS configurado para LocalStack: {os.getenv('STORAGE_SERVICE_ENDPOINT')}")
        else:
            # Configurações para AWS real
            sqs = boto3.client('sqs')
            logger.info("✅ Cliente SQS configurado para AWS")
        
        return sqs
        
    except NoCredentialsError:
        logger.error("❌ Erro: Credenciais AWS não encontradas")
        logger.error("   Configure as variáveis de ambiente ou use um perfil AWS")
        sys.exit(1)
    except Exception as e:
        logger.error(f"❌ Erro ao criar cliente SQS: {e}")
        sys.exit(1)


def get_queue_url(sqs_client, queue_name: str) -> str:
    """
    Obtém a URL da fila SQS
    
    Args:
        sqs_client: Cliente SQS
        queue_name: Nome da fila
        
    Returns:
        str: URL da fila
    """
    try:
        if os.getenv('STORAGE_SERVICE_ENDPOINT'):
            # Para LocalStack, construir URL manualmente
            account_id = '000000000000'
            queue_url = f"{os.getenv('STORAGE_SERVICE_ENDPOINT')}/{account_id}/{queue_name}"
            logger.info(f"✅ URL da fila construída: {queue_url}")
        else:
            # Para AWS real, buscar URL da fila
            response = sqs_client.get_queue_url(QueueName=queue_name)
            queue_url = response['QueueUrl']
            logger.info(f"✅ URL da fila obtida: {queue_url}")
        
        return queue_url
        
    except ClientError as e:
        if e.response['Error']['Code'] == 'AWS.SimpleQueueService.NonExistentQueue':
            logger.error(f"❌ Erro: Fila '{queue_name}' não encontrada")
            logger.error("   Execute o script setup-localstack.sh para criar a fila")
            sys.exit(1)
        else:
            logger.error(f"❌ Erro ao obter URL da fila: {e}")
            sys.exit(1)
    except Exception as e:
        logger.error(f"❌ Erro inesperado ao obter URL da fila: {e}")
        sys.exit(1)


async def get_ai_service():
    """
    Cria e retorna uma instância do AIService configurada
    
    Returns:
        AIService: Instância configurada do serviço de IA
    """
    try:
        # Configurar provider de IA
        provider_name = os.getenv('AI_PROVIDER', 'openai').lower()
        provider = AIProvider(provider_name)
        
        # Obter API key
        api_key = None
        if provider == AIProvider.OPENAI:
            api_key = os.getenv('OPENAI_API_KEY')
        elif provider == AIProvider.ANTHROPIC:
            api_key = os.getenv('ANTHROPIC_API_KEY')
        
        if not api_key:
            logger.warning(f"⚠️ API key não configurada para {provider_name}")
            logger.warning("   Configure a variável de ambiente correspondente")
            return None
        
        # Criar serviço de IA
        ai_service = AIService(provider, api_key)
        logger.info(f"✅ AIService configurado com provider: {provider_name}")
        
        return ai_service
        
    except Exception as e:
        logger.error(f"❌ Erro ao configurar AIService: {e}")
        return None


async def evaluate_question_responses(question_responses: list, job_data: dict, ai_service: AIService):
    """
    Avalia as respostas das perguntas usando IA
    
    Args:
        question_responses: Lista de respostas das perguntas
        job_data: Dados da vaga
        ai_service: Serviço de IA configurado
        
    Returns:
        dict: Resultado da avaliação com score e detalhes
    """
    try:
        logger.info(f"🧠 Iniciando avaliação de {len(question_responses)} respostas usando IA")
        
        # Criar avaliador
        evaluator = QuestionEvaluator(ai_service)
        
        # Preparar dados para avaliação
        responses_for_evaluation = []
        for response in question_responses:
            responses_for_evaluation.append({
                'question': response.get('question', ''),
                'answer': response.get('answer', '')
            })
        
        # Dados da vaga para avaliação
        job_info = {
            'title': job_data.get('title', ''),
            'description': job_data.get('description', ''),
            'requirements': job_data.get('requirements', '')
        }
        
        logger.info(f"📋 Avaliando respostas para vaga: {job_info['title']}")
        
        # Avaliar respostas
        evaluation = await evaluator.evaluate_question_responses(
            question_responses=responses_for_evaluation,
            job_data=job_info,
            temperature=0.3  # Baixa temperatura para avaliações consistentes
        )
        
        logger.info(f"✅ Avaliação concluída - Score: {evaluation['score']}/100")
        
        return evaluation
        
    except Exception as e:
        logger.error(f"❌ Erro ao avaliar respostas: {e}")
        # Retornar score padrão em caso de erro
        return {
            'score': 50,
            'details': {},
            'feedback': f'Erro na avaliação: {str(e)}',
            'improvement_areas': ['Erro técnico na avaliação'],
            'evaluated_at': datetime.now().isoformat(),
            'provider': 'error',
            'model': 'error'
        }


async def process_question_response_message(message_body: str, ai_service: AIService):
    """
    Processa mensagem de resposta de pergunta, avalia usando IA e salva no banco
    
    Args:
        message_body: Corpo da mensagem SQS
        ai_service: Serviço de IA configurado
    """
    try:
        data = json.loads(message_body)
        
        logger.info("\n" + "="*80)
        logger.info("📝 NOVA RESPOSTA DE PERGUNTA RECEBIDA")
        logger.info("="*80)
        
        # Informações básicas do evento
        logger.info(f"🎯 Tipo de Evento: {data.get('eventType', 'N/A')}")
        logger.info(f"⏰ Timestamp: {data.get('timestamp', 'N/A')}")
        
        # Dados da resposta
        if 'data' not in data:
            logger.error("❌ Dados da resposta não encontrados na mensagem")
            return
        
        response_data = data['data']
        application_id = response_data.get('applicationId')
        job_id = response_data.get('jobId')
        
        if not application_id:
            logger.error("❌ ID da application não encontrado na mensagem")
            return
        
        logger.info(f"📊 DADOS DA RESPOSTA:")
        logger.info(f"   ID da Resposta: {response_data.get('questionResponseId', 'N/A')}")
        logger.info(f"   ID da Application: {application_id}")
        logger.info(f"   ID da Vaga: {job_id}")
        logger.info(f"   ID da Empresa: {response_data.get('companyId', 'N/A')}")
        
        # Verificar se há respostas para avaliar
        question_responses = []
        if 'responses' in response_data and response_data['responses']:
            question_responses = response_data['responses']
            logger.info(f"   Total de Respostas: {len(question_responses)}")
            
            logger.info(f"\n📝 RESPOSTAS INDIVIDUAIS:")
            for i, response in enumerate(question_responses, 1):
                logger.info(f"\n   {i}. Pergunta: {response.get('question', 'N/A')}")
                logger.info(f"      Resposta: {response.get('answer', 'N/A')}")
                logger.info(f"      ID da Pergunta: {response.get('jobQuestionId', 'N/A')}")
                logger.info(f"      Criado em: {response.get('createdAt', 'N/A')}")
        else:
            logger.warning("⚠️ Nenhuma resposta encontrada para avaliação")
            return
        
        # Dados da vaga
        job_data = data.get('job', {})
        if not job_data:
            logger.error("❌ Dados da vaga não encontrados na mensagem")
            return
        
        logger.info(f"\n💼 DADOS DA VAGA:")
        logger.info(f"   Título: {job_data.get('title', 'N/A')}")
        logger.info(f"   Slug: {job_data.get('slug', 'N/A')}")
        logger.info(f"   Descrição: {job_data.get('description', 'N/A')[:100]}...")
        logger.info(f"   Requisitos: {job_data.get('requirements', 'N/A')[:100]}...")
        
        # Dados da empresa
        if 'company' in data:
            company = data['company']
            logger.info(f"\n🏢 DADOS DA EMPRESA:")
            logger.info(f"   Nome: {company.get('name', 'N/A')}")
            logger.info(f"   Slug: {company.get('slug', 'N/A')}")
        
        # Dados da candidatura
        if 'application' in data:
            application = data['application']
            logger.info(f"\n👤 DADOS DO CANDIDATO:")
            logger.info(f"   Nome: {application.get('firstName', 'N/A')} {application.get('lastName', 'N/A')}")
            logger.info(f"   Email: {application.get('email', 'N/A')}")
            logger.info(f"   Telefone: {application.get('phone', 'N/A')}")
            logger.info(f"   Candidatura criada em: {application.get('createdAt', 'N/A')}")
        
        # Avaliar respostas usando IA
        if ai_service and question_responses:
            logger.info(f"\n🧠 AVALIANDO RESPOSTAS COM IA...")
            
            evaluation = await evaluate_question_responses(question_responses, job_data, ai_service)
            
            # Salvar score no banco
            logger.info(f"\n💾 SALVANDO SCORE NO BANCO...")
            
            result = await applications_service.update_question_responses_score(
                application_id=application_id,
                question_responses_score=evaluation['score'],
                evaluation_provider=evaluation.get('provider'),
                evaluation_model=evaluation.get('model'),
                evaluation_details=evaluation
            )
            
            if result['success']:
                logger.info(f"✅ Score salvo com sucesso na application {application_id}")
                logger.info(f"   Score: {evaluation['score']}/100")
                logger.info(f"   Provider: {evaluation.get('provider', 'N/A')}")
                logger.info(f"   Model: {evaluation.get('model', 'N/A')}")
            else:
                logger.error(f"❌ Falha ao salvar score: {result['error']}")
        else:
            logger.warning("⚠️ AIService não configurado ou sem respostas para avaliar")
        
        logger.info("\n" + "="*80)
        logger.info("✅ MENSAGEM PROCESSADA COM SUCESSO")
        logger.info("="*80 + "\n")
        
    except json.JSONDecodeError as e:
        logger.error(f"❌ Erro ao decodificar JSON da mensagem: {e}")
        logger.error(f"   Mensagem recebida: {message_body}")
    except Exception as e:
        logger.error(f"❌ Erro ao processar mensagem: {e}")
        logger.error(f"   Mensagem recebida: {message_body}")
        import traceback
        logger.error(f"🔍 Traceback completo: {traceback.format_exc()}")


async def listen_to_question_responses_queue(sqs_client, queue_url: str, ai_service: AIService):
    """
    Escuta a fila SQS de respostas das perguntas
    
    Args:
        sqs_client: Cliente SQS
        queue_url: URL da fila
        ai_service: Serviço de IA configurado
    """
    logger.info(f"🎧 Iniciando escuta da fila: {queue_url}")
    logger.info("⏳ Aguardando mensagens de respostas das perguntas... (Ctrl+C para parar)")
    logger.info("-" * 80)
    
    try:
        while True:
            try:
                # Receber mensagens da fila
                response = sqs_client.receive_message(
                    QueueUrl=queue_url,
                    MaxNumberOfMessages=10,
                    WaitTimeSeconds=int(os.getenv('SQS_WAIT_TIME', 20)),
                    AttributeNames=['All'],
                    MessageAttributeNames=['All']
                )
                
                if 'Messages' in response:
                    logger.info(f"📨 Recebidas {len(response['Messages'])} mensagens")
                    
                    for message in response['Messages']:
                        try:
                            logger.info(f"\n🔄 Processando mensagem: {message.get('MessageId', 'N/A')}")
                            
                            # Processar a mensagem
                            await process_question_response_message(message['Body'], ai_service)
                            
                            # Deletar mensagem após processamento bem-sucedido
                            sqs_client.delete_message(
                                QueueUrl=queue_url,
                                ReceiptHandle=message['ReceiptHandle']
                            )
                            
                            logger.info(f"🗑️  Mensagem deletada com sucesso: {message.get('MessageId', 'N/A')}")
                            
                        except Exception as e:
                            logger.error(f"❌ Erro ao processar mensagem {message.get('MessageId', 'N/A')}: {e}")
                            
                            # Tentar deletar mensagem com erro para evitar loop infinito
                            try:
                                sqs_client.delete_message(
                                    QueueUrl=queue_url,
                                    ReceiptHandle=message['ReceiptHandle']
                                )
                                logger.info(f"🗑️  Mensagem com erro deletada: {message.get('MessageId', 'N/A')}")
                            except Exception as delete_error:
                                logger.error(f"⚠️  Erro ao deletar mensagem com erro: {delete_error}")
                        
                        logger.info("-" * 50)
                    
                    logger.info("=" * 80)
                else:
                    logger.info("⏳ Nenhuma mensagem recebida...")
                
                # Pequena pausa para não sobrecarregar
                await asyncio.sleep(1)
                
            except ClientError as e:
                logger.error(f"❌ Erro do cliente SQS: {e}")
                await asyncio.sleep(5)  # Pausa maior em caso de erro
            except Exception as e:
                logger.error(f"❌ Erro inesperado: {e}")
                await asyncio.sleep(5)
                
    except KeyboardInterrupt:
        logger.info("\n⏹️  Escuta interrompida pelo usuário")
    except Exception as e:
        logger.error(f"❌ Erro durante a escuta: {e}")


async def main():
    """
    Função principal
    """
    logger.info("=== Question Responses SQS Listener ===")
    logger.info("   Com integração QuestionEvaluator e salvamento no banco")
    logger.info("")  # Linha em branco
    
    # Obtém o nome da fila
    queue_name = os.getenv('QUESTION_RESPONSES_SQS_QUEUE_NAME')
    if not queue_name:
        logger.error("❌ Variável QUESTION_RESPONSES_SQS_QUEUE_NAME não configurada")
        logger.error("   Configure no arquivo .env:")
        logger.error("   QUESTION_RESPONSES_SQS_QUEUE_NAME=question-responses-queue")
        sys.exit(1)
    
    logger.info(f"🎯 Fila alvo: {queue_name}")
    logger.info("")  # Linha em branco
    
    # Conectar ao banco de dados
    logger.info("🔌 Conectando ao banco de dados...")
    try:
        await database_service.connect()
        logger.info("✅ Conectado ao banco de dados")
    except Exception as e:
        logger.error(f"❌ Erro ao conectar ao banco: {e}")
        logger.error("   Verifique as configurações de banco no arquivo .env")
        sys.exit(1)
    
    # Configurar serviço de IA
    logger.info("🧠 Configurando serviço de IA...")
    ai_service = await get_ai_service()
    if ai_service:
        logger.info("✅ Serviço de IA configurado")
    else:
        logger.warning("⚠️ Serviço de IA não configurado - avaliações não serão realizadas")
    
    logger.info("")  # Linha em branco
    
    # Cria o cliente SQS
    sqs_client = get_sqs_client()
    
    # Obtém a URL da fila
    queue_url = get_queue_url(sqs_client, queue_name)
    
    logger.info("")  # Linha em branco
    logger.info("🚀 Iniciando listener...")
    logger.info("")  # Linha em branco
    
    # Inicia a escuta da fila
    await listen_to_question_responses_queue(sqs_client, queue_url, ai_service)
    
    logger.info("\n👋 Listener finalizado")


if __name__ == "__main__":
    # Executa o loop de eventos assíncrono
    asyncio.run(main())
