# Exemplo de Uso - Listener de Scores de Candidatos

## Visão Geral

O **Listener de Scores** é um novo componente que processa mensagens da fila `APPLICATIONS_AI_SCORE_SQS_QUEUE_NAME` para calcular scores de candidatos usando IA e atualizar as applications no banco de dados.

## 🎯 Funcionalidade

Este listener:
1. **Recebe mensagens** da fila de scores
2. **Calcula scores** usando `ai_service.evaluate_candidate`
3. **Atualiza applications** com `ApplicationsService.update_application_scores`
4. **Processa em paralelo** com o listener de CVs

## 📋 Estrutura da Mensagem

### Formato JSON Esperado

```json
{
  "applicationId": "550e8400-e29b-41d4-a716-446655440000",
  "resumeData": {
    "personal_info": {
      "name": "João Silva",
      "email": "joao@email.com",
      "phone": "+55 11 99999-9999"
    },
    "education": [
      {
        "degree": "Bacharelado em Ciência da Computação",
        "institution": "Universidade Federal",
        "year": "2020",
        "gpa": "8.5"
      }
    ],
    "experience": [
      {
        "title": "Desenvolvedor Full Stack",
        "company": "Tech Corp",
        "duration": "2 anos",
        "description": "Desenvolvimento de aplicações web com React e Node.js"
      }
    ],
    "skills": ["JavaScript", "React", "Node.js", "Python", "TypeScript"],
    "languages": [
      {
        "language": "Inglês",
        "level": "Avançado"
      },
      {
        "language": "Espanhol",
        "level": "Intermediário"
      }
    ],
    "achievements": [
      "Certificação AWS Developer",
      "Projeto open source com 100+ stars"
    ]
  },
  "jobData": {
    "title": "Desenvolvedor Full Stack Senior",
    "description": "Desenvolvimento de aplicações web modernas e escaláveis",
    "requirements": [
      "React/Next.js",
      "Node.js/TypeScript",
      "Experiência com cloud (AWS/GCP)",
      "Conhecimento de arquitetura de microserviços"
    ],
    "responsibilities": [
      "Desenvolver features frontend e backend",
      "Code review e mentoria de desenvolvedores júnior",
      "Participar de decisões arquiteturais"
    ],
    "education_required": "Bacharelado em Computação ou áreas relacionadas",
    "experience_required": "3+ anos em desenvolvimento full stack",
    "skills_required": ["React", "Node.js", "TypeScript", "SQL"]
  },
  "questionResponses": [
    {
      "question": "Como você lida com prazos apertados?",
      "answer": "Organizo as tarefas por prioridade, uso metodologias ágeis como Scrum, e comunico proativamente sobre possíveis atrasos."
    },
    {
      "question": "Qual sua experiência com testes automatizados?",
      "answer": "Uso Jest para testes unitários, Cypress para E2E, e sempre busco manter cobertura acima de 80%."
    }
  ],
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

## 🚀 Como Usar

### 1. Configurar Variáveis de Ambiente

```bash
# Fila para scores de candidatos
export APPLICATIONS_AI_SCORE_SQS_QUEUE_NAME=applications-ai-score-queue

# Configurações AWS
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_REGION=us-east-1

# Configurações do banco
export DB_HOST=postgres
export DB_PORT=5432
export DB_USERNAME=postgres
export DB_PASSWORD=postgres
export DB_NAME=cognitive_ats
```

### 2. Iniciar o Listener

```bash
cd ai-service/consumer
python main.py
```

### 3. Fluxo Automatizado (NOVO!)

**Agora o sistema funciona de forma automatizada:**

1. **Envie uma mensagem para a fila de CVs**:
   ```bash
   aws --endpoint-url=http://localhost:4566 sqs send-message \
     --queue-url http://localhost:4566/000000000000/applications-queue \
     --message-body '{
       "resumeUrl": "https://exemplo.com/cv.pdf",
       "applicationId": "auto-cv-001",
       "jobId": "job-001"
     }'
   ```

2. **O sistema automaticamente**:
   - ✅ Processa o PDF do currículo
   - ✅ Extrai informações com IA
   - ✅ Envia dados para o backend
   - 🚀 **ENVIA AUTOMATICAMENTE para a fila de scores**
   - ✅ Calcula scores com IA
   - ✅ Atualiza a application no banco

**Não é mais necessário enviar mensagens separadas para cada fila!**

### 4. Enviar Mensagem para a Fila (Método Manual - Opcional)

```bash
# Usando AWS CLI local
aws --endpoint-url=http://localhost:4566 sqs send-message \
  --queue-url http://localhost:4566/000000000000/applications-ai-score-queue \
  --message-body '{
    "applicationId": "550e8400-e29b-41d4-a716-446655440000",
    "resumeData": {
      "personal_info": {"name": "João Silva"},
      "education": [],
      "experience": [],
      "skills": ["JavaScript", "React"]
    },
    "jobData": {
      "title": "Desenvolvedor Frontend",
      "requirements": ["React", "JavaScript"]
    }
  }'
