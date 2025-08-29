# API de Currículos - Exemplos de Uso

## Visão Geral

O sistema de currículos permite armazenar informações detalhadas sobre candidatos, incluindo:
- Experiências profissionais
- Formações acadêmicas
- Conquistas e certificações
- Idiomas
- Resumo do currículo

Cada aplicação (application) pode ter um currículo associado.

## Endpoints Disponíveis

### 1. Criar Currículo
**POST** `/resumes/:applicationId`

```json
{
  "summary": "Desenvolvedor Full Stack com 5 anos de experiência em React, Node.js e Python. Especializado em aplicações web escaláveis e arquiteturas de microserviços.",
  "professionalExperiences": [
    {
      "companyName": "TechCorp",
      "position": "Desenvolvedor Full Stack Senior",
      "startDate": "2022-01-15",
      "endDate": null,
      "isCurrent": true,
      "description": "Desenvolvimento de aplicações web escaláveis",
      "responsibilities": "Liderança técnica, arquitetura de sistemas, mentoria de desenvolvedores juniores",
      "achievements": "Redução de 40% no tempo de deploy, implementação de CI/CD"
    },
    {
      "companyName": "StartupXYZ",
      "position": "Desenvolvedor Frontend",
      "startDate": "2020-03-01",
      "endDate": "2021-12-31",
      "isCurrent": false,
      "description": "Desenvolvimento de interfaces de usuário",
      "responsibilities": "Desenvolvimento de componentes React, otimização de performance",
      "achievements": "Melhoria de 60% na performance da aplicação"
    }
  ],
  "academicFormations": [
    {
      "institution": "Universidade de São Paulo",
      "course": "Ciência da Computação",
      "degree": "Bacharelado",
      "startDate": "2016-03-01",
      "endDate": "2020-12-15",
      "isCurrent": false,
      "status": "completed",
      "description": "Formação em ciência da computação com foco em desenvolvimento de software"
    }
  ],
  "achievements": [
    {
      "title": "AWS Certified Solutions Architect",
      "description": "Certificação em arquitetura de soluções AWS"
    },
    {
      "title": "Melhor Desenvolvedor do Ano",
      "description": "Reconhecimento por excelência técnica e liderança"
    }
  ],
  "languages": [
    {
      "language": "Português",
      "proficiencyLevel": "native"
    },
    {
      "language": "Inglês",
      "proficiencyLevel": "fluent"
    },
    {
      "language": "Espanhol",
      "proficiencyLevel": "intermediate"
    }
  ]
}
```

### 2. Buscar Currículo por Aplicação
**GET** `/resumes/application/:applicationId`

Retorna o currículo completo com todas as seções relacionadas.

### 3. Buscar Currículos por Vaga
**GET** `/resumes/job/:jobId`

Retorna todos os currículos dos candidatos que se candidataram para uma vaga específica.

### 4. Buscar Currículos por Empresa
**GET** `/resumes/company/:companyId`

Retorna todos os currículos dos candidatos que se candidataram para vagas de uma empresa específica.

### 5. Atualizar Currículo
**PATCH** `/resumes/:applicationId`

```json
{
  "summary": "Resumo atualizado do currículo",
  "professionalExperiences": [
    {
      "companyName": "Nova Empresa",
      "position": "Tech Lead",
      "startDate": "2024-01-01",
      "isCurrent": true,
      "description": "Nova experiência profissional"
    }
  ]
}
```

### 6. Remover Currículo
**DELETE** `/resumes/:applicationId`

Remove o currículo e todas as informações relacionadas.

## Estrutura dos Dados

### Níveis de Proficiência em Idiomas
- `basic`: Básico
- `intermediate`: Intermediário
- `advanced`: Avançado
- `fluent`: Fluente
- `native`: Nativo



### Status de Formação Acadêmica
- `completed`: Concluído
- `in_progress`: Em andamento
- `abandoned`: Abandonado

## Exemplo de Resposta

```json
{
  "id": "uuid-do-curriculo",
  "applicationId": "uuid-da-aplicacao",
  "summary": "Desenvolvedor Full Stack com 5 anos de experiência...",
  "professionalExperiences": [
    {
      "id": "uuid-experiencia",
      "companyName": "TechCorp",
      "position": "Desenvolvedor Full Stack Senior",
      "startDate": "2022-01-15",
      "endDate": null,
      "isCurrent": true,
      "description": "Desenvolvimento de aplicações web escaláveis",
      "responsibilities": "Liderança técnica, arquitetura de sistemas",
      "achievements": "Redução de 40% no tempo de deploy",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "academicFormations": [...],
  "achievements": [...],
  "languages": [...],
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00Z"
}
```

## Autenticação

Todos os endpoints requerem autenticação JWT. Inclua o token no header:

```
Authorization: Bearer <seu-token-jwt>
``` 