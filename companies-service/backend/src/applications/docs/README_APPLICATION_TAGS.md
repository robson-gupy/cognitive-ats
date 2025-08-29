# CRUD de ApplicationTags

Este módulo fornece funcionalidades completas para gerenciar a associação entre applications e tags no sistema.

## Funcionalidades

- **Adicionar tag à application**: Cria uma associação entre uma application e uma tag
- **Listar tags de uma application**: Mostra todas as tags associadas a uma application específica
- **Listar applications de uma tag**: Mostra todas as applications que usam uma tag específica
- **Buscar associação específica**: Busca uma associação específica por ID
- **Remover tag de uma application**: Remove uma tag de uma application
- **Resumo de uso de tags**: Estatísticas de quais tags são mais usadas na empresa

## Estrutura da Tabela

A tabela `application_tags` possui os seguintes campos:

- `id`: UUID único da associação
- `application_id`: ID da application
- `tag_id`: ID da tag
- `added_by_user_id`: ID do usuário que adicionou a tag
- `created_at`: Data em que a tag foi adicionada

## Endpoints

### POST /application-tags
Adiciona uma tag a uma application.

**Headers necessários:**
```
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "applicationId": "uuid-da-application",
  "tagId": "uuid-da-tag"
}
```

**Resposta (201):**
```json
{
  "id": "uuid-da-associacao",
  "applicationId": "uuid-da-application",
  "tagId": "uuid-da-tag",
  "addedByUserId": "uuid-do-usuario",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "tag": {
    "id": "uuid-da-tag",
    "label": "Nome da Tag",
    "color": "#FF0000",
    "textColor": "#FFFFFF"
  },
  "application": {
    "id": "uuid-da-application",
    "candidateName": "João Silva",
    "jobTitle": "Desenvolvedor Full Stack"
  },
  "addedByUser": {
    "id": "uuid-do-usuario",
    "firstName": "Maria",
    "lastName": "Santos",
    "email": "maria@empresa.com"
  }
}
```

### GET /application-tags/application/:applicationId
Lista todas as tags de uma application específica.

**Headers necessários:**
```
Authorization: Bearer <jwt_token>
```

**Resposta (200):**
```json
[
  {
    "id": "uuid-da-associacao-1",
    "applicationId": "uuid-da-application",
    "tagId": "uuid-da-tag-1",
    "addedByUserId": "uuid-do-usuario",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "tag": {
      "id": "uuid-da-tag-1",
      "label": "Candidato Promissor",
      "color": "#10B981",
      "textColor": "#FFFFFF"
    },
    "addedByUser": {
      "id": "uuid-do-usuario",
      "firstName": "Maria",
      "lastName": "Santos",
      "email": "maria@empresa.com"
    }
  },
  {
    "id": "uuid-da-associacao-2",
    "applicationId": "uuid-da-application",
    "tagId": "uuid-da-tag-2",
    "addedByUserId": "uuid-do-usuario",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "tag": {
      "id": "uuid-da-tag-2",
      "label": "Experiência Relevante",
      "color": "#3B82F6",
      "textColor": "#FFFFFF"
    },
    "addedByUser": {
      "id": "uuid-do-usuario",
      "firstName": "Maria",
      "lastName": "Santos",
      "email": "maria@empresa.com"
    }
  }
]
```

### GET /application-tags/tag/:tagId
Lista todas as applications que usam uma tag específica.

**Headers necessários:**
```
Authorization: Bearer <jwt_token>
```

**Resposta (200):**
```json
[
  {
    "id": "uuid-da-associacao-1",
    "applicationId": "uuid-da-application-1",
    "tagId": "uuid-da-tag",
    "addedByUserId": "uuid-do-usuario",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "application": {
      "id": "uuid-da-application-1",
      "candidateName": "João Silva",
      "jobTitle": "Desenvolvedor Full Stack"
    },
    "addedByUser": {
      "id": "uuid-do-usuario",
      "firstName": "Maria",
      "lastName": "Santos",
      "email": "maria@empresa.com"
    }
  },
  {
    "id": "uuid-da-associacao-2",
    "applicationId": "uuid-da-application-2",
    "tagId": "uuid-da-tag",
    "addedByUserId": "uuid-do-usuario",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "application": {
      "id": "uuid-da-application-2",
      "candidateName": "Ana Costa",
      "jobTitle": "UX Designer"
    },
    "addedByUser": {
      "id": "uuid-do-usuario",
      "firstName": "Maria",
      "lastName": "Santos",
      "email": "maria@empresa.com"
    }
  }
]
```

### GET /application-tags/summary
Retorna um resumo de uso das tags na empresa.

**Headers necessários:**
```
Authorization: Bearer <jwt_token>
```

**Resposta (200):**
```json
[
  {
    "tagId": "uuid-da-tag-1",
    "tagLabel": "Candidato Promissor",
    "tagColor": "#10B981",
    "tagTextColor": "#FFFFFF",
    "usageCount": "15"
  },
  {
    "tagId": "uuid-da-tag-2",
    "tagLabel": "Experiência Relevante",
    "tagColor": "#3B82F6",
    "tagTextColor": "#FFFFFF",
    "usageCount": "12"
  },
  {
    "tagId": "uuid-da-tag-3",
    "tagLabel": "Perfil Júnior",
    "tagColor": "#F59E0B",
    "tagTextColor": "#FFFFFF",
    "usageCount": "8"
  }
]
```