```

## 📊 Processamento dos Scores

### 1. Recebimento da Mensagem

```
📝 Processando mensagem de score
   message_id: 12345
   receive_count: 1
```

### 2. Validação dos Dados

```
🚀 Calculando score para candidato
   application_id: 550e8400-e29b-41d4-a716-446655440000
   message_id: 12345
```

### 3. Cálculo com IA

```
⏳ Aguardando resposta do serviço de IA...
   application_id: 550e8400-e29b-41d4-a716-446655440000
   message_id: 12345
   provider: openai

🚀 Iniciando geração de texto
   provider: openai
   prompt_length: 2048

⏳ Aguardando resposta da API externa...
   provider: openai
   prompt_length: 2048

✅ Resposta recebida da API externa
   provider: openai
   response_length: 512

✅ Resposta recebida do serviço de IA
   application_id: 550e8400-e29b-41d4-a716-446655440000
   message_id: 12345
   response_received: true

📊 Scores calculados
   application_id: 550e8400-e29b-41d4-a716-446655440000
   overall_score: 85
   education_score: 90
   experience_score: 80
```

### 4. Atualização no Banco

```
💾 Atualizando scores no banco de dados...
   application_id: 550e8400-e29b-41d4-a716-446655440000
   message_id: 12345

🔄 Atualizando scores da application 550e8400-e29b-41d4-a716-446655440000
✅ Scores da application 550e8400-e29b-41d4-a716-446655440000 atualizados com sucesso
   Overall Score: 85
   Education Score: 90
   Experience Score: 80
```

### 5. Confirmação de Sucesso

```
✅ Score processado e atualizado com sucesso
   application_id: 550e8400-e29b-41d4-a716-446655440000
   processing_time: 2.5
```

## 🔧 Exemplos de Código

### Exemplo 1: Enviar Mensagem via Python

```python
import boto3
import json

# Configurar cliente SQS
sqs = boto3.client(
    'sqs',
    endpoint_url='http://localhost:4566',
    aws_access_key_id='test',
    aws_secret_access_key='test',
    region_name='us-east-1'
)

# Dados da mensagem
message_data = {
    "applicationId": "550e8400-e29b-41d4-a716-446655440000",
    "resumeData": {
        "personal_info": {"name": "Maria Santos"},
        "education": [
            {
                "degree": "Engenharia de Software",
                "institution": "Universidade Federal",
                "year": "2021"
            }
        ],
        "experience": [
            {
                "title": "Desenvolvedora Frontend",
                "company": "Tech Solutions",
                "duration": "1 ano",
                "description": "React, TypeScript, CSS"
            }
        ],
        "skills": ["React", "TypeScript", "CSS", "JavaScript"]
    },
    "jobData": {
        "title": "Desenvolvedora Frontend",
        "requirements": ["React", "TypeScript"],
        "education_required": "Bacharelado",
        "experience_required": "1+ ano"
    }
}

# Enviar mensagem
response = sqs.send_message(
    QueueUrl='http://localhost:4566/000000000000/applications-ai-score-queue',
    MessageBody=json.dumps(message_data)
)

print(f"✅ Mensagem enviada: {response['MessageId']}")
```

### Exemplo 2: Monitorar Processamento

```python
import time
from consumer.services.applications_service import applications_service

async def monitorar_application(application_id: str):
    """Monitora o processamento de uma application"""
    
    print(f"🔍 Monitorando application {application_id}")
    
    for i in range(10):  # Verificar por 10 iterações
        application = await applications_service.get_application_by_id(application_id)
        
        if application:
            overall_score = application.get('overall_score')
            education_score = application.get('education_score')
            experience_score = application.get('experience_score')
            
            if all(score is not None for score in [overall_score, education_score, experience_score]):
                print(f"✅ Scores calculados!")
                print(f"   Overall: {overall_score}")
                print(f"   Education: {education_score}")
                print(f"   Experience: {experience_score}")
                return True
            else:
                print(f"⏳ Aguardando scores... ({i+1}/10)")
        else:
            print(f"⚠️ Application não encontrada")
        
        time.sleep(2)  # Aguardar 2 segundos
    
    print("⏰ Timeout - scores não foram calculados")
    return False

