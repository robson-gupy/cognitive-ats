#!/usr/bin/env python3
"""
Script de teste para o Question Responses SQS Listener

Este script testa a conectividade com a fila SQS e envia uma mensagem de teste
para verificar se o listener está funcionando corretamente.
"""

import os
import sys
import json
import boto3
from datetime import datetime
from botocore.exceptions import ClientError, NoCredentialsError
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()


def get_sqs_client():
    """
    Cria e retorna um cliente SQS configurado
    """
    try:
        if os.getenv('STORAGE_SERVICE_ENDPOINT'):
            sqs = boto3.client(
                'sqs',
                endpoint_url=os.getenv('STORAGE_SERVICE_ENDPOINT'),
                region_name=os.getenv('AWS_REGION', 'us-east-1'),
                aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID', 'test'),
                aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY', 'test')
            )
            print(f"✅ Cliente SQS configurado para LocalStack: {os.getenv('STORAGE_SERVICE_ENDPOINT')}")
        else:
            sqs = boto3.client('sqs')
            print("✅ Cliente SQS configurado para AWS")
        
        return sqs
        
    except Exception as e:
        print(f"❌ Erro ao criar cliente SQS: {e}")
        sys.exit(1)


def get_queue_url(sqs_client, queue_name: str) -> str:
    """
    Obtém a URL da fila SQS
    """
    try:
        if os.getenv('STORAGE_SERVICE_ENDPOINT'):
            account_id = '000000000000'
            queue_url = f"{os.getenv('STORAGE_SERVICE_ENDPOINT')}/{account_id}/{queue_name}"
            print(f"✅ URL da fila construída: {queue_url}")
        else:
            response = sqs_client.get_queue_url(QueueName=queue_name)
            queue_url = response['QueueUrl']
            print(f"✅ URL da fila obtida: {queue_url}")
        
        return queue_url
        
    except Exception as e:
        print(f"❌ Erro ao obter URL da fila: {e}")
        sys.exit(1)


def send_test_message(sqs_client, queue_url: str):
    """
    Envia uma mensagem de teste para a fila
    """
    try:
        # Mensagem de teste simulando múltiplas respostas
        test_message = {
            "eventType": "MULTIPLE_QUESTION_RESPONSES_CREATED",
            "timestamp": datetime.now().isoformat(),
            "data": {
                "totalResponses": 3,
                "responses": [
                    {
                        "questionResponseId": "test-response-1",
                        "jobQuestionId": "test-question-1",
                        "question": "Qual sua experiência com Python?",
                        "answer": "Programo em Python há 5 anos, principalmente com Django e Flask",
                        "createdAt": datetime.now().isoformat()
                    },
                    {
                        "questionResponseId": "test-response-2",
                        "jobQuestionId": "test-question-2",
                        "question": "Quais frameworks web você conhece?",
                        "answer": "Django, Flask, FastAPI, React, Vue.js",
                        "createdAt": datetime.now().isoformat()
                    },
                    {
                        "questionResponseId": "test-response-3",
                        "jobQuestionId": "test-question-3",
                        "question": "Como você trabalha com bancos de dados?",
                        "answer": "Tenho experiência com PostgreSQL, MySQL e MongoDB. Uso ORMs como SQLAlchemy e Django ORM",
                        "createdAt": datetime.now().isoformat()
                    }
                ],
                "applicationId": "test-application-id",
                "jobId": "test-job-id",
                "companyId": "test-company-id"
            },
            "job": {
                "id": "test-job-id",
                "title": "Desenvolvedor Python Full Stack",
                "slug": "desenvolvedor-python-full-stack",
                "description": "Estamos procurando um desenvolvedor Python experiente para trabalhar em projetos web inovadores",
                "requirements": "Python, Django, React, PostgreSQL, Docker"
            },
            "company": {
                "id": "test-company-id",
                "name": "TechCorp",
                "slug": "techcorp"
            },
            "application": {
                "id": "test-application-id",
                "firstName": "João",
                "lastName": "Silva",
                "email": "joao.silva@email.com",
                "phone": "(11) 99999-9999",
                "createdAt": datetime.now().isoformat()
            }
        }

        # Enviar mensagem
        response = sqs_client.send_message(
            QueueUrl=queue_url,
            MessageBody=json.dumps(test_message, ensure_ascii=False)
        )

        print(f"✅ Mensagem de teste enviada com sucesso!")
        print(f"   MessageId: {response['MessageId']}")
        print(f"   MD5: {response['MD5OfMessageBody']}")
        
        return response['MessageId']
        
    except Exception as e:
        print(f"❌ Erro ao enviar mensagem de teste: {e}")
        return None


def receive_test_message(sqs_client, queue_url: str):
    """
    Recebe a mensagem de teste para verificar se foi enviada corretamente
    """
    try:
        print("\n🔄 Recebendo mensagem de teste...")
        
        response = sqs_client.receive_message(
            QueueUrl=queue_url,
            MaxNumberOfMessages=1,
            WaitTimeSeconds=5
        )
        
        if 'Messages' in response:
            message = response['Messages'][0]
            print(f"✅ Mensagem recebida: {message.get('MessageId', 'N/A')}")
            
            # Processar a mensagem
            try:
                data = json.loads(message['Body'])
                print(f"   Tipo de Evento: {data.get('eventType', 'N/A')}")
                print(f"   Total de Respostas: {data.get('data', {}).get('totalResponses', 'N/A')}")
                print(f"   Candidato: {data.get('application', {}).get('firstName', 'N/A')} {data.get('application', {}).get('lastName', 'N/A')}")
                print(f"   Vaga: {data.get('job', {}).get('title', 'N/A')}")
                
                # Deletar mensagem após processamento
                sqs_client.delete_message(
                    QueueUrl=queue_url,
                    ReceiptHandle=message['ReceiptHandle']
                )
                print("   🗑️  Mensagem deletada após processamento")
                
            except json.JSONDecodeError as e:
                print(f"   ❌ Erro ao decodificar JSON: {e}")
            
        else:
            print("⏳ Nenhuma mensagem recebida no timeout")
            
    except Exception as e:
        print(f"❌ Erro ao receber mensagem: {e}")


def main():
    """
    Função principal
    """
    print("=== Teste do Question Responses SQS Listener ===")
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
    print("🧪 Iniciando testes...")
    print()
    
    # Teste 1: Enviar mensagem
    print("1️⃣  Teste de Envio de Mensagem")
    print("-" * 40)
    message_id = send_test_message(sqs_client, queue_url)
    
    if message_id:
        print()
        print("2️⃣  Teste de Recebimento de Mensagem")
        print("-" * 40)
        receive_test_message(sqs_client, queue_url)
    
    print()
    print("🎉 Testes concluídos!")
    print()
    print("💡 Para testar o listener completo:")
    print("   1. Execute o listener: python consumer/question_responses_listener.py")
    print("   2. Execute este script novamente para enviar uma mensagem")
    print("   3. Observe o output do listener")


if __name__ == "__main__":
    main()
