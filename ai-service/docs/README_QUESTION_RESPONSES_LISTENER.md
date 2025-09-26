# Question Responses Listener com QuestionEvaluator

Este documento explica como usar o sistema integrado de avaliação automática de respostas de perguntas usando IA.

## 🎯 Funcionalidade

O `question_responses_listener.py` agora:

1. **Escuta a fila SQS** de respostas de perguntas
2. **Processa mensagens** com respostas de candidatos
3. **Avalia automaticamente** as respostas usando IA (QuestionEvaluator)
4. **Gera scores de 0-100** baseados no alinhamento com a vaga
5. **Salva no banco** na coluna `question_responses_score` da tabela `public.applications`

## 🏗️ Arquitetura

```
SQS Queue → Question Responses Listener → QuestionEvaluator → Database
    ↓              ↓                        ↓              ↓
Mensagens    Processamento           Avaliação IA    Score salvo
```

## 📋 Pré-requisitos

### 1. Configurações de Ambiente
Configure as seguintes variáveis no arquivo `.env`:

```bash
# Fila SQS para respostas de perguntas
QUESTION_RESPONSES_SQS_QUEUE_NAME=question-responses-queue

# Configurações de IA
AI_PROVIDER=openai  # ou anthropic
OPENAI_API_KEY=sua-chave-openai-aqui
# ANTHROPIC_API_KEY=sua-chave-anthropic-aqui

# Configurações de banco
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=cognitive_ats

# Configurações SQS
STORAGE_SERVICE_ENDPOINT=http://localhost:4566  # Para LocalStack
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_REGION=us-east-1
```

### 2. Banco de Dados
A tabela `public.applications` deve ter as seguintes colunas:

```sql
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS question_responses_score DECIMAL(5,2);
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS evaluation_provider VARCHAR(50);
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS evaluation_model VARCHAR(100);
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS evaluation_details JSONB;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS evaluated_at TIMESTAMP;
```

### 3. Fila SQS
Crie a fila `question-responses-queue` no LocalStack ou AWS:

```bash
# LocalStack
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name question-responses-queue

# AWS
aws sqs create-queue --queue-name question-responses-queue
```

## 🚀 Como Usar

### 1. Executar o Listener

```bash
# No container
docker compose exec ai-service python consumer/question_responses_listener.py

# Ou localmente
python consumer/question_responses_listener.py
```

### 2. Enviar Mensagem de Teste

```bash
# Enviar mensagem de teste para a fila
python testar_question_responses_listener.py
```

### 3. Verificar Logs

O listener mostrará logs detalhados:

```
🧠 Iniciando avaliação de 3 respostas usando IA
📋 Avaliando respostas para vaga: Desenvolvedor Python Senior
✅ Avaliação concluída - Score: 85/100

💾 SALVANDO SCORE NO BANCO...
✅ Score salvo com sucesso na application app_test_123
   Score: 85/100
   Provider: openai
   Model: gpt-4
```

## 📊 Formato da Mensagem SQS

### Estrutura Esperada

```json
{
  "eventType": "QUESTION_RESPONSES_RECEIVED",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "questionResponseId": "qr_123456789",
    "applicationId": "app_987654321",
    "jobId": "job_456789123",
    "companyId": "comp_789123456",
    "totalResponses": 3,
    "responses": [
      {
        "jobQuestionId": "q_001",
        "question": "Pergunta aqui?",
        "answer": "Resposta do candidato",
        "createdAt": "2024-01-15T10:25:00Z"
      }
    ]
  },
  "job": {
    "title": "Título da Vaga",
    "description": "Descrição da vaga",
    "requirements": "Requisitos da vaga"
  },
  "company": {
    "name": "Nome da Empresa"
  },
  "application": {
    "firstName": "Nome",
    "lastName": "Sobrenome",
    "email": "email@exemplo.com"
  }
}
```

### Campos Obrigatórios

- `data.applicationId`: ID da application para salvar o score
- `data.responses`: Array com perguntas e respostas
- `job.title`, `job.description`, `job.requirements`: Dados da vaga para avaliação

## 🧠 Processo de Avaliação

### 1. Recebimento da Mensagem
- Listener recebe mensagem da fila SQS
- Valida estrutura da mensagem
- Extrai dados de application, vaga e respostas

### 2. Avaliação com IA
- Cria instância do QuestionEvaluator
- Prepara dados para avaliação
- Chama serviço de IA (OpenAI/Anthropic)
- Processa resposta e extrai score