# Executar
await monitorar_application("550e8400-e29b-41d4-a716-446655440000")
```

### Exemplo 3: Processamento em Lote

```python
import asyncio
import boto3
import json

async def enviar_lote_scores(applications_data):
    """Envia múltiplas mensagens de score"""
    
    sqs = boto3.client(
        'sqs',
        endpoint_url='http://localhost:4566',
        aws_access_key_id='test',
        aws_secret_access_key='test',
        region_name='us-east-1'
    )
    
    results = []
    
    for app_data in applications_data:
        try:
            response = sqs.send_message(
                QueueUrl='http://localhost:4566/000000000000/applications-ai-score-queue',
                MessageBody=json.dumps(app_data)
            )
            
            results.append({
                'application_id': app_data['applicationId'],
                'success': True,
                'message_id': response['MessageId']
            })
            
            print(f"✅ {app_data['applicationId']}: {response['MessageId']}")
            
        except Exception as e:
            results.append({
                'application_id': app_data['applicationId'],
                'success': False,
                'error': str(e)
            })
            
            print(f"❌ {app_data['applicationId']}: {e}")
    
    return results

# Dados de exemplo
applications = [
    {
        "applicationId": "550e8400-e29b-41d4-a716-446655440001",
        "resumeData": {"personal_info": {"name": "Ana"}, "skills": ["Python"]},
        "jobData": {"title": "Data Scientist", "requirements": ["Python"]}
    },
    {
        "applicationId": "550e8400-e29b-41d4-a716-446655440002",
        "resumeData": {"personal_info": {"name": "Carlos"}, "skills": ["Java"]},
        "jobData": {"title": "Backend Developer", "requirements": ["Java"]}
    }
]

# Executar
results = await enviar_lote_scores(applications)
print(f"📊 Resumo: {len([r for r in results if r['success']])}/{len(results)} enviadas com sucesso")
```

## 🚨 Tratamento de Erros

### Cenários de Erro Comuns

1. **Mensagem com JSON inválido**
   ```
   ⚠️ Mensagem com JSON inválido - deletando
   ```

2. **Campos obrigatórios ausentes**
   ```
   ❌ Campo obrigatório ausente na mensagem: 'applicationId'
   ```

3. **Falha no cálculo de IA**
   ```
   ❌ Falha ao calcular score com IA
   ```

4. **Falha na atualização do banco**
   ```
   ❌ Falha ao atualizar scores: Connection timeout
   ```

### Estratégias de Retry

- **Retry automático** até o limite configurado
- **Mensagens mantidas na fila** para reprocessamento
- **Deleção automática** após limite de tentativas
- **Logs detalhados** para debugging

## 📈 Monitoramento e Métricas

### Logs de Sucesso
- `📝 Processando mensagem de score`
- `🚀 Calculando score para candidato`
- `📊 Scores calculados`
- `✅ Score processado e atualizado com sucesso`

### Logs de Erro
- `⚠️ Mensagem com JSON inválido`
- `❌ Dados da mensagem de score inválidos`
- `❌ Falha no processamento do score`
- `❌ Erro inesperado ao processar mensagem de score`

### Métricas Importantes
- **Taxa de sucesso** no processamento
- **Tempo médio** de processamento
- **Número de retries** por mensagem
- **Status das conexões** (SQS, IA, Banco)

## 🔍 Debugging

### Verificar Status dos Serviços

```python
from consumer.handlers.ai_score_message_handler import AIScoreMessageHandler

handler = AIScoreMessageHandler()
status = handler.get_status()

print("📊 Status dos serviços:")
print(f"   SQS: {status['sqs']}")
print(f"   IA Service: {status['ai_service']}")
print(f"   Database: {status['database']}")
```

### Verificar Conexão SQS

```python
from consumer.services.sqs_service import SQSService
from consumer.config.settings import settings

sqs_service = SQSService(settings.get_ai_score_sqs_config())
queue_info = sqs_service.get_queue_info()

print(f"🔗 Status da fila: {queue_info}")
```

## 📝 Notas Importantes

1. **Dados do currículo**: Devem vir já processados (não URLs de PDF)
2. **Dados da vaga**: Devem incluir requisitos e responsabilidades
3. **Respostas das perguntas**: Campo opcional para avaliação adicional
4. **Processamento paralelo**: Funciona simultaneamente com o listener de CVs
5. **Tratamento de erros**: Sistema robusto com retry e fallback
6. **Logs detalhados**: Facilita debugging e monitoramento
