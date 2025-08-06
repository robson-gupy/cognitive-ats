#!/usr/bin/env python3
"""
Script para escutar a fila SQS e processar currículos

Este script conecta à fila SQS especificada, recebe mensagens com resumeUrl e applicationId,
faz download do PDF e processa usando a API da OpenAI.
"""

import os
import sys
import time
import json
import asyncio
import tempfile
import requests
import boto3
from datetime import date, datetime
from botocore.exceptions import ClientError, NoCredentialsError
from dotenv import load_dotenv

# Adiciona o diretório pai ao path para importar os módulos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from services.ai_service import AIService, AIProvider
except ImportError as e:
    print(f"❌ Erro ao importar módulos: {e}")
    print(f"   Python path: {sys.path}")
    print(f"   Diretório atual: {os.getcwd()}")
    print(f"   Arquivos no diretório: {os.listdir('.')}")
    raise

# Carrega variáveis de ambiente
load_dotenv()


def convert_dates_to_iso(data):
    """
    Converte objetos date e datetime para strings ISO para serialização JSON
    
    Args:
        data: Dados a serem convertidos (dict, list, ou valor primitivo)
        
    Returns:
        Dados convertidos com datas em formato ISO
    """
    if isinstance(data, dict):
        return {key: convert_dates_to_iso(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [convert_dates_to_iso(item) for item in data]
    elif isinstance(data, (date, datetime)):
        return data.isoformat()
    else:
        return data


def map_resume_to_backend_format(resume_data: dict) -> dict:
    """
    Mapeia os dados do currículo do formato Python para o formato esperado pelo backend
    
    Args:
        resume_data: Dados do currículo no formato Python
        
    Returns:
        dict: Dados mapeados para o formato do backend
    """
    mapped_data = {}
    
    # Campos básicos
    if 'summary' in resume_data:
        mapped_data['summary'] = resume_data['summary']
    
    # Mapear experiências profissionais
    if 'professional_experiences' in resume_data and resume_data['professional_experiences']:
        mapped_data['professionalExperiences'] = []
        for exp in resume_data['professional_experiences']:
            mapped_exp = {
                'companyName': exp.get('company_name', ''),
                'position': exp.get('position', ''),
                'startDate': exp.get('start_date', ''),
                'endDate': exp.get('end_date'),
                'isCurrent': exp.get('is_current', False),
                'description': exp.get('description'),
                'responsibilities': exp.get('responsibilities'),
                'achievements': exp.get('achievements')
            }
            # Remove campos None
            mapped_exp = {k: v for k, v in mapped_exp.items() if v is not None}
            mapped_data['professionalExperiences'].append(mapped_exp)
    
    # Mapear formações acadêmicas
    if 'academic_formations' in resume_data and resume_data['academic_formations']:
        mapped_data['academicFormations'] = []
        for formation in resume_data['academic_formations']:
            mapped_formation = {
                'institution': formation.get('institution', ''),
                'course': formation.get('course', ''),
                'degree': formation.get('degree', ''),
                'startDate': formation.get('start_date', ''),
                'endDate': formation.get('end_date'),
                'isCurrent': formation.get('is_current', False),
                'status': formation.get('status', 'completed'),
                'description': formation.get('description')
            }
            # Remove campos None
            mapped_formation = {k: v for k, v in mapped_formation.items() if v is not None}
            mapped_data['academicFormations'].append(mapped_formation)
    
    # Mapear conquistas
    if 'achievements' in resume_data and resume_data['achievements']:
        mapped_data['achievements'] = []
        for achievement in resume_data['achievements']:
            mapped_achievement = {
                'title': achievement.get('title', ''),
                'description': achievement.get('description')
            }
            # Remove campos None
            mapped_achievement = {k: v for k, v in mapped_achievement.items() if v is not None}
            mapped_data['achievements'].append(mapped_achievement)
    
    # Mapear idiomas
    if 'languages' in resume_data and resume_data['languages']:
        mapped_data['languages'] = []
        for language in resume_data['languages']:
            mapped_language = {
                'language': language.get('language', ''),
                'proficiencyLevel': language.get('proficiency_level', '')
            }
            # Remove campos None
            mapped_language = {k: v for k, v in mapped_language.items() if v is not None}
            mapped_data['languages'].append(mapped_language)
    
    return mapped_data


def get_sqs_client():
    """Cria e retorna o cliente SQS configurado"""
    try:
        # Obtém as variáveis de ambiente
        endpoint_url = os.getenv('AWS_ENDPOINT_URL')
        access_key = os.getenv('AWS_ACCESS_KEY_ID')
        secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
        region = os.getenv('AWS_REGION')
        
        # Valida se as variáveis estão configuradas
        if not all([endpoint_url, access_key, secret_key, region]):
            print("❌ Variáveis de ambiente AWS não configuradas:")
            print(f"   AWS_ENDPOINT_URL: {endpoint_url}")
            print(f"   AWS_ACCESS_KEY_ID: {access_key}")
            print(f"   AWS_SECRET_ACCESS_KEY: {'***' if secret_key else 'NÃO CONFIGURADA'}")
            print(f"   AWS_REGION: {region}")
            return None
        
        # Cria o cliente SQS
        sqs = boto3.client(
            'sqs',
            endpoint_url=endpoint_url,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region
        )
        
        print(f"✅ Cliente SQS criado com sucesso")
        print(f"   Endpoint: {endpoint_url}")
        print(f"   Região: {region}")
        return sqs
        
    except Exception as e:
        print(f"❌ Erro ao criar cliente SQS: {e}")
        return None


def get_queue_url(sqs_client, queue_name):
    """Obtém a URL da fila pelo nome"""
    try:
        # Lista todas as filas para encontrar a que queremos
        response = sqs_client.list_queues()
        queue_urls = response.get('QueueUrls', [])
        
        print(f"📋 Filas encontradas: {len(queue_urls)}")
        for url in queue_urls:
            print(f"   - {url}")
        
        # Procura pela fila específica
        for url in queue_urls:
            if queue_name in url:
                print(f"✅ Fila encontrada: {url}")
                return url
        
        print(f"❌ Fila '{queue_name}' não encontrada")
        return None
        
    except Exception as e:
        print(f"❌ Erro ao listar filas: {e}")
        return None


def should_delete_message(message: dict, max_retries: int = 3) -> bool:
    """
    Verifica se uma mensagem deve ser deletada baseada no número de tentativas
    
    Args:
        message: Mensagem SQS
        max_retries: Número máximo de tentativas permitidas
        
    Returns:
        bool: True se a mensagem deve ser deletada
    """
    try:
        # Verifica se há atributos de tentativas
        attributes = message.get('Attributes', {})
        approximate_receive_count = int(attributes.get('ApproximateReceiveCount', 1))
        
        return approximate_receive_count >= max_retries
    except Exception:
        return False


async def send_resume_to_backend(application_id: str, resume_data: dict) -> dict:
    """
    Envia os dados do currículo processado para o backend
    
    Args:
        application_id: ID da aplicação
        resume_data: Dados do currículo processado
        
    Returns:
        dict: Resultado da requisição
    """
    try:
        # Obtém a URL do backend das variáveis de ambiente
        backend_url = os.getenv('BACKEND_URL', 'http://localhost:3000')
        
        # URL do endpoint de criação de resumo
        url = f"{backend_url}/resumes/{application_id}"
        
        print(f"📤 Enviando dados do currículo para o backend...")
        print(f"   URL: {url}")
        print(f"   Application ID: {application_id}")
        
        # Faz a requisição POST
        response = requests.post(
            url,
            json=resume_data,
            headers={
                'Content-Type': 'application/json',
            },
            timeout=30
        )
        
        if response.status_code == 201 or response.status_code == 200:
            print(f"✅ Dados do currículo enviados com sucesso!")
            print(f"   Status: {response.status_code}")
            return {
                "success": True,
                "status_code": response.status_code,
                "response": response.json() if response.content else None
            }
        else:
            print(f"❌ Erro ao enviar dados do currículo")
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.text}")
            return {
                "success": False,
                "status_code": response.status_code,
                "error": response.text
            }
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro de conexão com o backend: {e}")
        return {
            "success": False,
            "error": str(e)
        }
    except Exception as e:
        print(f"❌ Erro inesperado ao enviar dados do currículo: {e}")
        return {
            "success": False,
            "error": str(e)
        }


def download_pdf_from_url(url: str) -> str:
    """
    Faz download de um PDF de uma URL e salva em um arquivo temporário
    
    Args:
        url: URL do PDF para download
        
    Returns:
        str: Caminho do arquivo temporário salvo
        
    Raises:
        Exception: Se houver erro no download
    """
    try:
        print(f"📥 Fazendo download do PDF: {url}")
        
        # Faz a requisição HTTP
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        # Verifica se o conteúdo é um PDF
        content_type = response.headers.get('content-type', '').lower()
        if 'pdf' not in content_type and not url.lower().endswith('.pdf'):
            print(f"⚠️  Aviso: Content-Type não é PDF: {content_type}")
        
        # Cria arquivo temporário
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        temp_file.write(response.content)
        temp_file.close()
        
        print(f"✅ PDF salvo em: {temp_file.name}")
        return temp_file.name
        
    except requests.exceptions.RequestException as e:
        raise Exception(f"Erro ao fazer download do PDF: {str(e)}")
    except Exception as e:
        raise Exception(f"Erro inesperado ao fazer download: {str(e)}")


async def process_resume_message(message_data: dict, ai_service: AIService, retry_count: int = 0) -> dict:
    """
    Processa uma mensagem de currículo
    
    Args:
        message_data: Dados da mensagem contendo resumeUrl e applicationId
        ai_service: Instância do serviço de IA
        retry_count: Número de tentativas já realizadas
        
    Returns:
        dict: Resultado do processamento
    """
    try:
        resume_url = message_data.get('resumeUrl')
        application_id = message_data.get('applicationId')
        
        if not resume_url:
            raise Exception("resumeUrl não encontrado na mensagem")
        
        if not application_id:
            raise Exception("applicationId não encontrado na mensagem")
        
        print(f"🔄 Processando currículo para aplicação: {application_id}")
        print(f"   URL: {resume_url}")
        
        # Faz download do PDF
        pdf_path = download_pdf_from_url(resume_url)
        
        try:
            # Processa o currículo
            resume = await ai_service.parse_resume_from_pdf(pdf_path, application_id)
            
            print(f"✅ Currículo processado com sucesso!")
            print(f"   - Resumo: {len(resume.summary or '')} caracteres")
            print(f"   - Experiências: {len(resume.professional_experiences)}")
            print(f"   - Formações: {len(resume.academic_formations)}")
            print(f"   - Conquistas: {len(resume.achievements)}")
            print(f"   - Idiomas: {len(resume.languages)}")
            
            # Prepara os dados do currículo para enviar ao backend
            resume_data = resume.model_dump()
            
            # Converte datas para formato ISO para serialização JSON
            resume_data = convert_dates_to_iso(resume_data)
            
            # Mapeia os dados para o formato esperado pelo backend
            backend_resume_data = map_resume_to_backend_format(resume_data)
            
            # Envia os dados do currículo para o backend
            backend_result = await send_resume_to_backend(application_id, backend_resume_data)
            
            if backend_result['success']:
                return {
                    "success": True,
                    "application_id": application_id,
                    "resume": resume_data,
                    "backend_success": True,
                    "message": "Currículo processado e enviado ao backend com sucesso"
                }
            else:
                return {
                    "success": False,
                    "application_id": application_id,
                    "resume": resume_data,
                    "backend_success": False,
                    "backend_error": backend_result.get('error'),
                    "message": "Currículo processado mas falha ao enviar ao backend"
                }
            
        finally:
            # Remove o arquivo temporário
            try:
                os.unlink(pdf_path)
                print(f"🗑️  Arquivo temporário removido: {pdf_path}")
            except Exception as e:
                print(f"⚠️  Erro ao remover arquivo temporário: {e}")
        
    except Exception as e:
        print(f"❌ Erro ao processar currículo: {str(e)}")
        return {
            "success": False,
            "application_id": application_id if 'application_id' in locals() else None,
            "error": str(e),
            "message": "Erro ao processar currículo"
        }


async def listen_to_queue(sqs_client, queue_url):
    """Escuta a fila SQS e processa mensagens de currículo"""
    print(f"🎧 Iniciando escuta da fila: {queue_url}")
    print("⏳ Aguardando mensagens de currículo... (Ctrl+C para parar)")
    print("-" * 50)
    
    # Inicializa o serviço de IA
    try:
        ai_service = AIService(provider=AIProvider.OPENAI)
        print("✅ Serviço de IA inicializado")
    except Exception as e:
        print(f"❌ Erro ao inicializar serviço de IA: {e}")
        return
    
    try:
        while True:
            # Recebe mensagens da fila
            response = sqs_client.receive_message(
                QueueUrl=queue_url,
                MaxNumberOfMessages=10,
                WaitTimeSeconds=20,  # Long polling
                AttributeNames=['All'],
                MessageAttributeNames=['All']
            )
            
            messages = response.get('Messages', [])
            
            if messages:
                print(f"📨 {len(messages)} mensagem(s) recebida(s)")
                print("=" * 50)
                
                for i, message in enumerate(messages, 1):
                    print(f"📝 Processando mensagem #{i}:")
                    print(f"   ID: {message.get('MessageId')}")
                    print(f"   Receipt Handle: {message.get('ReceiptHandle')[:50]}...")
                    
                    # Imprime o corpo da mensagem
                    body = message.get('Body', '')
                    print(f"   Corpo: {body}")
                    
                    try:
                        # Tenta fazer parse do JSON
                        body_json = json.loads(body)
                        print(f"   JSON: {json.dumps(body_json, indent=2, ensure_ascii=False)}")
                        
                        # Verifica se é uma mensagem de currículo
                        if 'resumeUrl' in body_json and 'applicationId' in body_json:
                            print(f"🔄 Mensagem de currículo detectada!")
                            
                            # Obtém o número de tentativas
                            attributes = message.get('Attributes', {})
                            receive_count = int(attributes.get('ApproximateReceiveCount', 1))
                            max_retries = int(os.getenv('SQS_MAX_RETRIES', '3'))
                            
                            print(f"🔄 Tentativa {receive_count}/{max_retries}")
                            
                            # Processa o currículo
                            result = await process_resume_message(body_json, ai_service, receive_count - 1)
                            
                            if result['success']:
                                print(f"✅ Currículo processado com sucesso!")
                                # Aqui você pode adicionar lógica para salvar no banco ou enviar para outra fila
                                
                                # Deleta a mensagem da fila após processamento bem-sucedido
                                try:
                                    sqs_client.delete_message(
                                        QueueUrl=queue_url,
                                        ReceiptHandle=message.get('ReceiptHandle')
                                    )
                                    print(f"🗑️  Mensagem deletada da fila: {message.get('MessageId')}")
                                except Exception as e:
                                    print(f"⚠️  Erro ao deletar mensagem da fila: {e}")
                            else:
                                print(f"❌ Falha no processamento: {result.get('error', 'Erro desconhecido')}")
                                
                                # Verifica se deve deletar a mensagem após muitas tentativas
                                if should_delete_message(message, max_retries):
                                    print(f"⚠️  Máximo de tentativas atingido ({max_retries}) - deletando mensagem")
                                    try:
                                        sqs_client.delete_message(
                                            QueueUrl=queue_url,
                                            ReceiptHandle=message.get('ReceiptHandle')
                                        )
                                        print(f"🗑️  Mensagem deletada após {max_retries} tentativas: {message.get('MessageId')}")
                                    except Exception as e:
                                        print(f"⚠️  Erro ao deletar mensagem após tentativas: {e}")
                                else:
                                    print(f"🔄 Mensagem mantida na fila para retry: {message.get('MessageId')}")
                        else:
                            print(f"⚠️  Mensagem não contém resumeUrl e applicationId - ignorando")
                            # Deleta mensagens inválidas para evitar loop
                            try:
                                sqs_client.delete_message(
                                    QueueUrl=queue_url,
                                    ReceiptHandle=message.get('ReceiptHandle')
                                )
                                print(f"🗑️  Mensagem inválida deletada: {message.get('MessageId')}")
                            except Exception as e:
                                print(f"⚠️  Erro ao deletar mensagem inválida: {e}")
                        
                    except json.JSONDecodeError:
                        print(f"   ❌ Mensagem não é JSON válido - ignorando")
                        # Deleta mensagens com JSON inválido
                        try:
                            sqs_client.delete_message(
                                QueueUrl=queue_url,
                                ReceiptHandle=message.get('ReceiptHandle')
                            )
                            print(f"🗑️  Mensagem com JSON inválido deletada: {message.get('MessageId')}")
                        except Exception as e:
                            print(f"⚠️  Erro ao deletar mensagem com JSON inválido: {e}")
                    except Exception as e:
                        print(f"   ❌ Erro ao processar mensagem: {e}")
                        # Deleta mensagens com erro de processamento para evitar loop
                        try:
                            sqs_client.delete_message(
                                QueueUrl=queue_url,
                                ReceiptHandle=message.get('ReceiptHandle')
                            )
                            print(f"🗑️  Mensagem com erro deletada: {message.get('MessageId')}")
                        except Exception as delete_error:
                            print(f"⚠️  Erro ao deletar mensagem com erro: {delete_error}")
                    
                    print("-" * 30)
                
                print("=" * 50)
            else:
                print("⏳ Nenhuma mensagem recebida...")
            
            # Pequena pausa para não sobrecarregar
            await asyncio.sleep(1)
            
    except KeyboardInterrupt:
        print("\n⏹️  Escuta interrompida pelo usuário")
    except Exception as e:
        print(f"❌ Erro durante a escuta: {e}")


async def main():
    """Função principal"""
    print("=== SQS Resume Processor ===")
    print()
    
    # Obtém o nome da fila
    queue_name = os.getenv('APPLICATIONS_SQS_QUEUE_NAME')
    if not queue_name:
        print("❌ Variável APPLICATIONS_SQS_QUEUE_NAME não configurada")
        print("   Configure no arquivo .env:")
        print("   APPLICATIONS_SQS_QUEUE_NAME=applications-queue")
        sys.exit(1)
    
    print(f"🎯 Fila alvo: {queue_name}")
    print()
    
    # Cria o cliente SQS
    sqs_client = get_sqs_client()
    if not sqs_client:
        sys.exit(1)
    
    # Obtém a URL da fila
    queue_url = get_queue_url(sqs_client, queue_name)
    if not queue_url:
        print("❌ Não foi possível obter a URL da fila")
        sys.exit(1)
    
    print()
    
    # Inicia a escuta
    await listen_to_queue(sqs_client, queue_url)


if __name__ == "__main__":
    asyncio.run(main()) 