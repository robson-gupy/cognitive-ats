# Configuração do CORS

Este documento explica como configurar o CORS (Cross-Origin Resource Sharing) no serviço de empresas.

## Visão Geral

O CORS agora é configurável através de variáveis de ambiente, permitindo flexibilidade entre diferentes ambientes (desenvolvimento, homologação, produção).

## Variáveis de Ambiente

### CORS_ORIGIN
Define as origens permitidas para acessar a API.

**Formato:** URLs separadas por vírgula
**Exemplo:** `http://localhost:5173,http://localhost:3000,https://meudominio.com`

**Valores especiais:**
- `*` - Permite todas as origens (não recomendado para produção)
- `true` - Permite todas as origens
- `false` - Desabilita o CORS

### CORS_METHODS
Define os métodos HTTP permitidos.

**Formato:** Métodos separados por vírgula
**Exemplo:** `GET,POST,PUT,DELETE,PATCH,OPTIONS`

**Métodos padrão:** `GET,POST,PUT,DELETE,PATCH,OPTIONS`

### CORS_ALLOWED_HEADERS
Define os cabeçalhos HTTP permitidos.

**Formato:** Cabeçalhos separados por vírgula
**Exemplo:** `Content-Type,Authorization,X-Requested-With`

**Cabeçalhos padrão:** `Content-Type,Authorization`

### CORS_CREDENTIALS
Define se as credenciais (cookies, headers de autorização) são permitidas.

**Valores:** `true` ou `false`
**Padrão:** `true`

### CORS_OPTIONS_SUCCESS_STATUS
Define o status HTTP para respostas de preflight OPTIONS.

**Valores:** Número inteiro
**Padrão:** `204`

### CORS_PREFLIGHT_CONTINUE
Define se as requisições de preflight devem continuar para o próximo middleware.

**Valores:** `true` ou `false`
**Padrão:** `false`

## Exemplos de Configuração

### Desenvolvimento Local
```bash
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
CORS_METHODS=GET,POST,PUT,DELETE,PATCH,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization
CORS_CREDENTIALS=true
```

### Produção
```bash
CORS_ORIGIN=https://meudominio.com,https://app.meudominio.com
CORS_METHODS=GET,POST,PUT,DELETE
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With
CORS_CREDENTIALS=true
CORS_OPTIONS_SUCCESS_STATUS=200
```

### Permitir Todas as Origens (Apenas para Desenvolvimento)
```bash
CORS_ORIGIN=*
CORS_CREDENTIALS=false
```

## Configuração Padrão

Se nenhuma variável de ambiente for definida, o sistema usará a seguinte configuração padrão:

```typescript
{
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
  preflightContinue: false,
}
```

## Segurança

⚠️ **Importante:** 
- Não use `CORS_ORIGIN=*` em produção
- Sempre especifique as origens exatas permitidas
- Mantenha `CORS_CREDENTIALS=false` se não precisar de cookies/autenticação
- Revise regularmente as origens permitidas

## Arquivos Relacionados

- `src/shared/config/cors.config.ts` - Configuração do CORS
- `src/main.ts` - Aplicação da configuração
- `.env.example` - Exemplo de variáveis de ambiente
