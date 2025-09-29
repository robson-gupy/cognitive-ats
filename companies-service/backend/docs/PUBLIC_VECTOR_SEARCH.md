# Busca Vetorial Pública de Vagas

Este documento explica como usar a funcionalidade de busca vetorial no endpoint público de vagas.

## Visão Geral

O endpoint público `/public/{slug}/jobs` agora suporta busca vetorial semântica com filtros por departamento, permitindo encontrar vagas relevantes baseadas em similaridade de conteúdo.

## Endpoint

```http
GET /public/{companySlug}/jobs
```

## Parâmetros de Query

| Parâmetro | Tipo | Obrigatório | Descrição | Exemplo |
|-----------|------|-------------|-----------|---------|
| `q` | string | Não | Texto de busca para similaridade semântica | `desenvolvedor python` |
| `departments` | string | Não | Lista de IDs de departamentos separados por vírgula | `dept1,dept2,dept3` |
| `limit` | number | Não | Número máximo de resultados (padrão: 10) | `5` |
| `threshold` | number | Não | Limite de similaridade 0-1 (padrão: 0.7) | `0.8` |

## Exemplos de Uso

### 1. Busca Normal (sem filtros)

```http
GET /public/empresa-exemplo/jobs
```

**Resposta**: Todas as vagas publicadas da empresa, ordenadas por data de publicação.

### 2. Busca Vetorial Simples

```http
GET /public/empresa-exemplo/jobs?q=desenvolvedor frontend
```

**Resposta**: Vagas similares a "desenvolvedor frontend" baseadas em similaridade semântica.

### 3. Busca Vetorial com Filtro por Departamentos

```http
GET /public/empresa-exemplo/jobs?q=engenheiro de dados&departments=dept-123,dept-456
```

**Resposta**: Vagas similares a "engenheiro de dados" apenas nos departamentos especificados.

### 4. Busca Vetorial com Parâmetros Avançados

```http
GET /public/empresa-exemplo/jobs?q=analista de sistemas&departments=dept-123&limit=5&threshold=0.9
```

**Resposta**: Máximo 5 vagas com similaridade >= 90% para "analista de sistemas" no departamento especificado.

## Resposta da API

### Estrutura da Resposta

```json
{
  "success": true,
  "data": [
    {
      "id": "job-uuid",
      "title": "Desenvolvedor Frontend Senior",
      "description": "Desenvolvimento de interfaces...",
      "requirements": "React, TypeScript...",
      "expirationDate": "2024-12-31",
      "status": "PUBLISHED",
      "departmentId": "dept-uuid",
      "slug": "desenvolvedor-frontend-senior",
      "publishedAt": "2024-01-15T10:00:00Z",
      "requiresAddress": false,
      "department": {
        "id": "dept-uuid",
        "name": "Tecnologia",
        "description": "Departamento de Tecnologia"
      }
    }
  ],
  "total": 1,
  "companyId": "company-uuid",
  "message": "Vagas encontradas com busca vetorial"
}
```

### Campos da Vaga

- **id**: UUID único da vaga
- **title**: Título da vaga
- **description**: Descrição detalhada
- **requirements**: Requisitos da vaga
- **expirationDate**: Data de expiração (pode ser null)
- **status**: Status da vaga (sempre "PUBLISHED" para endpoint público)
- **departmentId**: ID do departamento (pode ser null)
- **slug**: Slug único da vaga
- **publishedAt**: Data de publicação
- **requiresAddress**: Se requer endereço do candidato
- **department**: Objeto com informações do departamento

## Comportamento da Busca

### 1. Sem Parâmetro `q`
- Retorna todas as vagas publicadas da empresa
- Ordenadas por data de publicação (mais recentes primeiro)
- Ignora filtros de departamento

### 2. Com Parâmetro `q`
- Usa busca vetorial semântica
- Combina título, descrição e nome do departamento
- Aplica filtros de departamento se especificados
- Ordena por similaridade (mais similares primeiro)
- Filtra por threshold de similaridade

### 3. Filtro por Departamentos
- Apenas vagas dos departamentos especificados
- Formato: `departments=id1,id2,id3`
- IDs devem ser UUIDs válidos
- Ignorado se não especificado

## Algoritmo de Similaridade

O sistema usa **similaridade coseno** para comparar vetores de embedding:

```
similarity = (A · B) / (||A|| × ||B||)
```

Onde:
- A = vetor de embedding da query de busca
- B = vetor de embedding da vaga (title + description + department name)
- · = produto escalar
- || || = norma do vetor

## Tratamento de Erros

### 1. Erro na Busca Vetorial
- Se houver erro na geração de embedding ou cálculo de similaridade
- Sistema automaticamente retorna busca normal (sem filtros)
- Log do erro é registrado para debugging

### 2. Empresa Não Encontrada
```json
{
  "statusCode": 404,
  "message": "Empresa com slug empresa-inexistente não encontrada"
}
```

### 3. Slug Inválido
```json
{
  "statusCode": 400,
  "message": "Slug da empresa inválido"
}
```

## Performance

### Otimizações Implementadas

1. **Índice de Embedding**: Índice otimizado para coluna `search_embedding`
2. **Filtro por Status**: Apenas vagas publicadas são consideradas
3. **Filtro por Empresa**: Busca limitada à empresa específica
4. **Limite de Resultados**: Controle de quantidade de resultados
5. **Fallback**: Busca normal em caso de erro

### Recomendações

- Use `limit` para controlar performance
- Ajuste `threshold` baseado na precisão desejada
- Filtre por departamentos para reduzir resultados irrelevantes

## Exemplos Práticos

### Busca por Tecnologia
```bash
curl "https://api.exemplo.com/public/tech-corp/jobs?q=desenvolvedor&departments=tech-dept-id&limit=10"
```

### Busca por Área de Negócio
```bash
curl "https://api.exemplo.com/public/empresa/jobs?q=analista financeiro&threshold=0.8"
```

### Busca Geral com Limite
```bash
curl "https://api.exemplo.com/public/empresa/jobs?q=estágio&limit=5"
```

## Integração Frontend

### JavaScript/TypeScript
```typescript
interface SearchParams {
  q?: string;
  departments?: string;
  limit?: number;
  threshold?: number;
}

async function searchJobs(companySlug: string, params: SearchParams) {
  const queryString = new URLSearchParams();
  
  if (params.q) queryString.set('q', params.q);
  if (params.departments) queryString.set('departments', params.departments);
  if (params.limit) queryString.set('limit', params.limit.toString());
  if (params.threshold) queryString.set('threshold', params.threshold.toString());
  
  const response = await fetch(
    `/public/${companySlug}/jobs?${queryString}`
  );
  
  return response.json();
}

// Exemplo de uso
const jobs = await searchJobs('empresa-exemplo', {
  q: 'desenvolvedor python',
  departments: 'dept-123,dept-456',
  limit: 5,
  threshold: 0.8
});
```

### React Hook
```typescript
import { useState, useEffect } from 'react';

function useJobSearch(companySlug: string, searchQuery?: string) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!companySlug) return;
    
    setLoading(true);
    searchJobs(companySlug, { q: searchQuery })
      .then(setJobs)
      .finally(() => setLoading(false));
  }, [companySlug, searchQuery]);
  
  return { jobs, loading };
}
```
