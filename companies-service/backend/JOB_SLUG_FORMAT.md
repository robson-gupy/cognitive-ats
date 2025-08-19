# Formato de Slugs das Vagas

## Visão Geral

As vagas agora seguem um formato de slug padronizado que inclui o slug da empresa no início, facilitando a identificação e organização das vagas por empresa.

## Formato do Slug

```
{companySlug}-{jobTitleSlug}-{counter}
```

### Componentes

- **`companySlug`**: Slug da empresa (ex: `gupy`, `empresa`, `startup`)
- **`jobTitleSlug`**: Título da vaga convertido para slug (ex: `desenvolvedor-full-stack`)
- **`counter`**: Número sequencial para garantir unicidade (opcional)

## Exemplos

### Empresa: Gupy

| Título da Vaga | Slug Gerado | Descrição |
|----------------|-------------|-----------|
| Desenvolvedor Full Stack | `gupy-desenvolvedor-full-stack` | Primeira vaga com este título |
| Desenvolvedor Full Stack | `gupy-desenvolvedor-full-stack-1` | Segunda vaga com este título |
| Analista de Marketing | `gupy-analista-de-marketing` | Primeira vaga com este título |

### Empresa: Empresa

| Título da Vaga | Slug Gerado | Descrição |
|----------------|-------------|-----------|
| Desenvolvedor Backend | `empresa-desenvolvedor-backend` | Primeira vaga com este título |
| Desenvolvedor Backend | `empresa-desenvolvedor-backend-1` | Segunda vaga com este título |
| Designer UX/UI | `empresa-designer-ux-ui` | Primeira vaga com este título |

## Vantagens

### 1. **Identificação Clara da Empresa**
- Facilita identificar a qual empresa pertence cada vaga
- Melhora a organização e navegação

### 2. **URLs Amigáveis**
- URLs mais descritivas e SEO-friendly
- Exemplo: `/public/gupy/jobs/gupy-desenvolvedor-full-stack`

### 3. **Unicidade Garantida**
- Sistema automático de contadores para evitar conflitos
- Não há risco de slugs duplicados

### 4. **Consistência**
- Formato padronizado para todas as vagas
- Fácil de entender e manter

## Implementação Técnica

### Função de Geração

```typescript
export function generateUniqueJobSlug(
  companySlug: string,
  jobTitle: string,
  existingSlugs: string[] = [],
): string {
  const jobTitleSlug = generateSlug(jobTitle);
  const baseSlug = `${companySlug}-${jobTitleSlug}`;
  
  let counter = 1;
  let uniqueSlug = baseSlug;

  while (existingSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}
```

### Uso no JobsService

```typescript
// Se não foi fornecido um slug, gerar um baseado no título com o slug da empresa
if (!createJobDto.slug) {
  // Buscar o slug da empresa
  const company = await this.companiesService.findOne(user.companyId);
  const companySlug = company.slug;
  
  // Buscar todos os slugs existentes para verificar duplicatas
  const allSlugs = await this.jobsRepository.find({ select: ['slug'] });
  const existingSlugs = allSlugs.map((j) => j.slug);
  
  // Gerar slug único com formato: {companySlug}-{jobTitleSlug}-{counter}
  createJobDto.slug = generateUniqueJobSlug(companySlug, createJobDto.title, existingSlugs);
}
```

## Regras de Geração

### 1. **Conversão do Título**
- Remove acentos e caracteres especiais
- Converte para minúsculas
- Substitui espaços por hífens
- Remove hífens duplicados

### 2. **Validação de Unicidade**
- Verifica se o slug já existe
- Adiciona contador sequencial se necessário
- Garante que cada slug seja único

### 3. **Tratamento de Erros**
- Valida se o slug da empresa existe
- Trata casos de títulos vazios ou inválidos
- Logs para debug e monitoramento

## Migração

### Vagas Existentes
- Vagas criadas antes desta mudança mantêm seus slugs originais
- Novas vagas seguem o novo formato
- Sistema é retrocompatível

### Atualizações
- Quando o título de uma vaga é alterado, o slug é regenerado
- Mantém o formato da empresa original
- Preserva histórico de logs

## Testes

### Cenários de Teste

1. **Criação de Primeira Vaga**
   - Input: Empresa "gupy", Título "Desenvolvedor Full Stack"
   - Output: `gupy-desenvolvedor-full-stack`

2. **Criação de Vaga Duplicada**
   - Input: Empresa "gupy", Título "Desenvolvedor Full Stack"
   - Output: `gupy-desenvolvedor-full-stack-1`

3. **Atualização de Título**
   - Input: Slug existente `gupy-desenvolvedor-full-stack`, Novo título "Desenvolvedor Senior"
   - Output: `gupy-desenvolvedor-senior`

4. **Diferentes Empresas**
   - Input: Empresa "empresa", Título "Desenvolvedor Full Stack"
   - Output: `empresa-desenvolvedor-full-stack`

## Considerações Futuras

### 1. **Cache de Slugs**
- Implementar cache para melhorar performance
- Reduzir consultas ao banco de dados

### 2. **Validação de Formato**
- Adicionar validação de formato nos DTOs
- Garantir consistência na criação

### 3. **Métricas e Monitoramento**
- Logs de geração de slugs
- Métricas de performance
- Alertas para erros

### 4. **Personalização**
- Permitir prefixos/sufixos customizados
- Configuração por empresa
- Templates de slug
