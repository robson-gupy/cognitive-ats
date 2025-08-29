# Endpoint de Avaliação de Candidatos com AI

Este endpoint permite avaliar automaticamente um candidato usando o AI Service, coletando todos os dados necessários da aplicação e retornando os scores de avaliação.

## Endpoint

```
POST /jobs/:jobId/applications/:id/evaluate-with-ai
```

## Autenticação

- **Guards**: `JwtAuthGuard`, `AdminAuthGuard`
- **Permissões**: Apenas usuários autenticados com perfil de administrador da empresa

## Parâmetros de URL

- `jobId`: ID da vaga (UUID)
- `id`: ID da aplicação/candidato (UUID)

## Corpo da Requisição (Body)

```json
{
  "provider": "openai",           // Opcional: Provider de IA (openai, anthropic)
  "api_key": "sua-api-key",      // Opcional: API key personalizada
  "model": "gpt-4"               // Opcional: Modelo específico
}
```

### Campos Opcionais

- `provider`: Provider de IA a ser usado
  - `openai`: OpenAI (padrão)
  - `anthropic`: Anthropic Claude
- `api_key`: API key personalizada para o provider
- `model`: Modelo específico a ser usado
  - OpenAI: `gpt-4`, `gpt-3.5-turbo`, etc.
  - Anthropic: `claude-3-sonnet-20240229`, etc.

## Funcionamento

1. **Coleta de Dados**: O endpoint coleta automaticamente:
   - Dados do currículo (formação, experiência, idiomas, conquistas)
   - Dados da vaga (título, descrição, requisitos)
   - Respostas das perguntas da vaga

2. **Formatação**: Converte os dados para o formato esperado pelo AI Service

3. **Avaliação**: Envia os dados para o AI Service que retorna:
   - Score geral (overall_score)
   - Score das respostas (question_responses_score)
   - Score da formação (education_score)
   - Score da experiência (experience_score)

4. **Atualização**: Salva os resultados na aplicação

## Resposta

Retorna a aplicação atualizada com os scores de avaliação:

```json
{
  "id": "uuid-da-aplicacao",
  "firstName": "João",
  "lastName": "Silva",
  "email": "joao@email.com",
  "overallScore": 85,
  "questionResponsesScore": 90,
  "educationScore": 95,
  "experienceScore": 80,
  "evaluationProvider": "openai",
  "evaluationModel": "gpt-4",
  "evaluatedAt": "2024-01-15T10:30:00.000Z",
  "evaluationDetails": {
    "overall_score": 85,
    "question_responses_score": 90,
    "education_score": 95,
    "experience_score": 80
  }
}
```

## Exemplo de Uso

### cURL
```bash
curl -X POST \
  http://localhost:3000/jobs/123e4567-e89b-12d3-a456-426614174000/applications/987fcdeb-51a2-43d1-9f12-345678901234/evaluate-with-ai \
  -H "Authorization: Bearer seu-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "model": "gpt-4"
  }'
```

### JavaScript/TypeScript
```typescript
const response = await fetch(
  `/jobs/${jobId}/applications/${applicationId}/evaluate-with-ai`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      provider: 'openai',
      model: 'gpt-4'
    })
  }
);

const result = await response.json();
console.log('Score geral:', result.overallScore);
```

## Campos Coletados Automaticamente

### Currículo
- **Informações Pessoais**: Nome, email, telefone
- **Formação Acadêmica**: Curso, instituição, ano, descrição
- **Experiência Profissional**: Cargo, empresa, período, descrição
- **Idiomas**: Idioma e nível de proficiência
- **Conquistas**: Títulos das conquistas

### Vaga
- **Título**: Nome da vaga
- **Descrição**: Descrição completa da vaga
- **Requisitos**: Requisitos da vaga

### Respostas das Perguntas
- **Pergunta**: Texto da pergunta
- **Resposta**: Resposta do candidato

## Tratamento de Erros

- **404**: Aplicação não encontrada
- **400**: Currículo não encontrado para a aplicação
- **401**: Não autenticado
- **403**: Sem permissão de administrador
- **500**: Erro interno do servidor ou erro do AI Service

## Dependências

- **AI Service**: Deve estar rodando e acessível
- **Banco de Dados**: Todas as entidades relacionadas devem existir
- **Autenticação**: Sistema de JWT configurado

## Configuração

### Variáveis de Ambiente
```bash
AI_SERVICE_URL=http://ai-service:8000  # URL do AI Service
```

### Módulos Necessários
- `ApplicationsModule`
- `SharedModule` (para `AiServiceClient`)
- `AuthModule` (para autenticação)
