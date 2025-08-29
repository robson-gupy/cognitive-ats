# Módulo de Tags

Este módulo fornece funcionalidades completas de CRUD para gerenciar tags no sistema.

## Funcionalidades

- **Criar tag**: Cria uma nova tag para uma empresa
- **Listar tags**: Lista todas as tags de uma empresa
- **Buscar tag**: Busca uma tag específica por ID
- **Atualizar tag**: Atualiza os dados de uma tag existente
- **Remover tag**: Remove uma tag do sistema

## Estrutura da Tabela

A tabela `tags` possui os seguintes campos:

- `id`: UUID único da tag
- `label`: Nome/etiqueta da tag (máximo 100 caracteres)
- `company_id`: ID da empresa à qual a tag pertence
- `color`: Cor de fundo da tag (formato hexadecimal, padrão: #3B82F6)
- `text_color`: Cor do texto da tag (formato hexadecimal, padrão: #FFFFFF)
- `created_at`: Data de criação
- `updated_at`: Data da última atualização

## Endpoints

### POST /tags
Cria uma nova tag.

**Headers necessários:**
```
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "label": "Nome da Tag",
  "color": "#FF0000",        // Opcional, padrão: #3B82F6
  "textColor": "#FFFFFF"     // Opcional, padrão: #FFFFFF
}
```

**Resposta (201):**
```json
{
  "id": "uuid-da-tag",
  "label": "Nome da Tag",
  "companyId": "uuid-da-empresa",
  "color": "#FF0000",
  "textColor": "#FFFFFF",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### GET /tags
Lista todas as tags da empresa autenticada.

**Headers necessários:**
```
Authorization: Bearer <jwt_token>
```

**Resposta (200):**
```json
[
  {
    "id": "uuid-da-tag-1",
    "label": "Tag 1",
    "companyId": "uuid-da-empresa",
    "color": "#FF0000",
    "textColor": "#FFFFFF",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "uuid-da-tag-2",
    "label": "Tag 2",
    "companyId": "uuid-da-empresa",
    "color": "#00FF00",
    "textColor": "#000000",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### GET /tags/:id
Busca uma tag específica por ID.

**Headers necessários:**
```
Authorization: Bearer <jwt_token>
```

**Resposta (200):**
```json
{
  "id": "uuid-da-tag",
  "label": "Nome da Tag",
  "companyId": "uuid-da-empresa",
  "color": "#FF0000",
  "textColor": "#FFFFFF",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### PATCH /tags/:id
Atualiza uma tag existente.

**Headers necessários:**
```
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "label": "Novo Nome da Tag",  // Opcional
  "color": "#00FF00",           // Opcional
  "textColor": "#000000"        // Opcional
}
```

**Resposta (200):**
```json
{
  "id": "uuid-da-tag",
  "label": "Novo Nome da Tag",
  "companyId": "uuid-da-empresa",
  "color": "#00FF00",
  "textColor": "#000000",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### DELETE /tags/:id
Remove uma tag do sistema.

**Headers necessários:**
```
Authorization: Bearer <jwt_token>
```

**Resposta (204):** Sem conteúdo

## Regras de Negócio

1. **Autenticação**: Todos os endpoints requerem autenticação JWT válida
2. **Isolamento por empresa**: Cada usuário só pode acessar tags da sua própria empresa
3. **Label único**: Não é possível criar duas tags com o mesmo nome na mesma empresa
4. **Validação de cores**: As cores devem estar no formato hexadecimal válido (#RRGGBB)
5. **Valores padrão**: Se não especificadas, as cores usam valores padrão:
   - `color`: #3B82F6 (azul)
   - `textColor`: #FFFFFF (branco)

## Códigos de Erro

- **400 Bad Request**: Dados inválidos no body da requisição
- **401 Unauthorized**: Token JWT inválido ou ausente
- **404 Not Found**: Tag não encontrada
- **409 Conflict**: Já existe uma tag com o mesmo nome na empresa

## Segurança

- O `companyId` é automaticamente extraído do token JWT do usuário autenticado
- Usuários não podem acessar tags de outras empresas
- Todas as operações são validadas contra a empresa do usuário logado

## Exemplo de Uso

```bash
# 1. Fazer login para obter o token JWT
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@company.com", "password": "password"}'

# 2. Criar uma nova tag
curl -X POST http://localhost:3000/tags \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"label": "Candidato Promissor", "color": "#10B981"}'

# 3. Listar todas as tags
curl -X GET http://localhost:3000/tags \
  -H "Authorization: Bearer <jwt_token>"

# 4. Atualizar uma tag
curl -X PATCH http://localhost:3000/tags/<tag_id> \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"color": "#EF4444"}'

# 5. Remover uma tag
curl -X DELETE http://localhost:3000/tags/<tag_id> \
  -H "Authorization: Bearer <jwt_token>"
```
