# Exemplo de Uso - Atualização de Scores no Banco

## Visão Geral

O sistema agora possui **dois listeners SQS** que funcionam em paralelo:

1. **Listener de CVs** - Processa currículos e extrai informações
2. **Listener de Scores** - Calcula scores de candidatos usando IA

## Configuração das Filas

### Variáveis de Ambiente Necessárias

```bash
# Fila para processamento de CVs
APPLICATIONS_SQS_QUEUE_NAME=applications-queue

# Fila para cálculo de scores (NOVA)
APPLICATIONS_AI_SCORE_SQS_QUEUE_NAME=applications-ai-score-queue

# Configurações AWS
AWS_ENDPOINT_URL=http://localhost:4566
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_REGION=us-east-1

# Configurações do banco
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=cognitive_ats

# Configurações do backend
BACKEND_URL=http://localhost:3000
```

## Funcionamento dos Listeners

### 1. Listener de CVs (Existente)

Processa mensagens da fila `APPLICATIONS_SQS_QUEUE_NAME` com estrutura:

```json
{
  "resumeUrl": "https://exemplo.com/cv.pdf",
  "applicationId": "uuid-da-application",
  "jobId": "uuid-da-vaga",
  "companyId": "uuid-da-empresa"
}
```

**Funcionalidades:**
- Download do PDF do currículo
- Parse e extração de informações
- Armazenamento no banco de dados
- Atualização da application com dados extraídos

### 2. Listener de Scores (NOVO)

Processa mensagens da fila `APPLICATIONS_AI_SCORE_SQS_QUEUE_NAME` com estrutura:

```json
{
  "applicationId": "uuid-da-application",
  "resumeData": {
    "personal_info": { "name": "João Silva" },
    "education": [...],
    "experience": [...],
    "skills": [...]
  },
  "jobData": {
    "title": "Desenvolvedor Full Stack",
    "requirements": [...],
    "education_required": "Bacharelado",
    "experience_required": "3+ anos"
  },
  "questionResponses": [
    {
      "question": "Como você lida com prazos?",
      "answer": "Uso metodologias ágeis..."
    }
  ]
}
```

**Funcionalidades:**
- Recebe dados do currículo já processados
- Calcula scores usando `ai_service.evaluate_candidate`
- Atualiza a application com os scores calculados
- Usa `ApplicationsService.update_application_scores`

## Execução

### Iniciar os Listeners

```bash
cd ai-service/consumer
python main.py
```

**Saída esperada:**
```
=== SQS Consumer - CVs e Scores ===
Versão: 1.0.0

🔧 Configurações carregadas
   Fila SQS CVs: applications-queue
   Fila SQS Scores: applications-ai-score-queue
   Endpoint SQS: http://localhost:4566
   Backend: http://localhost:3000
   Database: postgres:5432/cognitive_ats
   Max Retries: 3
   Log Level: INFO

📊 Status dos serviços:
   SQS CVs: ✅ Conectado
   SQS Scores: ✅ Conectado
   Backend: ✅ Disponível
   IA Service CVs: ✅ Inicializado
   IA Service Scores: ✅ Inicializado
   Database: ✅ Conectado

🚀 Iniciando listeners em paralelo...
🎧 Iniciando processamento de mensagens
🎧 Iniciando processamento de mensagens de score
⏳ Aguardando mensagens... (Ctrl+C para parar)
⏳ Aguardando mensagens... (Ctrl+C para parar)
```

## Fluxo de Processamento

### Para CVs:
1. Recebe mensagem da fila de CVs
2. Download do PDF
3. Parse com IA
4. Armazena dados extraídos
5. Deleta mensagem da fila

### Para Scores:
1. Recebe mensagem da fila de scores
2. Extrai dados do currículo e vaga
3. Chama `ai_service.evaluate_candidate`
4. Atualiza application com scores
5. Deleta mensagem da fila

## Exemplo de Mensagem para Score

```json
{
  "applicationId": "550e8400-e29b-41d4-a716-446655440000",
  "resumeData": {
    "personal_info": {
      "name": "Maria Santos",
      "email": "maria@email.com"
    },
    "education": [
      {
        "degree": "Bacharelado em Engenharia de Software",
        "institution": "Universidade Federal",
        "year": "2022"
      }
    ],
    "experience": [
      {
        "title": "Desenvolvedora Frontend",
        "company": "Tech Solutions",
        "duration": "2 anos",
        "description": "Desenvolvimento de interfaces React"
      }
    ],
    "skills": ["React", "TypeScript", "CSS", "JavaScript"]
  },
  "jobData": {
    "title": "Desenvolvedora Frontend Senior",
    "description": "Desenvolvimento de aplicações web modernas",
    "requirements": ["React", "TypeScript", "CSS"],
    "education_required": "Bacharelado em Computação",
    "experience_required": "3+ anos"
  },
  "questionResponses": [
    {
      "question": "Qual sua experiência com testes?",
      "answer": "Uso Jest e React Testing Library para testes unitários"
    }
  ]
}
```

## Monitoramento

Ambos os listeners fornecem logs detalhados:

- **Processamento de CVs**: `📝 Processando mensagem`, `✅ Mensagem processada com sucesso`
- **Processamento de Scores**: `📝 Processando mensagem de score`, `✅ Score processado com sucesso`

## Tratamento de Erros

- **Retry automático** até o limite configurado
- **Logs detalhados** para debugging
- **Deleção de mensagens** após processamento bem-sucedido
- **Fallback** para mensagens com erro após limite de tentativas
