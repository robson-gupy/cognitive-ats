# Busca Vetorial de Vagas

Este documento explica como usar a funcionalidade de busca vetorial implementada para vagas (jobs) no sistema.

## Visão Geral

A busca vetorial permite encontrar vagas com base na similaridade semântica, combinando:
- **Título da vaga** (title)
- **Descrição da vaga** (description) 
- **Nome do departamento** (department.name)

## Configuração

### 1. Extensão pgvector

A migration `1758989864000-AddVectorSearchToJobs.ts` habilita automaticamente a extensão pgvector no PostgreSQL.

### 2. Estrutura do Banco

- **Coluna**: `search_embedding` (TEXT)
- **Tipo**: Armazena vetor de embedding como JSON string
- **Dimensões**: 1536 (padrão OpenAI)
- **Índices**: Criados para busca eficiente com cosine similarity e L2 distance

## Endpoints Disponíveis

### 1. Atualizar Embedding de uma Vaga

```http
POST /jobs/{id}/update-embedding
Authorization: Bearer {token}
```

**Descrição**: Gera e atualiza o embedding vetorial para uma vaga específica.

**Resposta**: Vaga atualizada com o novo embedding.

### 2. Atualizar Embeddings de Todas as Vagas

```http
POST /jobs/update-all-embeddings
Authorization: Bearer {token}
```

**Descrição**: Atualiza o embedding de todas as vagas da empresa do usuário.

**Resposta**:
```json
{
  "updated": 15,
  "errors": 0
}
```

### 3. Busca Vetorial Interna

```http
GET /jobs/search?q={query}&limit={limit}&threshold={threshold}
Authorization: Bearer {token}
```

**Parâmetros**:
- `q` (obrigatório): Texto de busca
- `limit` (opcional): Número máximo de resultados (padrão: 10)
- `threshold` (opcional): Limite de similaridade 0-1 (padrão: 0.8)

**Exemplo**:
```http
GET /jobs/search?q=desenvolvedor python&limit=5&threshold=0.8
```

**Resposta**: Array de vagas ordenadas por similaridade.

## Como Usar

### 1. Primeira Configuração

Após executar a migration, gere embeddings para as vagas existentes:

```bash
# Atualizar todas as vagas da empresa
POST /jobs/update-all-embeddings
```

### 2. Atualização Automática

Para novas vagas ou atualizações, chame:

```bash
# Atualizar vaga específica
POST /jobs/{jobId}/update-embedding
```

### 3. Busca Semântica

```bash
# Buscar vagas relacionadas a "desenvolvedor frontend"
GET /jobs/search?q=desenvolvedor frontend

# Buscar com filtros mais restritivos
GET /jobs/search?q=engenheiro de dados&limit=3&threshold=0.9

### 4. Busca Vetorial Pública

```http
GET /public/{companySlug}/jobs?q={query}&departments={deptIds}&limit={limit}&threshold={threshold}
```

**Exemplo**:
```http
GET /public/minha-empresa/jobs?q=desenvolvedor python&departments=dept1,dept2&limit=5&threshold=0.8
```
```

## Algoritmo de Similaridade

O sistema usa **similaridade coseno** para comparar vetores:

```
similarity = (A · B) / (||A|| × ||B||)
```

Onde:
- A = vetor de embedding da query
- B = vetor de embedding da vaga
- · = produto escalar
- || || = norma do vetor

## Configuração do AI Service

O sistema espera que o AI Service tenha um endpoint:

```http
POST /embeddings/generate
Content-Type: application/json

{
  "text": "texto para gerar embedding",
  "provider": "openai", // opcional
  "model": "text-embedding-ada-002" // opcional
}
```

**Resposta esperada**:
```json
{
  "embedding": [0.1, 0.2, 0.3, ...], // array de 1536 números
  "provider": "openai",
  "model": "text-embedding-ada-002"
}
```

## Performance

### Índices Criados

1. **Cosine Similarity**: `idx_jobs_search_embedding_cosine`
2. **L2 Distance**: `idx_jobs_search_embedding_l2`

### Otimizações

- Embeddings são armazenados como JSON string para compatibilidade
- Conversão automática entre array e string
- Filtros por empresa e status de vaga
- Limite configurável de resultados

## Troubleshooting

### Erro: "Erro ao gerar embedding"

1. Verifique se o AI Service está rodando
2. Confirme a variável `AI_SERVICE_URL`
3. Teste o endpoint `/embeddings/generate` diretamente

### Erro: "Vaga não encontrada"

1. Verifique se a vaga pertence à empresa do usuário
2. Confirme se o ID da vaga está correto

### Resultados de busca vazios

1. Verifique se as vagas têm embeddings gerados
2. Tente reduzir o threshold (ex: 0.5)
3. Confirme se há vagas publicadas

## Exemplo Completo

```typescript
// 1. Gerar embedding para uma vaga
const job = await jobsService.updateJobEmbedding('job-id', user);

// 2. Buscar vagas similares
const similarJobs = await jobsService.searchJobsByVector(
  'desenvolvedor full stack',
  user,
  5, // limite
  0.8 // threshold
);

// 3. Atualizar todas as vagas da empresa
const result = await jobsService.updateAllJobEmbeddings(user);
console.log(`Atualizadas: ${result.updated}, Erros: ${result.errors}`);
```
