# Endpoint Público de Vagas

## Visão Geral

Este endpoint permite listar vagas publicadas de uma empresa específica de forma pública, sem necessidade de autenticação.

## Endpoint

```
GET /public/{companyId}/jobs
```

### Parâmetros

- `companyId` (string, obrigatório): UUID da empresa

### Exemplo de Uso

```bash
curl -X GET "http://localhost:3000/public/123e4567-e89b-12d3-a456-426614174000/jobs"
```

## Resposta

### Sucesso (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "job-uuid-1",
      "title": "Desenvolvedor Full Stack",
      "description": "Vaga para desenvolvedor full stack com experiência em React e Node.js",
      "requirements": "React, Node.js, PostgreSQL, 3+ anos de experiência",
      "expirationDate": "2024-12-31",
      "status": "PUBLISHED",
      "departmentId": "dept-uuid-1",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z",
      "department": {
        "id": "dept-uuid-1",
        "name": "Tecnologia",
        "description": "Departamento de tecnologia"
      }
    }
  ],
  "total": 1,
  "companyId": "123e4567-e89b-12d3-a456-426614174000",
  "message": "Vagas encontradas com sucesso"
}
```

### Erro - Empresa não encontrada (404)

```json
{
  "statusCode": 404,
  "message": "Empresa com ID 123e4567-e89b-12d3-a456-426614174000 não encontrada",
  "error": "Not Found"
}
```

### Erro - ID inválido (400)

```json
{
  "statusCode": 400,
  "message": "ID da empresa inválido",
  "error": "Bad Request"
}
```

## Características

- **Sem autenticação**: Endpoint totalmente público
- **Validação de UUID**: Verifica se o ID da empresa é um UUID válido
- **Verificação de existência**: Confirma se a empresa existe antes de buscar vagas
- **Filtro automático**: Retorna apenas vagas com status "PUBLISHED"
- **Ordenação**: Vagas ordenadas por data de publicação (mais recentes primeiro)
- **Informações do departamento**: Inclui dados do departamento quando disponível

## Segurança

- Endpoint não expõe informações sensíveis
- Retorna apenas vagas publicadas (status = PUBLISHED)
- Validação de entrada para prevenir injeção de SQL
- Não requer tokens de autenticação

## Uso em Frontend

```typescript
// Exemplo de uso em React/TypeScript
const fetchPublicJobs = async (companyId: string) => {
  try {
    const response = await fetch(`/public/${companyId}/jobs`);
    if (!response.ok) {
      throw new Error('Erro ao buscar vagas');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro:', error);
    throw error;
  }
};
```

## Notas Técnicas

- Endpoint implementado em `PublicJobsController`
- Utiliza `JobsService.findPublishedJobsByCompany()` para buscar vagas
- Validação de empresa através de `CompaniesService.findOne()`
- Resposta padronizada com DTOs específicos
- Testes unitários incluídos
