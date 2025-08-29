#!/usr/bin/env python3
"""
Script para escutar a fila SQS de respostas das perguntas

Este script conecta à fila SQS especificada, recebe mensagens com respostas das perguntas
e simplesmente imprime no console para demonstração.
"""

import os
import sys
import json
import asyncio
import boto3
from datetime import datetime
from botocore.exceptions import ClientError, NoCredentialsError
from dotenv import load_dotenv

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
        if os.getenv('AWS_ENDPOINT_URL'):
            sqs = boto3.client(
                'sqs',
                endpoint_url=os.getenv('AWS_ENDPOINT_URL'),
                region_name=os.getenv('AWS_REGION', 'us-east-1'),
                aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID', 'test'),
                aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY', 'test')
            )
            print(f"✅ Cliente SQS configurado para LocalStack: {os.getenv('AWS_ENDPOINT_URL')}")
        else:
            # Configurações para AWS real
            sqs = boto3.client('sqs')
            print("✅ Cliente SQS configurado para AWS")
        
        return sqs
        
    except NoCredentialsError:
        print("❌ Erro: Credenciais AWS não encontradas")
        print("   Configure as variáveis de ambiente ou use um perfil AWS")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Erro ao criar cliente SQS: {e}")
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
        if os.getenv('AWS_ENDPOINT_URL'):
            # Para LocalStack, construir URL manualmente
            account_id = '000000000000'
            queue_url = f"{os.getenv('AWS_ENDPOINT_URL')}/{account_id}/{queue_name}"
            print(f"✅ URL da fila construída: {queue_url}")
        else:
            # Para AWS real, buscar URL da fila
            response = sqs_client.get_queue_url(QueueName=queue_name)
            queue_url = response['QueueUrl']
            print(f"✅ URL da fila obtida: {queue_url}")
        
        return queue_url
        
    except ClientError as e:
        if e.response['Error']['Code'] == 'AWS.SimpleQueueService.NonExistentQueue':
            print(f"❌ Erro: Fila '{queue_name}' não encontrada")
            print("   Execute o script setup-localstack.sh para criar a fila")
            sys.exit(1)
        else:
            print(f"❌ Erro ao obter URL da fila: {e}")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Erro inesperado ao obter URL da fila: {e}")
        sys.exit(1)


def process_question_response_message(message_body: str):
    """
    Processa mensagem de resposta de pergunta
    
    Args:
        message_body: Corpo da mensagem SQS
    """
    try:
        data = json.loads(message_body)
        
        print("\n" + "="*80)
        print("📝 NOVA RESPOSTA DE PERGUNTA RECEBIDA")
        print("="*80)
        
        # Informações básicas do evento
        print(f"🎯 Tipo de Evento: {data.get('eventType', 'N/A')}")
        print(f"⏰ Timestamp: {data.get('timestamp', 'N/A')}")
        
        # Dados da resposta
        if 'data' in data:
            response_data = data['data']
            print(f"\n📊 DADOS DA RESPOSTA:")
            print(f"   ID da Resposta: {response_data.get('questionResponseId', 'N/A')}")
            print(f"   ID da Application: {response_data.get('applicationId', 'N/A')}")
            print(f"   ID da Vaga: {response_data.get('jobId', 'N/A')}")
            print(f"   ID da Empresa: {response_data.get('companyId', 'N/A')}")
            
            # Se for múltiplas respostas
            if 'totalResponses' in response_data:
                print(f"   Total de Respostas: {response_data.get('totalResponses', 0)}")
                
                if 'responses' in response_data:
                    print(f"\n📝 RESPOSTAS INDIVIDUAIS:")
                    for i, response in enumerate(response_data['responses'], 1):
                        print(f"\n   {i}. Pergunta: {response.get('question', 'N/A')}")
                        print(f"      Resposta: {response.get('answer', 'N/A')}")
                        print(f"      ID da Pergunta: {response.get('jobQuestionId', 'N/A')}")
                        print(f"      Criado em: {response.get('createdAt', 'N/A')}")
            else:
                # Resposta individual
                print(f"   ID da Pergunta: {response_data.get('jobQuestionId', 'N/A')}")
                print(f"   Pergunta: {response_data.get('question', 'N/A')}")
                print(f"   Resposta: {response_data.get('answer', 'N/A')}")
                print(f"   Criado em: {response_data.get('createdAt', 'N/A')}")
        
        # Dados da vaga
        if 'job' in data:
            job = data['job']
            print(f"\n💼 DADOS DA VAGA:")
            print(f"   Título: {job.get('title', 'N/A')}")
            print(f"   Slug: {job.get('slug', 'N/A')}")
            print(f"   Descrição: {job.get('description', 'N/A')[:100]}...")
            print(f"   Requisitos: {job.get('requirements', 'N/A')[:100]}...")
        
        # Dados da empresa
        if 'company' in data:
            company = data['company']
            print(f"\n🏢 DADOS DA EMPRESA:")
            print(f"   Nome: {company.get('name', 'N/A')}")
            print(f"   Slug: {company.get('slug', 'N/A')}")
        
        # Dados da candidatura
        if 'application' in data:
            application = data['application']
            print(f"\n👤 DADOS DO CANDIDATO:")
            print(f"   Nome: {application.get('firstName', 'N/A')} {application.get('lastName', 'N/A')}")
            print(f"   Email: {application.get('email', 'N/A')}")
            print(f"   Telefone: {application.get('phone', 'N/A')}")
            print(f"   Candidatura criada em: {application.get('createdAt', 'N/A')}")
        
        print("\n" + "="*80)
        print("✅ MENSAGEM PROCESSADA COM SUCESSO")
        print("="*80 + "\n")
        
    except json.JSONDecodeError as e:
        print(f"❌ Erro ao decodificar JSON da mensagem: {e}")
        print(f"   Mensagem recebida: {message_body}")
    except Exception as e:
        print(f"❌ Erro ao processar mensagem: {e}")
        print(f"   Mensagem recebida: {message_body}")


