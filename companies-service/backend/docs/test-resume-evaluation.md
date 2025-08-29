# Teste da Avaliação Automática de Candidatos

## Visão Geral

Após a implementação, quando um currículo é criado através do endpoint `/resumes/:applicationId`, o sistema automaticamente:

1. Salva o currículo no banco de dados
2. Chama o endpoint `/ai/evaluate-candidate` do ai-service
3. Calcula os scores de avaliação
4. Salva os scores na tabela `applications`

## Como Testar

### 1. Criar uma Aplicação

Primeiro, crie uma aplicação para uma vaga:

```bash
curl -X POST http://localhost:3000/applications \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "123e4567-e89b-12d3-a456-426614174000",
    "firstName": "João",
    "lastName": "Silva",
    "email": "joao.silva@email.com",
    "phone": "+5511999999999"
  }'
```

### 2. Criar um Currículo

Crie um currículo para a aplicação (isso disparará a avaliação automática):

```bash
curl -X POST http://localhost:3000/resumes/456e7890-e89b-12d3-a456-426614174001 \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Desenvolvedor Full Stack com 5 anos de experiência",
    "professionalExperiences": [
      {
        "companyName": "TechCorp",
        "position": "Desenvolvedor Full Stack",
        "startDate": "2020-01-01",
        "endDate": "2023-12-31",
        "isCurrent": false,
        "description": "Desenvolvimento de aplicações web com React e Node.js"
      }
    ],
    "academicFormations": [
      {
        "institution": "Universidade de São Paulo",
        "course": "Ciência da Computação",
        "degree": "Bacharelado",
        "startDate": "2016-01-01",
        "endDate": "2020-12-31",
        "isCurrent": false,
        "status": "completed"
      }
    ],
    "achievements": [
      {
        "title": "Melhor Desenvolvedor do Ano",
        "description": "Reconhecimento por excelência técnica"
      }
    ],
    "languages": [
      {
        "language": "Inglês",
        "proficiencyLevel": "fluent"
      }
    ]
  }'
```

### 3. Verificar os Scores

Após a criação do currículo, verifique se os scores foram salvos na aplicação:

```bash
curl -X GET http://localhost:3000/applications/456e7890-e89b-12d3-a456-426614174001
```

A resposta deve incluir os campos de avaliação:

```json
{
  "id": "456e7890-e89b-12d3-a456-426614174001",
  "jobId": "123e4567-e89b-12d3-a456-426614174000",
  "firstName": "João",
  "lastName": "Silva",
  "email": "joao.silva@email.com",
  "overallScore": 85.5,
  "questionResponsesScore": 90.0,
  "educationScore": 88.0,
  "experienceScore": 82.0,
  "evaluationProvider": "openai",
  "evaluationModel": "gpt-3.5-turbo",
  "evaluatedAt": "2024-01-01T12:00:00.000Z",
  "evaluationDetails": {
    "overall_score": 85.5,
    "question_responses_score": 90.0,
    "education_score": 88.0,
    "experience_score": 82.0
  }
}
```

## Logs do Sistema

Durante o processo, você verá logs como:

```
✅ Candidato avaliado com sucesso para aplicação 456e7890-e89b-12d3-a456-426614174001
📊 Scores: Geral=85.5, Respostas=90.0, Educação=88.0, Experiência=82.0
```

## Configuração Necessária

### Variáveis de Ambiente

Certifique-se de que as seguintes variáveis estão configuradas:

```env
AI_SERVICE_URL=http://ai-service:8000
```

### Dependências

O sistema precisa que o ai-service esteja rodando e acessível para funcionar corretamente.

## Tratamento de Erros

Se a avaliação falhar, o currículo ainda será criado, mas você verá logs de erro:

```
❌ Erro ao avaliar candidato: [detalhes do erro]
```

A criação do currículo não falha se a avaliação falhar, garantindo que o processo principal continue funcionando.
