# Etiquetas de Aderência - Applications

## Visão Geral

Implementamos etiquetas coloridas nos cards de applications que indicam o nível de aderência do candidato à vaga baseado no `overall_score`.

## Regras de Aderência

| Score | Nível | Cor | Descrição |
|-------|-------|-----|-----------|
| >= 90 | Muito alta | Azul escuro | Candidato com excelente aderência à vaga |
| >= 70 < 90 | Alta | Azul claro | Candidato com boa aderência à vaga |
| >= 50 < 70 | Média | Amarela | Candidato com aderência moderada à vaga |
| < 50 | Baixa | Vermelha | Candidato com baixa aderência à vaga |

## Implementação

### 1. Tipo Application Atualizado

Adicionamos novos campos ao tipo `Application`:

```typescript
export interface Application {
  // ... campos existentes
  overallScore?: number;
  questionResponsesScore?: number;
  educationScore?: number;
  experienceScore?: number;
  evaluationProvider?: string;
  evaluationModel?: string;
  evaluationDetails?: any;
  evaluatedAt?: string;
}
```

### 2. Funções de Aderência

```typescript
const getAdherenceLevel = (overallScore?: number) => {
  if (overallScore === undefined || overallScore === null) return null;
  if (overallScore >= 90) return 'Muito alta';
  if (overallScore >= 70) return 'Alta';
  if (overallScore >= 50) return 'Média';
  return 'Baixa';
};

const getAdherenceColor = (overallScore?: number) => {
  if (overallScore === undefined || overallScore === null) return 'default';
  if (overallScore >= 90) return 'blue'; // Azul mais escuro
  if (overallScore >= 70) return 'cyan'; // Azul claro
  if (overallScore >= 50) return 'gold'; // Amarela
  return 'red'; // Vermelha
};
```

### 3. Exibição no Card

As etiquetas são exibidas no canto superior direito do card de cada application:

```typescript
<Space size="small">
  {application.overallScore !== undefined && (
    <Tag color={getAdherenceColor(application.overallScore)}>
      {getAdherenceLevel(application.overallScore)}
    </Tag>
  )}
  {application.aiScore !== undefined && (
    <Tag color={getScoreColor(application.aiScore)}>
      {formatScore(application.aiScore)}
    </Tag>
  )}
</Space>
```

## Como Testar

### 1. Criar uma Aplicação com Currículo

```bash
# 1. Criar aplicação
curl -X POST http://localhost:3000/applications \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "JOB_ID_AQUI",
    "firstName": "João",
    "lastName": "Silva",
    "email": "joao@email.com"
  }'

# 2. Criar currículo (dispara avaliação automática)
curl -X POST http://localhost:3000/resumes/APPLICATION_ID_AQUI \
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
    ]
  }'
```

### 2. Verificar no Frontend

1. Acesse a lista de vagas
2. Clique em "Candidatos" para uma vaga publicada
3. Observe as etiquetas coloridas nos cards dos candidatos

## Exemplos de Etiquetas

- **🔵 Muito alta** (score >= 90): Candidato ideal para a vaga
- **🔷 Alta** (score >= 70): Candidato com boa qualificação
- **🟡 Média** (score >= 50): Candidato com qualificação moderada
- **🔴 Baixa** (score < 50): Candidato com baixa qualificação

## Benefícios

1. **Visualização Rápida**: Identificação imediata do nível de aderência
2. **Tomada de Decisão**: Facilita a priorização de candidatos
3. **UX Melhorada**: Interface intuitiva com cores significativas
4. **Consistência**: Padrão visual claro e consistente

## Notas Técnicas

- As etiquetas só aparecem quando há `overallScore` disponível
- O score é calculado automaticamente pelo AI Service
- As cores seguem o padrão do Ant Design
- A etiqueta de aderência aparece junto com o score AI (quando disponível)
