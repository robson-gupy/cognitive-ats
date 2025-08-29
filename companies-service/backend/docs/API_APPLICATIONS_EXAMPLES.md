# Exemplos de Uso da API de Applications

## 1. Criar uma Inscrição (Endpoint Público)

```bash
curl -X POST http://localhost:3000/applications \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "uuid-da-vaga",
    "firstName": "João",
    "lastName": "Silva",
    "email": "joao@email.com"
  }'
```

**Resposta esperada (201):**
```json
{
  "id": "uuid-da-inscricao",
  "jobId": "uuid-da-vaga",
  "companyId": "uuid-da-empresa",
  "firstName": "João",
  "lastName": "Silva",
  "email": "joao@email.com",
  "phone": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 2. Criar Inscrição com Telefone (Endpoint Público)

```bash
curl -X POST http://localhost:3000/applications \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "uuid-da-vaga",
    "firstName": "Maria",
    "lastName": "Santos",
    "phone": "11999999999"
  }'
```

## 3. Listar Inscrições da Empresa (Endpoint Privado)

```bash
curl -X GET http://localhost:3000/applications \
  -H "Authorization: Bearer seu-jwt-token"
```

**Resposta esperada:**
```json
[
  {
    "id": "uuid-da-inscricao",
    "jobId": "uuid-da-vaga",
    "companyId": "uuid-da-empresa",
    "firstName": "João",
    "lastName": "Silva",
    "email": "joao@email.com",
    "phone": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "job": {
      "id": "uuid-da-vaga",
      "title": "Desenvolvedor Full Stack",
      "companyId": "uuid-da-empresa"
    }
  }
]
```

## 4. Buscar Inscrição Específica (Endpoint Privado)

```bash
curl -X GET http://localhost:3000/applications/uuid-da-inscricao \
  -H "Authorization: Bearer seu-jwt-token"
```

## 5. Listar Inscrições de uma Vaga Específica (Endpoint Privado)

```bash
curl -X GET http://localhost:3000/applications/job/uuid-da-vaga \
  -H "Authorization: Bearer seu-jwt-token"
```

## 6. Atualizar Inscrição (Endpoint Privado)

```bash
curl -X PATCH http://localhost:3000/applications/uuid-da-inscricao \
  -H "Authorization: Bearer seu-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "João Pedro",
    "email": "joao.pedro@email.com"
  }'
```

## 7. Remover Inscrição (Endpoint Privado)

```bash
curl -X DELETE http://localhost:3000/applications/uuid-da-inscricao \
  -H "Authorization: Bearer seu-jwt-token"
```

## Casos de Erro

### Vaga não encontrada
```bash
curl -X POST http://localhost:3000/applications \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "uuid-inexistente",
    "firstName": "João",
    "lastName": "Silva",
    "email": "joao@email.com"
  }'
```

**Resposta (404):**
```json
{
  "statusCode": 404,
  "message": "Vaga não encontrada",
  "error": "Not Found"
}
```

### Vaga não publicada
```bash
curl -X POST http://localhost:3000/applications \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "uuid-vaga-draft",
    "firstName": "João",
    "lastName": "Silva",
    "email": "joao@email.com"
  }'
```

**Resposta (400):**
```json
{
  "statusCode": 400,
  "message": "Apenas vagas publicadas podem receber inscrições",
  "error": "Bad Request"
}
```

### Email e telefone não fornecidos
```bash
curl -X POST http://localhost:3000/applications \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "uuid-da-vaga",
    "firstName": "João",
    "lastName": "Silva"
  }'
```

**Resposta (400):**
```json
{
  "statusCode": 400,
  "message": "Email ou telefone deve ser fornecido",
  "error": "Bad Request"
}
```

### Email já utilizado na vaga
```bash
curl -X POST http://localhost:3000/applications \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "uuid-da-vaga",
    "firstName": "João",
    "lastName": "Silva",
    "email": "joao@email.com"
  }'
```

**Resposta (400):**
```json
{
  "statusCode": 400,
  "message": "Este email já foi utilizado para se inscrever nesta vaga",
  "error": "Bad Request"
}
```

### Telefone já utilizado na vaga
```bash
curl -X POST http://localhost:3000/applications \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "uuid-da-vaga",
    "firstName": "Maria",
    "lastName": "Santos",
    "phone": "11999999999"
  }'
```

**Resposta (400):**
```json
{
  "statusCode": 400,
  "message": "Este telefone já foi utilizado para se inscrever nesta vaga",
  "error": "Bad Request"
}
```

### Acesso não autorizado
```bash
curl -X GET http://localhost:3000/applications
```

**Resposta (403):**
```json
{
  "statusCode": 403,
  "message": "Acesso negado: apenas administradores podem acessar este recurso",
  "error": "Forbidden"
}
```

## Validações do DTO

O DTO `CreateApplicationDto` inclui as seguintes validações:

- `jobId`: UUID obrigatório
- `firstName`: String obrigatória
- `lastName`: String obrigatória
- `email`: Email válido, obrigatório se phone não for fornecido
- `phone`: String, obrigatório se email não for fornecido

A validação customizada garante que pelo menos um dos campos (email ou phone) seja fornecido. 