### 3. Salvamento no Banco
- Atualiza coluna `question_responses_score`
- Salva metadados da avaliação (provider, model, details)
- Atualiza timestamps

### 4. Limpeza da Fila
- Deleta mensagem processada da fila SQS
- Logs de sucesso/erro

## 📈 Score Gerado

O sistema gera um score de **0 a 100** baseado em:

- **Relevância** da resposta à pergunta
- **Especificidade** e detalhamento
- **Alinhamento** com requisitos da vaga
- **Clareza** e estrutura da resposta
- **Profundidade** do conhecimento demonstrado

### Critérios de Pontuação

- **90-100**: Resposta excepcional
- **80-89**: Resposta muito boa
- **70-79**: Resposta boa
- **60-69**: Resposta satisfatória
- **50-59**: Resposta mediana
- **40-49**: Resposta abaixo da média
- **30-39**: Resposta ruim
- **20-29**: Resposta muito ruim
- **10-19**: Resposta extremamente ruim
- **0-9**: Resposta inaceitável

## 🔧 Configurações de IA

### Temperature
- **Recomendado**: 0.3 (baixa temperatura)
- **Motivo**: Avaliações mais consistentes e objetivas

### Modelos Suportados
- **OpenAI**: GPT-4, GPT-3.5-turbo
- **Anthropic**: Claude-3, Claude-2

### Timeout
- **Padrão**: 30 segundos
- **Configurável**: Via variável `REQUEST_TIMEOUT`

## 🚨 Tratamento de Erros

### Erros de IA
- Score padrão: 50/100
- Logs detalhados do erro
- Continua processamento de outras mensagens

### Erros de Banco
- Logs de erro detalhados
- Mensagem não é deletada da fila
- Retry automático na próxima execução

### Erros de SQS
- Pausa de 5 segundos em caso de erro
- Continua tentando processar mensagens

## 📝 Logs e Monitoramento

### Níveis de Log
- **INFO**: Processamento normal
- **WARNING**: Configurações ausentes
- **ERROR**: Erros de processamento

### Informações Logadas
- Recebimento de mensagens
- Processamento de respostas
- Scores gerados
- Salvamento no banco
- Erros e exceções

## 🧪 Testes

### 1. Teste Unitário
```bash
python test_question_evaluator.py
```

### 2. Teste de Integração
```bash
# Terminal 1: Executar listener
python consumer/question_responses_listener.py

# Terminal 2: Enviar mensagem de teste
python testar_question_responses_listener.py
```

### 3. Verificar Banco
```sql
SELECT 
    id, 
    question_responses_score, 
    evaluation_provider, 
    evaluation_model,
    evaluated_at
FROM public.applications 
WHERE question_responses_score IS NOT NULL;
```

## 🔄 Fluxo Completo

1. **Candidato responde perguntas** no sistema
2. **Sistema envia mensagem** para fila SQS
3. **Listener processa mensagem** automaticamente
4. **QuestionEvaluator analisa** respostas com IA
5. **Score é calculado** (0-100)
6. **Resultado é salvo** no banco de dados
7. **Mensagem é removida** da fila
8. **Logs são gerados** para auditoria

## 📚 Arquivos Relacionados

- `consumer/question_responses_listener.py` - Listener principal
- `core/question_evaluator/` - Core de avaliação
- `consumer/services/database_service.py` - Serviço de banco
- `consumer/services/applications_service.py` - Serviço de applications
- `testar_question_responses_listener.py` - Script de teste
- `exemplo_mensagem_question_responses.json` - Exemplo de mensagem

## 🆘 Troubleshooting

### Problema: "API key não configurada"
**Solução**: Configure `OPENAI_API_KEY` ou `ANTHROPIC_API_KEY` no `.env`

### Problema: "Erro ao conectar ao banco"
**Solução**: Verifique configurações `DB_*` no `.env` e se o PostgreSQL está rodando

### Problema: "Fila não encontrada"
**Solução**: Execute `setup-localstack.sh` ou crie a fila manualmente

### Problema: "Score não salvo"
**Solução**: Verifique logs de erro e se a tabela tem as colunas necessárias

## 🎉 Benefícios

- **Automatização completa** da avaliação
- **Consistência** nos critérios de avaliação
- **Escalabilidade** para múltiplas candidaturas
- **Auditoria completa** com logs e metadados
- **Integração nativa** com sistema existente
- **Configuração flexível** de providers de IA
