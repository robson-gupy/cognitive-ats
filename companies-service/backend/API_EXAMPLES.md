# Exemplos de Uso da API

## Endpoints Públicos

### Listar Vagas Publicadas de uma Empresa

**Endpoint:** `GET /jobs/company/:companyId/published`

**Descrição:** Retorna todas as vagas publicadas de uma empresa específica. Este endpoint não requer autenticação.

**Parâmetros:**
- `companyId` (string, obrigatório): ID da empresa

**Exemplo de uso:**

```bash
curl -X GET "http://localhost:3000/jobs/company/123e4567-e89b-12d3-a456-426614174000/published"
```

**Resposta de exemplo:**

```json
[
  {
    "id": "456e7890-e89b-12d3-a456-426614174001",
    "title": "Desenvolvedor Full Stack",
    "description": "Estamos procurando um desenvolvedor full stack experiente...",
    "requirements": "Conhecimento em React, Node.js, TypeScript...",
    "expirationDate": "2024-12-31",
    "status": "PUBLISHED",
    "departmentId": "789e0123-e89b-12d3-a456-426614174002",
    "slug": "desenvolvedor-full-stack",
    "department": {
      "id": "789e0123-e89b-12d3-a456-426614174002",
      "name": "Tecnologia",
      "description": "Departamento de Tecnologia"
    }
  }
]
```

**Características do endpoint:**
- ✅ **Público**: Não requer autenticação
- ✅ **Filtrado**: Retorna apenas vagas com status `PUBLISHED`
- ✅ **Ordenado**: Vagas ordenadas por data de publicação (mais recentes primeiro)
- ✅ **Relacionamentos**: Inclui dados do departamento
- ✅ **Seguro**: Não expõe informações sensíveis como logs, dados de usuários ou informações da empresa
- ✅ **Otimizado**: Retorna apenas campos essenciais para visualização pública

## Endpoints Autenticados

### Listar Todas as Vagas (Admin)

**Endpoint:** `GET /jobs`

**Descrição:** Retorna todas as vagas da empresa do usuário autenticado (apenas para administradores).

**Headers necessários:**
```
Authorization: Bearer <jwt_token>
```

**Exemplo de uso:**

```bash
curl -X GET "http://localhost:3000/jobs" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Criar Nova Vaga

**Endpoint:** `POST /jobs`

**Descrição:** Cria uma nova vaga (apenas para administradores).

**Exemplo de uso:**

```bash
curl -X POST "http://localhost:3000/jobs" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{
    "title": "Nova Vaga",
    "description": "Descrição da vaga",
    "requirements": "Requisitos da vaga",
    "status": "DRAFT",
    "departmentId": "789e0123-e89b-12d3-a456-426614174002"
  }'
```

### Publicar Vaga

**Endpoint:** `POST /jobs/:id/publish`

**Descrição:** Publica uma vaga que está em rascunho (apenas para administradores).

**Exemplo de uso:**

```bash
curl -X POST "http://localhost:3000/jobs/456e7890-e89b-12d3-a456-426614174001/publish" \
  -H "Authorization: Bearer <jwt_token>"
```

## Status das Vagas

- `DRAFT`: Vaga em rascunho (não visível publicamente)
- `PUBLISHED`: Vaga publicada (visível no endpoint público)
- `CLOSED`: Vaga fechada (não aceita mais candidaturas)
- `PAUSED`: Vaga pausada (temporariamente indisponível) 