async def listen_to_question_responses_queue(sqs_client, queue_url: str):
    """
    Escuta a fila SQS de respostas das perguntas
    
    Args:
        sqs_client: Cliente SQS
        queue_url: URL da fila
    """
    print(f"🎧 Iniciando escuta da fila: {queue_url}")
    print("⏳ Aguardando mensagens de respostas das perguntas... (Ctrl+C para parar)")
    print("-" * 80)
    
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
                    print(f"📨 Recebidas {len(response['Messages'])} mensagens")
                    
                    for message in response['Messages']:
                        try:
                            print(f"\n🔄 Processando mensagem: {message.get('MessageId', 'N/A')}")
                            
                            # Processar a mensagem
                            process_question_response_message(message['Body'])
                            
                            # Deletar mensagem após processamento bem-sucedido
                            sqs_client.delete_message(
                                QueueUrl=queue_url,
                                ReceiptHandle=message['ReceiptHandle']
                            )
                            
                            print(f"🗑️  Mensagem deletada com sucesso: {message.get('MessageId', 'N/A')}")
                            
                        except Exception as e:
                            print(f"❌ Erro ao processar mensagem {message.get('MessageId', 'N/A')}: {e}")
                            
                            # Tentar deletar mensagem com erro para evitar loop infinito
                            try:
                                sqs_client.delete_message(
                                    QueueUrl=queue_url,
                                    ReceiptHandle=message['ReceiptHandle']
                                )
                                print(f"🗑️  Mensagem com erro deletada: {message.get('MessageId', 'N/A')}")
                            except Exception as delete_error:
                                print(f"⚠️  Erro ao deletar mensagem com erro: {delete_error}")
                        
                        print("-" * 50)
                    
                    print("=" * 80)
                else:
                    print("⏳ Nenhuma mensagem recebida...")
                
                # Pequena pausa para não sobrecarregar
                await asyncio.sleep(1)
                
            except ClientError as e:
                print(f"❌ Erro do cliente SQS: {e}")
                await asyncio.sleep(5)  # Pausa maior em caso de erro
            except Exception as e:
                print(f"❌ Erro inesperado: {e}")
                await asyncio.sleep(5)
                
    except KeyboardInterrupt:
        print("\n⏹️  Escuta interrompida pelo usuário")
    except Exception as e:
        print(f"❌ Erro durante a escuta: {e}")


async def main():
    """
    Função principal
    """
    print("=== Question Responses SQS Listener ===")
    print()
    
    # Obtém o nome da fila
    queue_name = os.getenv('QUESTION_RESPONSES_SQS_QUEUE_NAME')
    if not queue_name:
        print("❌ Variável QUESTION_RESPONSES_SQS_QUEUE_NAME não configurada")
        print("   Configure no arquivo .env:")
        print("   QUESTION_RESPONSES_SQS_QUEUE_NAME=question-responses-queue")
        sys.exit(1)
    
    print(f"🎯 Fila alvo: {queue_name}")
    print()
    
    # Cria o cliente SQS
    sqs_client = get_sqs_client()
    
    # Obtém a URL da fila
    queue_url = get_queue_url(sqs_client, queue_name)
    
    print()
    print("🚀 Iniciando listener...")
    print()
    
    # Inicia a escuta da fila
    await listen_to_question_responses_queue(sqs_client, queue_url)
    
    print("\n👋 Listener finalizado")


if __name__ == "__main__":
    # Executa o loop de eventos assíncrono
    asyncio.run(main())