### GET /application-tags/:id
Busca uma associação específica por ID.

**Headers necessários:**
```
Authorization: Bearer <jwt_token>
```

**Resposta (200):**
```json
{
  "id": "uuid-da-associacao",
  "applicationId": "uuid-da-application",
  "tagId": "uuid-da-tag",
  "addedByUserId": "uuid-do-usuario",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "tag": {
    "id": "uuid-da-tag",
    "label": "Candidato Promissor",
    "color": "#10B981",
    "textColor": "#FFFFFF"
  },
  "application": {
    "id": "uuid-da-application",
    "candidateName": "João Silva",
    "jobTitle": "Desenvolvedor Full Stack"
  },
  "addedByUser": {
    "id": "uuid-do-usuario",
    "firstName": "Maria",
    "lastName": "Santos",
    "email": "maria@empresa.com"
  }
}
```

### DELETE /application-tags/:id
Remove uma associação específica por ID.

**Headers necessários:**
```
Authorization: Bearer <jwt_token>
```

**Resposta (204):** Sem conteúdo

### DELETE /application-tags/application/:applicationId/tag/:tagId
Remove uma tag específica de uma application específica.

**Headers necessários:**
```
Authorization: Bearer <jwt_token>
```

**Resposta (204):** Sem conteúdo

## Regras de Negócio

1. **Autenticação**: Todos os endpoints requerem autenticação JWT válida
2. **Isolamento por empresa**: Cada usuário só pode acessar dados da sua própria empresa
3. **Unicidade**: Uma tag só pode ser adicionada uma vez por application
4. **Validação de existência**: Só é possível adicionar tags a applications existentes
5. **Validação de empresa**: Só é possível usar tags que pertencem à empresa do usuário
6. **Rastreamento**: Todas as ações são rastreadas com o usuário que as executou

## Códigos de Erro

- **400 Bad Request**: Dados inválidos no body da requisição
- **401 Unauthorized**: Token JWT inválido ou ausente
- **403 Forbidden**: Acesso negado (tag não pertence à empresa)
- **404 Not Found**: Application, tag ou associação não encontrada
- **409 Conflict**: Tag já foi adicionada à application

## Segurança

- O `companyId` é automaticamente extraído do token JWT do usuário autenticado
- Usuários não podem acessar dados de outras empresas
- Todas as operações são validadas contra a empresa do usuário logado
- Rastreamento de quem adicionou cada tag

## Casos de Uso

### 1. **Categorização de Candidatos**
- Adicionar tags como "Candidato Promissor", "Experiência Relevante", "Perfil Júnior"
- Organizar applications por características específicas

### 2. **Filtros e Buscas**
- Buscar todas as applications com uma tag específica
- Filtrar candidatos por critérios predefinidos

### 3. **Análise de Dados**
- Ver quais tags são mais usadas na empresa
- Identificar padrões de recrutamento

### 4. **Workflow de Recrutamento**
- Marcar candidatos em diferentes estágios do processo
- Acompanhar o progresso com tags temporárias

## Exemplo de Uso

```bash
# 1. Fazer login para obter o token JWT
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@company.com", "password": "password"}'

# 2. Adicionar uma tag a uma application
curl -X POST http://localhost:3000/application-tags \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "uuid-da-application",
    "tagId": "uuid-da-tag"
  }'

# 3. Listar todas as tags de uma application
curl -X GET http://localhost:3000/application-tags/application/uuid-da-application \
  -H "Authorization: Bearer <jwt_token>"

# 4. Listar todas as applications que usam uma tag
curl -X GET http://localhost:3000/application-tags/tag/uuid-da-tag \
  -H "Authorization: Bearer <jwt_token>"

# 5. Obter resumo de uso das tags
curl -X GET http://localhost:3000/application-tags/summary \
  -H "Authorization: Bearer <jwt_token>"

# 6. Remover uma tag de uma application
curl -X DELETE http://localhost:3000/application-tags/uuid-da-associacao \
  -H "Authorization: Bearer <jwt_token>"

# 7. Remover uma tag específica de uma application específica
curl -X DELETE http://localhost:3000/application-tags/application/uuid-da-application/tag/uuid-da-tag \
  -H "Authorization: Bearer <jwt_token>"
```

## Relacionamentos

- **ApplicationTag** → **Application** (Many-to-One)
- **ApplicationTag** → **Tag** (Many-to-One)
- **ApplicationTag** → **User** (Many-to-One, quem adicionou)
- **Application** → **ApplicationTag** (One-to-Many)
- **Tag** → **ApplicationTag** (One-to-Many)

## Performance

- Índices nas colunas `application_id`, `tag_id` e `added_by_user_id`
- Constraint único em `application_id + tag_id`
- Relações lazy loading para dados opcionais
- Query builder otimizado para resumos estatísticos
