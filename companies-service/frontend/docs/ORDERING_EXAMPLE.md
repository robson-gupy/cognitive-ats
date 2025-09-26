# Ordenação por Overall Score - Exemplo de Teste

## Visão Geral

As applications agora são automaticamente ordenadas por `overall_score` do maior para o menor em cada etapa do processo
seletivo.

## Como Testar a Ordenação

### 1. Criar Múltiplas Aplicações com Diferentes Scores

```bash
# Aplicação 1 - Score alto (95)
curl -X POST http://localhost:3000/applications \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "JOB_ID_AQUI",
    "firstName": "João",
    "lastName": "Silva",
    "email": "joao@email.com"
  }'

# Aplicação 2 - Score médio (75)
curl -X POST http://localhost:3000/applications \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "JOB_ID_AQUI",
    "firstName": "Maria",
    "lastName": "Santos",
    "email": "maria@email.com"
  }'

# Aplicação 3 - Score baixo (45)
curl -X POST http://localhost:3000/applications \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "JOB_ID_AQUI",
    "firstName": "Pedro",
    "lastName": "Oliveira",
    "email": "pedro@email.com"
  }'
```

### 2. Adicionar Currículos com Diferentes Qualificações

```bash
# Currículo 1 - Muito qualificado (score ~95)
curl -X POST http://localhost:3000/resumes/APPLICATION_ID_1 \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Desenvolvedor Full Stack Senior com 8 anos de experiência em React, Node.js, TypeScript, AWS, Docker, Kubernetes",
    "professionalExperiences": [
      {
        "companyName": "Google",
        "position": "Senior Software Engineer",
        "startDate": "2020-01-01",
        "endDate": "2023-12-31",
        "isCurrent": false,
        "description": "Desenvolvimento de aplicações web escaláveis com React, Node.js, TypeScript, AWS, Docker, Kubernetes"
      }
    ],
    "academicFormations": [
      {
        "institution": "MIT",
        "course": "Computer Science",
        "degree": "Masters",
        "startDate": "2018-01-01",
        "endDate": "2020-12-31",
        "isCurrent": false,
        "status": "completed"
      }
    ]
  }'

# Currículo 2 - Moderadamente qualificado (score ~75)
curl -X POST http://localhost:3000/resumes/APPLICATION_ID_2 \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Desenvolvedor Full Stack com 3 anos de experiência em React e Node.js",
    "professionalExperiences": [
      {
        "companyName": "Startup Tech",
        "position": "Full Stack Developer",
        "startDate": "2021-01-01",
        "endDate": "2023-12-31",
        "isCurrent": false,
        "description": "Desenvolvimento de aplicações web com React e Node.js"
      }
    ],
    "academicFormations": [
      {
        "institution": "Universidade Estadual",
        "course": "Sistemas de Informação",
        "degree": "Bacharelado",
        "startDate": "2017-01-01",
        "endDate": "2021-12-31",
        "isCurrent": false,
        "status": "completed"
      }
    ]
  }'

# Currículo 3 - Pouco qualificado (score ~45)
curl -X POST http://localhost:3000/resumes/APPLICATION_ID_3 \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Estudante de programação com conhecimento básico em HTML e CSS",
    "professionalExperiences": [
      {
        "companyName": "Freelancer",
        "position": "Web Designer",
        "startDate": "2023-01-01",
        "endDate": "2023-12-31",
        "isCurrent": false,
        "description": "Criação de sites simples com HTML e CSS"
      }
    ],
    "academicFormations": [
      {
        "institution": "Curso Online",
        "course": "Web Development",
        "degree": "Certificado",
        "startDate": "2022-01-01",
        "endDate": "2022-06-30",
        "isCurrent": false,
        "status": "completed"
      }
    ]
  }'
```

### 3. Verificar a Ordenação no Frontend

1. Acesse a lista de vagas
2. Clique em "Candidatos" para a vaga
3. Observe que os candidatos estão ordenados por aderência:
    - **Primeiro**: João Silva (🔵 Muito alta - 95)
    - **Segundo**: Maria Santos (🔷 Alta - 75)
    - **Terceiro**: Pedro Oliveira (🔴 Baixa - 45)

## Lógica de Ordenação

```typescript
.sort((a, b) => {
  // Ordenar por overall_score do maior para o menor
  const scoreA = a.overallScore ?? 0;
  const scoreB = b.overallScore ?? 0;
  return scoreB - scoreA; // Ordem decrescente
});
```

### Regras de Ordenação

1. **Candidatos com score**: Ordenados do maior para o menor
2. **Candidatos sem score**: Aparecem no final da lista
3. **Score nulo/undefined**: Tratado como 0
4. **Ordenação por etapa**: Cada etapa mantém sua própria ordenação

## Benefícios

1. **Priorização Visual**: Candidatos mais qualificados aparecem primeiro
2. **Tomada de Decisão**: Facilita a identificação dos melhores candidatos
3. **Eficiência**: Reduz tempo de análise dos candidatos
4. **Consistência**: Ordenação automática em todas as etapas

## Notas Técnicas

- A ordenação é aplicada em tempo real
- Funciona em todas as etapas do processo seletivo
- Mantém a funcionalidade de drag & drop
- Não afeta as mudanças de etapa pendentes
