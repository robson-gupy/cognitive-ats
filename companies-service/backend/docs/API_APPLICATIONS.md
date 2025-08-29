# API de Applications (Inscrições)

## Endpoints

### POST /applications
**Endpoint público** para criar uma nova inscrição em uma vaga.

**Payload:**
```json
{
  "jobId": "uuid-da-vaga",
  "firstName": "João",
  "lastName": "Silva",
  "email": "joao@email.com", // Obrigatório se phone não for fornecido
  "phone": "11999999999"   // Obrigatório se email não for fornecido
}
```

**Validações:**
- A vaga deve existir
- A vaga deve estar com status "PUBLISHED"
- Pelo menos um dos campos (email ou phone) deve ser fornecido
- jobId é obrigatório
- firstName é obrigatório
- lastName é obrigatório

**Resposta de sucesso (201):**
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

### GET /applications
**Endpoint privado** - Lista todas as inscrições da empresa do usuário autenticado.

**Headers necessários:**
```
Authorization: Bearer <jwt-token>
```

**Resposta:**
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

### GET /applications/:id
**Endpoint privado** - Busca uma inscrição específica da empresa do usuário autenticado.

**Headers necessários:**
```
Authorization: Bearer <jwt-token>
```

### GET /applications/job/:jobId
**Endpoint privado** - Lista todas as inscrições de uma vaga específica da empresa do usuário autenticado.

**Headers necessários:**
```
Authorization: Bearer <jwt-token>
```

### PATCH /applications/:id
**Endpoint privado** - Atualiza uma inscrição específica da empresa do usuário autenticado.

**Headers necessários:**
```
Authorization: Bearer <jwt-token>
```

**Payload (campos opcionais):**
```json
{
  "firstName": "João",
  "lastName": "Silva",
  "email": "joao@email.com",
  "phone": "11999999999"
}
```

### DELETE /applications/:id
**Endpoint privado** - Remove uma inscrição específica da empresa do usuário autenticado.

**Headers necessários:**
```
Authorization: Bearer <jwt-token>
```

## Índices da Tabela

A tabela `applications` possui os seguintes índices para otimização de consultas:

- `IDX_applications_job_id` - Índice simples no campo `job_id`
- `IDX_applications_company_id` - Índice simples no campo `company_id`
- `IDX_applications_job_company` - Índice composto nos campos `job_id` e `company_id`

## Relacionamentos

- **Application -> Job**: Many-to-One (uma inscrição pertence a uma vaga)
- **Application -> Company**: Many-to-One (uma inscrição pertence a uma empresa)
- **Job -> Application**: One-to-Many (uma vaga pode ter várias inscrições) 