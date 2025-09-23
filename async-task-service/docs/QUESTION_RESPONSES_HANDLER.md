# Handler de Question Responses - Async Task Service

Este documento descreve o novo handler criado no async-task-service para processar mensagens de question responses e calcular scores usando IA.

## Handler: `handler_question_responses`

### Funcionalidade

O handler processa mensagens da fila de question responses, avalia as respostas usando o AI service e atualiza o score no backend.

### Fila Configurada

- **Nome da Fila**: `question-responses-queue` (configurável via `QUESTION_RESPONSES_QUEUE_NAME`)
- **Handler**: `handler_question_responses`

## Estrutura da Mensagem

### Formato da Mensagem de Entrada

```json
{
  "eventType": "MULTIPLE_QUESTION_RESPONSES_CREATED",
  "timestamp": "2025-09-23T21:47:59.775Z",
  "data": {
    "totalResponses": 2,
    "responses": [
      {
        "questionResponseId": "968d352d-e14d-41b0-9d7c-53bb0b27059f",
        "jobQuestionId": "7506b2f2-a510-4f5e-aad3-6b2a0fba577b",
        "question": "Descreva uma situação em que você precisou organizar múltiplas tarefas administrativas com prazos conflitantes. Como priorizou as atividades e qual foi o resultado?",
        "answer": "asdf",
        "createdAt": "2025-09-23T21:47:59.769Z"
      },
      {
        "questionResponseId": "816a0126-4768-4d68-b506-7b5bd968fa94",
        "jobQuestionId": "8dd7e47b-5a20-4825-ab28-e0f10e164554",
        "question": "Qual sua experiência prática com Excel e sistemas de gestão (ERP)? Cite funções, fórmulas ou relatórios que você costuma usar e dê um exemplo de como usou essas ferramentas para resolver um problema administrativo.",
        "answer": "asdf",
        "createdAt": "2025-09-23T21:47:59.769Z"
      }
    ],
    "applicationId": "af17fc0a-6d18-422a-b48d-84ba648ab256",
    "jobId": "c964db08-36da-4e87-84d8-dff5cf708f2f",
    "companyId": "12f9c2a1-d01b-492b-a6e9-207507815e5f"
  },
  "job": {
    "id": "c964db08-36da-4e87-84d8-dff5cf708f2f",
    "title": "Auxiliar de Escritório - Suporte Administrativo",
    "slug": "auxiliar-de-escritorio-suporte-administrativo",
    "description": "Buscamos um Auxiliar de Escritório para prestar suporte administrativo às rotinas do departamento...",
    "requirements": "Ensino Médio completo; experiência mínima de 6 meses em funções administrativas..."
  },
  "company": {
    "id": "12f9c2a1-d01b-492b-a6e9-207507815e5f",
    "name": "Gupy",
    "slug": "gupy"
  },
  "application": {
    "id": "af17fc0a-6d18-422a-b48d-84ba648ab256",
    "firstName": "Robson",
    "lastName": "Mendes",
    "email": "dddj33ghgh@dsifjasif.com.br",
    "phone": "11971380503",
    "createdAt": "2025-09-23T21:47:56.456Z"
  }
}
```

### Campos da Mensagem

#### `eventType`
- Tipo do evento (geralmente `MULTIPLE_QUESTION_RESPONSES_CREATED`)

#### `timestamp`
- Timestamp ISO do evento

#### `data`
- **totalResponses**: Número total de respostas
- **responses**: Lista de respostas das perguntas
- **applicationId**: ID da aplicação
- **jobId**: ID da vaga
- **companyId**: ID da empresa

#### `responses[]`
- **questionResponseId**: ID da resposta da pergunta
- **jobQuestionId**: ID da pergunta da vaga
- **question**: Texto da pergunta
- **answer**: Resposta do candidato
- **createdAt**: Timestamp de criação

#### `job`
- **id**: ID da vaga
- **title**: Título da vaga
- **description**: Descrição da vaga
- **requirements**: Requisitos da vaga

