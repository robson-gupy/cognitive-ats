# Campo AI Score para Applications

## Visão Geral

Foi adicionado um novo campo `aiScore` na tabela `applications` para armazenar scores gerados por IA para avaliação de candidaturas.

## Estrutura do Campo

- **Nome**: `ai_score`
- **Tipo**: `DECIMAL(5,2)` - permite valores de 0.00 a 100.00
- **Nullable**: Sim - o campo pode ser nulo
- **Descrição**: Score gerado pela IA para avaliação da candidatura (0.00 a 100.00)

## Migração

A migração `1754406855088-AddAiScoreToApplications.ts` foi criada para adicionar o campo ao banco de dados.

### Executar a migração:

```bash
cd companies-service/backend
npm run migration:run
```

## API Endpoints

### Atualizar Score da IA

**PATCH** `/applications/:id/ai-score`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "aiScore": 85.5
}
```

**Resposta:**
```json
{
  "id": "application-uuid",
  "jobId": "job-uuid",
  "companyId": "company-uuid",
  "firstName": "João",
  "lastName": "Silva",
  "email": "joao@email.com",
  "phone": null,
  "aiScore": 85.5,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:35:00.000Z"
}
```

## Validações

- O score deve ser um número entre 0 e 100
- O campo é opcional (pode ser nulo)
- Apenas usuários autenticados com permissão de admin podem atualizar o score

## Uso com IA

Este campo pode ser usado para:

1. **Integração com serviços de IA** que analisam currículos e perfis
2. **Ranking automático** de candidatos baseado no score
3. **Filtros inteligentes** para priorizar candidatos com scores mais altos
4. **Relatórios analíticos** sobre a qualidade das candidaturas

## Exemplo de Integração

```typescript
// Exemplo de como um serviço de IA pode atualizar o score
const updateAiScore = async (applicationId: string, score: number) => {
  const response = await fetch(`/api/applications/${applicationId}/ai-score`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ aiScore: score })
  });
  
  return response.json();
};
```

## Testes

Os testes unitários foram atualizados para cobrir o novo método `updateAiScore` no service.

Para executar os testes:

```bash
npm run test applications.service.spec.ts
``` 