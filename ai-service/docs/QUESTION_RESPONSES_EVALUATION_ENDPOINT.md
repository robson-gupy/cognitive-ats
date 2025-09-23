# Endpoint de Avaliação de Question Responses

Este documento descreve o novo endpoint criado no ai-service para avaliação de respostas de perguntas usando IA.

## Endpoint

### POST `/question-responses/evaluate`

Avalia as respostas de perguntas de candidatos usando IA para gerar um score de 0 a 100.

## Estrutura da Requisição

### Request Body (`QuestionEvaluationRequest`)

```json
{
  "question_responses": [
    {
      "question": "Descreva sua experiência com React",
      "answer": "Tenho 3 anos de experiência desenvolvendo aplicações React..."
    },
    {
      "question": "Como você lida com bugs em produção?",
      "answer": "Primeiro analiso os logs, depois reproduzo o problema localmente..."
    }
  ],
  "job_data": {
    "title": "Desenvolvedor Frontend Senior",
    "description": "Vaga para desenvolvedor frontend com foco em React e TypeScript",
    "requirements": [
      "Experiência com React",
      "Conhecimento em TypeScript",
      "Experiência com testes automatizados"
    ],
    "responsibilities": [
      "Desenvolver interfaces de usuário",
      "Colaborar com equipe de design",
      "Escrever testes unitários"
    ],
    "education_required": "Ensino Superior em Ciência da Computação ou área relacionada",
    "experience_required": "3+ anos de experiência em desenvolvimento frontend",
    "skills_required": [
      "React",
      "TypeScript",
      "JavaScript",
      "CSS",
      "HTML"
    ]
  }
}
```

### Campos da Requisição

#### `question_responses` (List[QuestionResponse])
- **question** (string): A pergunta feita ao candidato
- **answer** (string): A resposta fornecida pelo candidato

#### `job_data` (JobData)
- **title** (string): Título da vaga
- **description** (string): Descrição da vaga
- **requirements** (List[string], opcional): Lista de requisitos
- **responsibilities** (List[string], opcional): Lista de responsabilidades
- **education_required** (string, opcional): Educação necessária
- **experience_required** (string, opcional): Experiência necessária
- **skills_required** (List[string], opcional): Lista de habilidades necessárias

## Estrutura da Resposta

### Response Body (`QuestionEvaluationResponse`)

```json
{
  "score": 85,
  "details": {
    "technical_knowledge": 90,
    "communication": 80,
    "problem_solving": 85,
    "experience_relevance": 85
  },
  "feedback": "O candidato demonstra boa compreensão técnica e experiência relevante. As respostas são claras e mostram conhecimento prático das tecnologias mencionadas.",
  "improvement_areas": [
    "Poderia fornecer mais detalhes sobre metodologias de teste",
    "Seria interessante ver mais exemplos de projetos anteriores"
  ],
  "evaluated_at": "2024-01-15T10:30:00.000Z",
  "provider": "openai",
  "model": "gpt-4"
}
```

### Campos da Resposta

#### `score` (int)
- Score geral de 0 a 100 baseado na qualidade das respostas

#### `details` (Dict[str, Any])
- Detalhamento do score por diferentes critérios de avaliação

#### `feedback` (string)
- Feedback textual sobre as respostas do candidato

#### `improvement_areas` (List[string])
- Lista de áreas onde o candidato pode melhorar

#### `evaluated_at` (string)
- Timestamp ISO da avaliação

#### `provider` (string)
- Provider de IA usado para a avaliação

#### `model` (string)
- Modelo de IA usado para a avaliação

## Configuração

### Variáveis de Ambiente

O endpoint usa as seguintes variáveis de ambiente para configuração:

- **EVALUATION_PROVIDER**: Provider de IA para avaliação (padrão: `openai`)
- **EVALUATION_MODEL**: Modelo de IA para avaliação (padrão: `gpt-4`)

### Fallback

Se as variáveis de ambiente não estiverem definidas, o sistema usa:
- Provider: `Config.DEFAULT_AI_PROVIDER` (geralmente `openai`)
- Modelo: `Config.DEFAULT_MODEL` (geralmente `gpt-4`)

## Exemplo de Uso

### cURL