#### `company`
- **id**: ID da empresa
- **name**: Nome da empresa
- **slug**: Slug da empresa

#### `application`
- **id**: ID da aplicação
- **firstName**: Nome do candidato
- **lastName**: Sobrenome do candidato
- **email**: Email do candidato
- **phone**: Telefone do candidato
- **createdAt**: Timestamp de criação

## Fluxo de Processamento

### 1. Recebimento da Mensagem
```
📝 Processando question responses: {application_id}
```

### 2. Extração e Validação dos Dados
- Extrai dados da mensagem
- Valida campos obrigatórios
- Prepara dados para o AI service

### 3. Chamada para AI Service
```
🤖 Enviando {num_respostas} respostas para avaliação no AI service
📤 Enviando requisição para AI service: {ai_service_url}
```

**Endpoint chamado**: `POST /question-responses/evaluate`

**Payload enviado**:
```json
{
  "question_responses": [
    {
      "question": "Descreva uma situação...",
      "answer": "asdf"
    }
  ],
  "job_data": {
    "title": "Auxiliar de Escritório",
    "description": "...",
    "requirements": ["Ensino Médio completo", "experiência mínima..."],
    "responsibilities": [],
    "education_required": "",
    "experience_required": "",
    "skills_required": []
  }
}
```

### 4. Processamento da Resposta do AI Service
```
✅ Avaliação recebida do AI service com sucesso
📊 Score das question responses: {score}/100
🔧 Provider usado: {provider}
🤖 Modelo usado: {model}
```

### 5. Atualização no Backend
```
💾 Atualizando question responses score no banco de dados...
✅ Question responses score atualizado com sucesso
📊 Score final: {score}/100
```

**Função chamada**: `BackendService.update_application_scores()`

**Parâmetros**:
- `application_id`: ID da aplicação
- `question_responses_score`: Score calculado
- `evaluation_provider`: Provider de IA usado
- `evaluation_model`: Modelo de IA usado
- `evaluation_details`: Detalhes da avaliação
- `evaluated_at`: Timestamp da avaliação

## Configuração

### Variáveis de Ambiente

- **QUESTION_RESPONSES_QUEUE_NAME**: Nome da fila (padrão: `question-responses-queue`)
- **AI_SERVICE_URL**: URL do AI service (padrão: `http://ai-service:8000`)

### Registro do Handler

O handler é registrado automaticamente em `config/handler_settings.py`:

```python
QUEUE_HANDLERS = {
    "applications-queue": handler_application_created,
    "ai-score-queue": handler_ai_score,
    "question-responses-queue": handler_question_responses,  # ✅ NOVO
}
```

## Logs do Handler

### Logs de Sucesso
```
INFO - 📝 Processando question responses: af17fc0a-6d18-422a-b48d-84ba648ab256
INFO - 🆔 Application ID: af17fc0a-6d18-422a-b48d-84ba648ab256
INFO - 💼 Job ID: c964db08-36da-4e87-84d8-dff5cf708f2f
INFO - 🏢 Company ID: 12f9c2a1-d01b-492b-a6e9-207507815e5f
INFO - ❓ Total de respostas: 2
INFO - 📋 Event Type: MULTIPLE_QUESTION_RESPONSES_CREATED
INFO - 🤖 Enviando 2 respostas para avaliação no AI service
INFO - 📤 Enviando requisição para AI service: http://ai-service:8000/question-responses/evaluate
INFO - ✅ Avaliação recebida do AI service com sucesso
INFO - 📊 Score das question responses: 75/100
INFO - 🔧 Provider usado: openai
INFO - 🤖 Modelo usado: gpt-4
INFO - 💾 Atualizando question responses score no banco de dados... application_id=af17fc0a-6d18-422a-b48d-84ba648ab256
INFO - ✅ Question responses score atualizado com sucesso para application af17fc0a-6d18-422a-b48d-84ba648ab256
INFO - 📊 Score final: 75/100
```

