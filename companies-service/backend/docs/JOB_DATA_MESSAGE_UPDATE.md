# Atualização da Mensagem SQS - Dados Completos do Job

Implementei a inclusão dos dados completos do job na mensagem enviada para a fila SQS quando uma aplicação é criada.

## Mudanças Implementadas

### 1. Interface AsyncTaskQueue (`async-task-queue.interface.ts`)

**Antes:**
```typescript
sendApplicationCreatedMessage(
  applicationId: string, 
  resumeUrl: string, 
  jobId: string
): Promise<void>;
```

**Depois:**
```typescript
sendApplicationCreatedMessage(
  applicationId: string, 
  resumeUrl: string, 
  jobId: string, 
  jobData: Record<string, unknown>
): Promise<void>;
```

### 2. SQS Client Service (`sqs-client.service.ts`)

**Antes:**
```typescript
const messageBody = {
  applicationId,
  resumeUrl,
  jobId,
  eventType: 'APPLICATION_CREATED',
  timestamp: new Date().toISOString(),
};
```

**Depois:**
```typescript
const messageBody = {
  applicationId,
  resumeUrl,
  jobId,
  jobData, // ✅ NOVO
  eventType: 'APPLICATION_CREATED',
  timestamp: new Date().toISOString(),
};
```

### 3. Applications Service (`applications.service.ts`)

**Antes:**
```typescript
// Buscar apenas campos básicos
const job = await this.jobsRepository.findOne({
  where: { id: createApplicationDto.jobId },
  select: ['id', 'companyId', 'status'],
});

// Enviar apenas jobId
await this.asyncTaskQueue.sendApplicationCreatedMessage(
  applicationId,
  resumeUrl,
  jobId
);
```

**Depois:**
```typescript
// Buscar dados completos do job
const job = await this.jobsRepository.findOne({
  where: { id: createApplicationDto.jobId },
  select: ['id', 'companyId', 'status', 'title', 'description', 'requirements'],
});

// Preparar dados no formato esperado
const jobData = {
  id: job.id,
  title: job.title,
  description: job.description,
  requirements: job.requirements ? [job.requirements] : [],
  responsibilities: [], // Campo não disponível na entidade atual
  education_required: '', // Campo não disponível na entidade atual
  experience_required: '', // Campo não disponível na entidade atual
  skills_required: [] // Campo não disponível na entidade atual
};

// Enviar com dados completos
await this.asyncTaskQueue.sendApplicationCreatedMessage(
  applicationId,
  resumeUrl,
  jobId,
  jobData // ✅ NOVO
);
```

## Estrutura da Mensagem SQS

### Antes:
```json
{
  "applicationId": "123e4567-e89b-12d3-a456-426614174000",
  "resumeUrl": "https://example.com/resume.pdf",
  "jobId": "456e7890-e89b-12d3-a456-426614174000",
  "eventType": "APPLICATION_CREATED",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Depois:
```json
{
  "applicationId": "123e4567-e89b-12d3-a456-426614174000",
  "resumeUrl": "https://example.com/resume.pdf",
  "jobId": "456e7890-e89b-12d3-a456-426614174000",
  "jobData": {
    "id": "456e7890-e89b-12d3-a456-426614174000",
    "title": "Desenvolvedor Full Stack",
    "description": "Vaga para desenvolvedor com experiência em React e Node.js",
    "requirements": ["Experiência em React", "Conhecimento em Node.js"],
    "responsibilities": [],
    "education_required": "",
    "experience_required": "",
    "skills_required": []
  },
  "eventType": "APPLICATION_CREATED",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Compatibilidade com Async-Task-Service

A estrutura do `jobData` segue o formato esperado pelo `async-task-service`:

```python
# No async-task-service, o job_data será usado assim:
converted = {
    "title": job_data.get("title", ""),
    "description": job_data.get("description", ""),
    "requirements": job_data.get("requirements", []),
    "responsibilities": job_data.get("responsibilities", []),
    "education_required": job_data.get("education_required", ""),
    "experience_required": job_data.get("experience_required", ""),
    "skills_required": job_data.get("skills_required", [])
}
```

## Campos Disponíveis vs. Campos Esperados

### ✅ Campos Disponíveis na Entidade Job:
- `id` - ID da vaga
- `title` - Título da vaga
- `description` - Descrição da vaga
- `requirements` - Requisitos (string, convertido para array)

### ❌ Campos Não Disponíveis (preenchidos com valores padrão):
- `responsibilities` - Responsabilidades (array vazio)
- `education_required` - Educação necessária (string vazia)
- `experience_required` - Experiência necessária (string vazia)
- `skills_required` - Habilidades necessárias (array vazio)

## Vantagens

### ✅ Dados Completos
- **Informações da vaga**: Título, descrição e requisitos incluídos na mensagem
- **Eliminação de queries**: Async-task-service não precisa buscar dados da vaga
- **Performance**: Reduz chamadas ao banco de dados

### ✅ Compatibilidade
- **Formato padronizado**: Segue a estrutura esperada pelo async-task-service
- **Fallback seguro**: Campos não disponíveis são preenchidos com valores padrão
- **Extensibilidade**: Fácil adicionar novos campos quando disponíveis

### ✅ Rastreabilidade
- **Dados completos**: Permite rastrear exatamente qual vaga foi usada
- **Auditoria**: Facilita debugging e análise de problemas

## Próximos Passos

Para incluir todos os campos esperados, seria necessário:

1. **Atualizar a entidade Job** para incluir:
   - `responsibilities` (array de strings)
   - `educationRequired` (string)
   - `experienceRequired` (string)
   - `skillsRequired` (array de strings)

2. **Atualizar o DTO** de criação de vagas para incluir esses campos

3. **Atualizar a interface** de vagas no frontend

4. **Executar migração** no banco de dados

Por enquanto, os campos não disponíveis são preenchidos com valores padrão para manter a compatibilidade.
