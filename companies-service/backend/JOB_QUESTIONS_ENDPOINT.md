# Endpoint de Questions de Jobs

Este documento descreve o novo endpoint público para retornar as questions de uma job específica.

## Endpoint

```
GET /public/:companySlug/jobs/:jobSlug/questions
```

## Descrição

Este endpoint retorna todas as questions associadas a uma job específica de uma empresa. É um endpoint público que não requer autenticação.

## Parâmetros

- `companySlug` (string): Slug da empresa (ex: "gupy", "empresa-teste")
- `jobSlug` (string): Slug da vaga (ex: "desenvolvedor-full-stack", "analista-rh")

## Resposta

### Sucesso (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "question-uuid-1",
      "question": "Qual é sua experiência com React?",
      "orderIndex": 1,
      "isRequired": true
    },
    {
      "id": "question-uuid-2", 
      "question": "Conte sobre um projeto desafiador que você trabalhou",
      "orderIndex": 2,
      "isRequired": true
    }
  ],
  "total": 2,
  "jobId": "job-uuid-123",
  "message": "Questions da vaga encontradas com sucesso"
}
```

### Vaga sem questions (200)

```json
{
  "success": true,
  "data": [],
  "total": 0,
  "jobId": "job-uuid-123",
  "message": "Nenhuma question encontrada para esta vaga"
}
```

### Erro - Empresa não encontrada (404)

```json
{
  "statusCode": 404,
  "message": "Empresa com slug empresa-inexistente não encontrada",
  "error": "Not Found"
}
```

### Erro - Vaga não encontrada (404)

```json
{
  "statusCode": 404,
  "message": "Vaga não encontrada ou não pertence à empresa especificada",
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

## Validações

- O slug da empresa deve conter apenas letras, números e hífens
- O slug da vaga deve conter apenas letras, números e hífens
- A empresa deve existir no sistema
- A vaga deve existir e estar publicada
- A vaga deve pertencer à empresa especificada

## Exemplo de Uso

### cURL

```bash
curl -X GET "http://localhost:3000/public/gupy/jobs/desenvolvedor-full-stack/questions"
```

### JavaScript/Fetch

```javascript
const response = await fetch('/public/gupy/jobs/desenvolvedor-full-stack/questions');
const data = await response.json();

if (data.success) {
  console.log(`Encontradas ${data.total} questions`);
  data.data.forEach(question => {
    console.log(`${question.orderIndex}. ${question.question} (${question.isRequired ? 'Obrigatória' : 'Opcional'})`);
  });
}
```

## Implementação Técnica

### Controller

O endpoint está implementado no `PublicJobsController` e utiliza o método `findPublicJobQuestions()`.

### Service

O método `findPublicJobQuestionsBySlug()` no `JobsService`:
1. Valida se a job existe e está publicada
2. Busca as questions ordenadas por `orderIndex`
3. Retorna apenas os campos necessários (id, question, orderIndex, isRequired)

### Segurança

- Endpoint público (sem autenticação)
- Validação de slugs para prevenir injeção
- Verificação de existência da empresa e job
- Verificação de que a job pertence à empresa

## Relacionamentos

- Uma job pode ter múltiplas questions
- Questions são ordenadas por `orderIndex`
- Questions podem ser obrigatórias ou opcionais
- Questions são deletadas automaticamente quando a job é removida (CASCADE)
