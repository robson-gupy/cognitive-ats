#!/usr/bin/env python3
"""
Script para testar o Question Responses Listener

Este script envia uma mensagem de exemplo para a fila SQS para testar
o processamento e avaliação das respostas usando IA.
"""

import os
import sys
import json
import boto3
import asyncio
from datetime import datetime
from botocore.exceptions import ClientError, NoCredentialsError
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()


def get_sqs_client():
    """Cria e retorna um cliente SQS configurado"""
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
    """Obtém a URL da fila SQS"""
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


def create_test_message():
    """Cria uma mensagem de teste para enviar para a fila"""
    return {
        "eventType": "QUESTION_RESPONSES_RECEIVED",
        "timestamp": datetime.now().isoformat(),
        "data": {
            "questionResponseId": f"qr_test_{int(datetime.now().timestamp())}",
            "applicationId": "app_test_123",
            "jobId": "job_test_456",
            "companyId": "comp_test_789",
            "totalResponses": 3,
            "responses": [
                {
                    "jobQuestionId": "q_001",
                    "question": "Como você implementaria autenticação JWT em uma API FastAPI?",
                    "answer": "Usaria o FastAPI-JWT-Auth ou implementaria manualmente com PyJWT, criando endpoints para login/logout e middleware para validar tokens nas rotas protegidas. Também implementaria refresh tokens para maior segurança.",
                    "createdAt": datetime.now().isoformat()
                },
                {
                    "jobQuestionId": "q_002",
                    "question": "Explique sua experiência com Docker e containers",
                    "answer": "Trabalho com Docker há 3 anos, criando Dockerfiles, docker-compose para desenvolvimento local e orquestrando containers em produção com Kubernetes. Tenho experiência com multi-stage builds e otimização de imagens.",
                    "createdAt": datetime.now().isoformat()
                },
                {
                    "jobQuestionId": "q_003",
                    "question": "Como você abordaria a migração de um monólito para microserviços?",
                    "answer": "Começaria identificando domínios de negócio, extraindo gradualmente serviços, implementando API Gateway e garantindo comunicação assíncrona entre serviços. Usaria padrões como Saga para transações distribuídas.",
                    "createdAt": datetime.now().isoformat()
                }
            ]
        },
        "job": {
            "title": "Desenvolvedor Python Senior",
            "slug": "desenvolvedor-python-senior",
            "description": "Desenvolvedor Python com experiência em APIs, microserviços e cloud computing. Responsável por desenvolver e manter aplicações web escaláveis, implementar arquiteturas de software robustas e colaborar com equipes de produto e design.",
            "requirements": "Python 3.8+, FastAPI, Docker, AWS, 5+ anos de experiência, conhecimento em arquitetura de software, experiência com bancos de dados relacionais e NoSQL, familiaridade com práticas DevOps e CI/CD."
        },
        "company": {
            "name": "TechCorp Solutions",
            "slug": "techcorp-solutions"
        },
        "application": {
            "firstName": "João",
            "lastName": "Silva",
            "email": "joao.silva@email.com",
            "phone": "+55 11 99999-9999",
            "createdAt": datetime.now().isoformat()
        }
    }


async def send_test_message():
    """Envia uma mensagem de teste para a fila SQS"""
    print("🧪 Testando Question Responses Listener")
    print("=" * 50)
    
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
    
    # Cria mensagem de teste
    test_message = create_test_message()
    
    print("📝 Mensagem de teste criada:")
    print(f"   Event Type: {test_message['eventType']}")
    print(f"   Application ID: {test_message['data']['applicationId']}")
    print(f"   Job: {test_message['job']['title']}")
    print(f"   Respostas: {len(test_message['data']['responses'])}")
    print()
    
    try:
        # Envia a mensagem para a fila
        print("🚀 Enviando mensagem para a fila...")
        
        response = sqs_client.send_message(
            QueueUrl=queue_url,
            MessageBody=json.dumps(test_message, ensure_ascii=False),
            MessageAttributes={
                'test_message': {
                    'StringValue': 'true',
                    'DataType': 'String'
                },
                'timestamp': {
                    'StringValue': datetime.now().isoformat(),
                    'DataType': 'String'
                }
            }
        )
        
        print("✅ Mensagem enviada com sucesso!")
        print(f"   Message ID: {response['MessageId']}")
        print(f"   MD5: {response['MD5OfMessageBody']}")
        print()
        print("📋 Agora execute o question_responses_listener.py para processar a mensagem")
        print("   python consumer/question_responses_listener.py")
        
    except Exception as e:
        print(f"❌ Erro ao enviar mensagem: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    # Executa o teste
    asyncio.run(send_test_message())