### Logs de Erro
```
ERROR - ❌ Erro ao processar question responses: {erro}
ERROR - ⏰ Timeout ao chamar AI service
ERROR - 💥 Erro ao chamar AI service: {erro}
ERROR - ❌ Erro do AI service - Status: 500, Erro: Internal Server Error
ERROR - ⚠️ Score inválido recebido: -1, usando score padrão: 50
```

## Tratamento de Erros

### 1. Validação de Dados
- Verifica se `applicationId` está presente
- Verifica se `responses` está presente
- Verifica se `job` data está presente

### 2. Erros de Comunicação
- **Timeout**: Timeout de 2 minutos para chamadas ao AI service
- **Erro HTTP**: Tratamento de códigos de status HTTP
- **Erro de Rede**: Tratamento de erros de conectividade

### 3. Validação de Score
- Verifica se o score é um número válido (0-100)
- Usa score padrão (50) se inválido
- Log de warning para scores inválidos

### 4. Fallbacks
- Score padrão: 50 (se inválido)
- Timeout: 120 segundos para AI service
- Retry automático via Redis Streams

## Modelo de Dados

### QuestionResponsesMessage

```python
@dataclass
class QuestionResponsesMessage:
    """Mensagem para avaliação de question responses"""
    application_id: str
    job_id: str
    company_id: str
    question_responses: List[Dict[str, Any]]
    job_data: Dict[str, Any]
    company_data: Dict[str, Any]
    application_data: Dict[str, Any]
    event_type: str = "MULTIPLE_QUESTION_RESPONSES_CREATED"
    timestamp: Optional[str] = None
    total_responses: Optional[int] = None
```

## Integração com Backend

### Atualização de Scores

O handler chama `BackendService.update_application_scores()` com:

```python
update_result = await BackendService().update_application_scores(
    application_id=application_id,
    question_responses_score=float(question_responses_score),
    evaluation_provider=evaluation_provider,
    evaluation_model=evaluation_model,
    evaluation_details={
        "question_responses_evaluation": {
            "total_responses": total_responses,
            "evaluation_result": evaluation_result,
            "processed_at": datetime.now().isoformat()
        }
    },
    evaluated_at=datetime.now().isoformat()
)
```

## Vantagens

### ✅ **Processamento Automático**
- **Avaliação IA**: Usa IA para avaliar respostas automaticamente
- **Score Inteligente**: Score baseado em análise contextual
- **Atualização Automática**: Atualiza scores no backend automaticamente

### ✅ **Robustez**
- **Error Handling**: Tratamento robusto de erros
- **Timeouts**: Timeouts configurados para evitar travamentos
- **Validação**: Validação de dados de entrada e saída
- **Fallbacks**: Valores padrão para casos de erro

### ✅ **Monitoramento**
- **Logs Detalhados**: Rastreamento completo do processo
- **Métricas**: Informações sobre performance e sucesso
- **Debugging**: Logs específicos para debugging

### ✅ **Configurabilidade**
- **Fila Configurável**: Nome da fila via variável de ambiente
- **URL Configurável**: URL do AI service configurável
- **Timeouts Configuráveis**: Timeouts ajustáveis

## Casos de Uso

1. **Avaliação Automática**: Sistema avalia respostas automaticamente quando criadas
2. **Score em Tempo Real**: Scores atualizados em tempo real
3. **Ranking de Candidatos**: Comparação automática de candidatos
4. **Integração com ATS**: Incorporação em sistemas de recrutamento
5. **Análise de Qualidade**: Identificação de respostas de qualidade

## Próximos Passos

Para melhorar ainda mais o handler:

1. **Métricas**: Adicionar métricas de performance
2. **Retry Logic**: Implementar retry com backoff exponencial
3. **Batch Processing**: Suporte a processamento em lote
4. **Cache**: Cache de avaliações similares
5. **Dead Letter Queue**: Fila para mensagens com falha
