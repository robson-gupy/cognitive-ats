# Endpoint Público de Vagas

## Visão Geral

Este endpoint permite listar vagas publicadas de uma empresa específica de forma pública, sem necessidade de autenticação.

## Endpoints

### Listar Vagas de uma Empresa

```
GET /public/{companySlug}/jobs
```

#### Parâmetros

- `companySlug` (string, obrigatório): Slug da empresa (identificador legível)

### Buscar Vaga Específica

```
GET /public/{companySlug}/jobs/{jobSlug}
```

#### Parâmetros

- `companySlug` (string, obrigatório): Slug da empresa (identificador legível)
- `jobSlug` (string, obrigatório): Slug da vaga (identificador legível)

### Exemplos de Uso

#### Listar Vagas de uma Empresa

```bash
curl -X GET "http://localhost:3000/public/gupy/jobs"
```

#### Buscar Vaga Específica

```bash
curl -X GET "http://localhost:3000/public/gupy/jobs/desenvolvedor-full-stack"
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
      "slug": "desenvolvedor-full-stack",
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

### Erro - Slug inválido (400)

```json
{
  "statusCode": 400,
  "message": "Slug da empresa inválido",
  "error": "Bad Request"
}
```

## Características

- **Sem autenticação**: Endpoints totalmente públicos
- **Validação de slug**: Verifica se os slugs da empresa e vaga são válidos (apenas letras, números e hífens)
- **Verificação de existência**: Confirma se a empresa e vaga existem antes de retornar dados
- **Filtro automático**: Retorna apenas vagas com status "PUBLISHED"
- **Ordenação**: Vagas ordenadas por data de publicação (mais recentes primeiro)
- **Informações do departamento**: Inclui dados do departamento quando disponível
- **URLs amigáveis**: Uso de slugs para identificação legível de empresas e vagas

## Segurança

- Endpoint não expõe informações sensíveis
- Retorna apenas vagas publicadas (status = PUBLISHED)
- Validação de entrada para prevenir injeção de SQL
- Não requer tokens de autenticação
- Validação de slug para prevenir caracteres maliciosos

## Uso em Frontend

```typescript
// Exemplo de uso em React/TypeScript

// Buscar todas as vagas de uma empresa
const fetchPublicJobs = async (companySlug: string) => {
  try {
    const response = await fetch(`/public/${companySlug}/jobs`);
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

// Buscar uma vaga específica
const fetchPublicJob = async (companySlug: string, jobSlug: string) => {
  try {
    const response = await fetch(`/public/${companySlug}/jobs/${jobSlug}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar vaga');
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

- Endpoints implementados em `PublicJobsController`
- `findPublicJobsByCompany()`: Utiliza `JobsService.findPublishedJobsByCompany()` para buscar vagas
- `findPublicJobBySlug()`: Utiliza `JobsService.findPublicJobBySlug()` para buscar vaga específica
- Validação de empresa através de `CompaniesService.findBySlug()`
- Validação de vaga através de `JobsService.findPublicJobBySlug()`
- Resposta padronizada com DTOs específicos
- Testes unitários incluídos
- Suporte a slug para URLs mais amigáveis
- Compatibilidade mantida com endpoint existente usando ID da vaga
