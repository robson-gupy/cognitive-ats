# BackendService - Atualização via Endpoint Interno

A função `update_application_scores` foi adaptada para usar o novo endpoint interno `/internal/applications/:id` do companies-service.

## Mudanças Principais

### Antes (Endpoint com autenticação)
```python
# URL antiga (requeria autenticação e job_id)
endpoint_url = f"{self.companies_backend_url}/jobs/{job_id}/applications/{application_id}/evaluation"

# Chamada antiga
update_result = await backend_service.update_application_scores(
    application_id=score_message.application_id,
    job_id=score_message.job_data.get('id'),  # ❌ Parâmetro removido
    overall_score=overall_score,
    education_score=education_score,
    experience_score=experience_score
)
```

### Depois (Endpoint interno sem autenticação)
```python
# URL nova (endpoint interno, sem autenticação)
endpoint_url = f"{self.companies_backend_url}/internal/applications/{application_id}"

# Chamada nova
update_result = await backend_service.update_application_scores(
    application_id=score_message.application_id,  # ✅ Apenas application_id necessário
    overall_score=overall_score,
    education_score=education_score,
    experience_score=experience_score,
    question_responses_score=question_responses_score,  # ✅ Novo parâmetro
    ai_score=ai_score,                                 # ✅ Novo parâmetro
    evaluation_provider="openai",                      # ✅ Novo parâmetro
    evaluation_model="gpt-4",                         # ✅ Novo parâmetro
    evaluation_details=evaluation_details,            # ✅ Novo parâmetro
    evaluated_at="2024-01-15T10:30:00.000Z"          # ✅ Novo parâmetro
)
```

## Novos Parâmetros Disponíveis

A função agora suporta todos os campos do endpoint interno:

```python
await backend_service.update_application_scores(
    application_id="d3d424aa-67d2-443f-99fa-708440b41a4c",
    ai_score=85.5,                    # Score geral de IA
    overall_score=90.0,               # Score geral da avaliação
    education_score=92.0,             # Score de educação
    experience_score=75.5,            # Score de experiência
    question_responses_score=55.0,    # Score das respostas às perguntas
    evaluation_provider="openai",     # Provedor da avaliação
    evaluation_model="gpt-4",         # Modelo usado
    evaluation_details={              # Detalhes completos da avaliação
        "overall_score": 90.0,
        "education_score": 92.0,
        "experience_score": 75.5,
        "provider": "openai",
        "model": "gpt-4"
    },
    evaluated_at="2024-01-15T10:30:00.000Z"  # Data/hora da avaliação
)
```

## Exemplo Baseado no Curl Fornecido

Baseado no exemplo curl fornecido:

```bash
curl --request PATCH \
  --url http://localhost:3000/internal/applications/d3d424aa-67d2-443f-99fa-708440b41a4c \
  --header 'content-type: application/json' \
  --data '{
  "aiScore": 85.5,
  "overallScore": 90,
  "educationScore": 92,
  "experienceScore": 75.5,
  "questionResponsesScore": 55,
  "evaluatedAt": "2024-01-15T10:30:00.000Z"
}'
```

### Equivalente em Python:

```python
from datetime import datetime

# Gerar timestamp atual em formato ISO
evaluated_at = datetime.now().isoformat() + "Z"

update_result = await backend_service.update_application_scores(
    application_id="d3d424aa-67d2-443f-99fa-708440b41a4c",
    ai_score=85.5,
    overall_score=90.0,
    education_score=92.0,
    experience_score=75.5,
    question_responses_score=55.0,
    evaluated_at=evaluated_at
)

if update_result.get('success'):
    print("✅ Scores atualizados com sucesso!")
    print(f"Response: {update_result.get('response')}")
else:
    print(f"❌ Erro: {update_result.get('error')}")
```

## Vantagens da Nova Implementação

### ✅ Simplificação
- **Removido parâmetro `job_id`**: Não é mais necessário
- **URL mais simples**: `/internal/applications/:id` vs `/jobs/:jobId/applications/:id/evaluation`

### ✅ Sem Autenticação
- **Endpoint interno**: Não requer token JWT
- **Comunicação direta**: Entre sistemas internos

### ✅ Mais Flexível
- **Novos campos**: Suporte a todos os campos de avaliação
- **Campos opcionais**: Todos os parâmetros são opcionais
- **Update parcial**: Atualiza apenas os campos fornecidos
- **Configurações automáticas**: `evaluationProvider` e `evaluationModel` carregados das variáveis de ambiente
- **Rastreabilidade completa**: Captura provider e model da resposta do AI service e envia para o backend

### ✅ Melhor Performance
- **Timeout otimizado**: Usa `companies_backend_timeout`
- **Logs melhorados**: Mais informações de debug

## Logs Esperados

### No Handler (ai_score.py):
```
📊 Scores calculados application_id=d3d424aa-67d2-443f-99fa-708440b41a4c overall_score=85.5 education_score=92.0 experience_score=75.5
🔧 Configuração de IA usada application_id=d3d424aa-67d2-443f-99fa-708440b41a4c provider=anthropic model=claude-3-sonnet-20240229
💾 Atualizando scores no banco de dados... application_id=d3d424aa-67d2-443f-99fa-708440b41a4c
📤 Enviando provider e model para o backend: anthropic + claude-3-sonnet-20240229
```

### No BackendService:
```
📤 Enviando requisição para atualização de scores via endpoint interno - URL: http://companies-backend:3000/internal/applications/d3d424aa-67d2-443f-99fa-708440b41a4c, Application ID: d3d424aa-67d2-443f-99fa-708440b41a4c
📊 Scores a serem atualizados: {'overallScore': 85.5, 'educationScore': 92.0, 'experienceScore': 75.5, 'evaluationProvider': 'anthropic', 'evaluationModel': 'claude-3-sonnet-20240229'}
🔧 Configurações de avaliação - Provider: anthropic, Model: claude-3-sonnet-20240229
✅ Scores atualizados com sucesso para application d3d424aa-67d2-443f-99fa-708440b41a4c
```

## Variáveis de Ambiente

As configurações de avaliação são carregadas automaticamente das seguintes variáveis de ambiente:

```bash
# Configurações de avaliação
EVALUATION_PROVIDER=openai          # Provedor da avaliação (padrão: "openai")
EVALUATION_MODEL=gpt-4              # Modelo usado (padrão: "gpt-4")
```

### Exemplo de uso com variáveis de ambiente:

```bash
# Definir variáveis de ambiente
export EVALUATION_PROVIDER=anthropic
export EVALUATION_MODEL=claude-3-sonnet

# A função automaticamente usará essas configurações
```

## Compatibilidade

- ✅ **Backward Compatible**: Chamadas existentes continuam funcionando
- ✅ **Novos Parâmetros**: Parâmetros adicionais são opcionais
- ✅ **Mesma Interface**: Assinatura da função mantida (exceto remoção do job_id)
- ✅ **Mesmo Retorno**: Formato de resposta inalterado
- ✅ **Configurações Automáticas**: Provider e Model carregados das variáveis de ambiente
