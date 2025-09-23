# API de Comunicação Interna - Applications (Scores)

Este controller foi criado para permitir comunicação interna entre sistemas, focado especificamente na atualização de scores de avaliação, sem necessidade de autenticação.

## Endpoint

### PATCH /internal/applications/:id

Atualiza scores de avaliação de uma application sem autenticação.

**Parâmetros:**
- `id` (string): ID da application a ser atualizada

**Body (JSON):**
```json
{
  "aiScore": 85.5,
  "overallScore": 90.0,
  "questionResponsesScore": 88.0,
  "educationScore": 92.0,
  "experienceScore": 75.0,
  "evaluationProvider": "openai",
  "evaluationModel": "gpt-4",
  "evaluationDetails": {
    "overall_score": 90.0,
    "question_responses_score": 88.0,
    "education_score": 92.0,
    "experience_score": 75.0,
    "provider": "openai",
    "model": "gpt-4"
  },
  "evaluatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Resposta:**
- **200 OK**: Application atualizada com sucesso
- **404 Not Found**: Application não encontrada
- **400 Bad Request**: Dados inválidos

## Exemplos de Uso

### Atualizar apenas o score de IA
```bash
curl -X PATCH http://localhost:3000/internal/applications/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{"aiScore": 92.5}'
```

### Atualizar múltiplos scores de avaliação
```bash
curl -X PATCH http://localhost:3000/internal/applications/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{
    "aiScore": 85.5,
    "overallScore": 90.0,
    "educationScore": 92.0,
    "experienceScore": 75.0,
    "questionResponsesScore": 88.0
  }'
```

### Atualizar informações de avaliação completas
```bash
curl -X PATCH http://localhost:3000/internal/applications/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{
    "aiScore": 85.5,
    "overallScore": 90.0,
    "educationScore": 92.0,
    "experienceScore": 75.0,
    "questionResponsesScore": 88.0,
    "evaluationProvider": "openai",
    "evaluationModel": "gpt-4",
    "evaluationDetails": {
      "overall_score": 90.0,
      "education_score": 92.0,
      "experience_score": 75.0,
      "provider": "openai",
      "model": "gpt-4"
    },
    "evaluatedAt": "2024-01-15T10:30:00.000Z"
  }'
```

### Atualizar apenas scores específicos
```bash
curl -X PATCH http://localhost:3000/internal/applications/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{
    "educationScore": 95.0,
    "experienceScore": 80.0
  }'
```

## Características

- **Sem Autenticação**: Não requer token ou credenciais
- **Focado em Scores**: Especializado apenas para atualização de scores de avaliação
- **Patch Parcial**: Atualiza apenas os campos enviados
- **Validação Robusta**: Validação completa com class-validator
- **Logging**: Registra todas as atualizações no log do sistema
- **Tipagem Forte**: TypeScript com tipos bem definidos
- **Performance**: Otimizado para operações de atualização de scores

## Campos Suportados

### Scores de Avaliação
- `aiScore` (number) - Score geral de IA
- `overallScore` (number) - Score geral da avaliação
- `questionResponsesScore` (number) - Score das respostas às perguntas
- `educationScore` (number) - Score de educação/formação
- `experienceScore` (number) - Score de experiência profissional

### Informações de Avaliação
- `evaluationProvider` (string, max 50) - Provedor da avaliação (ex: "openai", "anthropic")
- `evaluationModel` (string, max 100) - Modelo usado (ex: "gpt-4", "claude-3")
- `evaluationDetails` (object) - Detalhes completos da avaliação
- `evaluatedAt` (ISO date string) - Data/hora da avaliação

## Segurança

⚠️ **ATENÇÃO**: Este endpoint é destinado apenas para comunicação interna entre sistemas. Certifique-se de que:

1. O endpoint esteja protegido por firewall/VPN interno
2. Apenas sistemas internos tenham acesso
3. Monitore o uso através dos logs
4. Considere implementar autenticação por IP ou API key se necessário