```bash
curl -X POST "http://localhost:8000/question-responses/evaluate" \
  -H "Content-Type: application/json" \
  -d '{
    "question_responses": [
      {
        "question": "Descreva sua experiência com React",
        "answer": "Tenho 3 anos de experiência desenvolvendo aplicações React com hooks, context API e Redux."
      },
      {
        "question": "Como você testa seus componentes React?",
        "answer": "Uso Jest e React Testing Library para testes unitários e de integração."
      }
    ],
    "job_data": {
      "title": "Desenvolvedor Frontend",
      "description": "Desenvolvimento de interfaces de usuário com React",
      "requirements": ["React", "JavaScript", "CSS"],
      "responsibilities": ["Desenvolver componentes", "Escrever testes"],
      "education_required": "Ensino Superior",
      "experience_required": "2+ anos",
      "skills_required": ["React", "JavaScript", "CSS"]
    }
  }'
```

### Python

```python
import requests
import json

url = "http://localhost:8000/question-responses/evaluate"

payload = {
    "question_responses": [
        {
            "question": "Descreva sua experiência com React",
            "answer": "Tenho 3 anos de experiência desenvolvendo aplicações React..."
        }
    ],
    "job_data": {
        "title": "Desenvolvedor Frontend",
        "description": "Desenvolvimento de interfaces de usuário",
        "requirements": ["React", "JavaScript"],
        "responsibilities": ["Desenvolver componentes"],
        "education_required": "Ensino Superior",
        "experience_required": "2+ anos",
        "skills_required": ["React", "JavaScript"]
    }
}

response = requests.post(url, json=payload)
result = response.json()

print(f"Score: {result['score']}/100")
print(f"Feedback: {result['feedback']}")
```

## Códigos de Status HTTP

- **200**: Avaliação realizada com sucesso
- **422**: Erro de validação dos dados da requisição
- **500**: Erro interno do servidor

## Logs

O endpoint gera logs detalhados para monitoramento:

```
INFO - 🎯 Recebida requisição para avaliação de question responses
INFO - 💼 Vaga: Desenvolvedor Frontend
INFO - ❓ Número de respostas: 2
INFO - 🔧 Usando provider para avaliação: openai
INFO - 🤖 Usando modelo para avaliação: gpt-4
INFO - 📊 Iniciando avaliação de 2 respostas
INFO - ✅ Avaliação de question responses concluída com sucesso
INFO - 📊 Score final: 85/100
INFO - 🔧 Configuração usada: openai + gpt-4
INFO - 📤 Enviando resposta para o cliente
```

## Integração com QuestionEvaluator

O endpoint utiliza a classe `QuestionEvaluator` do módulo `core.question_evaluator.question_evaluator`:

```python
from core.question_evaluator.question_evaluator import QuestionEvaluator

# Criar instância do QuestionEvaluator
question_evaluator = QuestionEvaluator(ai_service)

# Avaliar as respostas
evaluation_result = await question_evaluator.evaluate_question_responses(
    question_responses=question_responses_list,
    job_data=job_data_dict,
    model=model
)
```

## Health Check

### GET `/question-responses/health`

Endpoint de health check específico para o serviço de question responses:

```json
{
  "status": "healthy",
  "service": "question-responses"
}
```

## Vantagens

### ✅ **Avaliação Inteligente**
- **IA Avançada**: Usa modelos de linguagem para análise contextual
- **Score Detalhado**: Fornece breakdown por diferentes critérios
- **Feedback Construtivo**: Gera feedback útil para candidatos

### ✅ **Configuração Flexível**
- **Providers Múltiplos**: Suporte a diferentes providers de IA
- **Modelos Configuráveis**: Permite escolher o modelo de IA
- **Variáveis de Ambiente**: Configuração via environment variables

### ✅ **Integração Simples**
- **API REST**: Interface HTTP padrão
- **JSON**: Formato de dados simples e universal
- **Documentação**: Swagger/OpenAPI automática

### ✅ **Monitoramento**
- **Logs Detalhados**: Rastreamento completo do processo
- **Health Check**: Verificação de saúde do serviço
- **Error Handling**: Tratamento robusto de erros

## Casos de Uso

1. **Avaliação Automática**: Sistema pode avaliar respostas automaticamente
2. **Ranking de Candidatos**: Comparar candidatos baseado nas respostas
3. **Feedback para Candidatos**: Fornecer insights sobre respostas
4. **Análise de Qualidade**: Identificar pontos fortes e fracos
5. **Integração com ATS**: Incorporar em sistemas de recrutamento

## Próximos Passos

Para melhorar ainda mais o endpoint:

1. **Cache**: Implementar cache para respostas similares
2. **Batch Processing**: Suporte a múltiplas avaliações simultâneas
3. **Customização**: Permitir critérios de avaliação customizados
4. **Métricas**: Adicionar métricas de performance e qualidade
5. **Webhooks**: Notificações assíncronas de conclusão
