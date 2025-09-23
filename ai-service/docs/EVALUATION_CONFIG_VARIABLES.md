# Configurações de Avaliação - Variáveis de Ambiente

O AI Service agora suporta variáveis de ambiente contextualizadas para configuração de avaliação de candidatos.

## Variáveis de Ambiente

### EVALUATION_PROVIDER
- **Descrição**: Define o provider de IA a ser usado para avaliação de candidatos
- **Padrão**: Valor de `DEFAULT_AI_PROVIDER` (geralmente "openai")
- **Exemplo**: `EVALUATION_PROVIDER=anthropic`

### EVALUATION_MODEL
- **Descrição**: Define o modelo específico a ser usado para avaliação de candidatos
- **Padrão**: Valor de `DEFAULT_MODEL` se não definido
- **Exemplo**: `EVALUATION_MODEL=gpt-4-turbo`

## Lógica de Configuração

### Provider de Avaliação
```python
# Prioridade: EVALUATION_PROVIDER -> DEFAULT_AI_PROVIDER
provider_name = os.getenv("EVALUATION_PROVIDER", Config.DEFAULT_AI_PROVIDER)
```

### Modelo de Avaliação
```python
# Prioridade: EVALUATION_MODEL -> DEFAULT_MODEL
evaluation_model = os.getenv("EVALUATION_MODEL")
if evaluation_model:
    model = evaluation_model
else:
    model = Config.DEFAULT_MODEL
```

## Exemplos de Uso

### Configuração Básica
```bash
# Usar OpenAI com GPT-4 para avaliação
export EVALUATION_PROVIDER=openai
export EVALUATION_MODEL=gpt-4-turbo
```

### Configuração Alternativa
```bash
# Usar Anthropic com Claude para avaliação
export EVALUATION_PROVIDER=anthropic
export EVALUATION_MODEL=claude-3-sonnet-20240229
```

### Configuração Mista
```bash
# Provider personalizado, modelo padrão
export EVALUATION_PROVIDER=google
# EVALUATION_MODEL não definido - usará DEFAULT_MODEL
```

## Logs Esperados

### Com variáveis de ambiente definidas:
```
🔧 Usando provider para avaliação: anthropic
🤖 Usando modelo para avaliação: claude-3-sonnet-20240229
✅ Avaliação concluída com sucesso
📊 Scores finais:
   - Geral: 85/100
   - Respostas: 78/100
   - Formação: 92/100
   - Experiência: 88/100
🔧 Configuração usada: anthropic + claude-3-sonnet-20240229
```

### Com fallback para configurações padrão:
```
🔧 Usando provider para avaliação: openai
🤖 Usando modelo para avaliação: gpt-4.1-2025-04-14
✅ Avaliação concluída com sucesso
📊 Scores finais:
   - Geral: 85/100
   - Respostas: 78/100
   - Formação: 92/100
   - Experiência: 88/100
🔧 Configuração usada: openai + gpt-4.1-2025-04-14
```

## Resposta da API

A resposta do endpoint de avaliação agora inclui os campos `provider` e `model`:

```json
{
  "overall_score": 85,
  "question_responses_score": 78,
  "education_score": 92,
  "experience_score": 88,
  "provider": "anthropic",
  "model": "claude-3-sonnet-20240229"
}
```

### Novos Campos:
- **`provider`**: Provider de IA usado para a avaliação
- **`model`**: Modelo específico usado para a avaliação

## Vantagens

### ✅ Separação de Contexto
- **Avaliação vs. Outras funcionalidades**: Configurações específicas para avaliação
- **Flexibilidade**: Diferentes modelos para diferentes tarefas

### ✅ Configuração Granular
- **Provider independente**: Pode usar diferente provider para avaliação
- **Modelo específico**: Modelo otimizado para avaliação de candidatos

### ✅ Fallback Inteligente
- **Configurações padrão**: Usa DEFAULT_AI_PROVIDER e DEFAULT_MODEL se não definido
- **Compatibilidade**: Mantém funcionamento mesmo sem configurações específicas

### ✅ Logs Informativos
- **Transparência**: Mostra qual configuração está sendo usada
- **Debug**: Facilita identificação de problemas de configuração

### ✅ Rastreabilidade
- **Resposta Completa**: Inclui provider e model na resposta da API
- **Auditoria**: Permite rastrear qual configuração foi usada para cada avaliação
- **Consistência**: Garante que o cliente saiba exatamente qual IA foi usada

## Compatibilidade

- ✅ **Backward Compatible**: Funciona sem as novas variáveis de ambiente
- ✅ **Fallback Seguro**: Usa configurações padrão se não definido
- ✅ **Logs Melhorados**: Mostra configurações específicas de avaliação
- ✅ **Flexibilidade**: Permite configuração granular por contexto
- ✅ **Resposta Enriquecida**: Inclui provider e model na resposta da API
- ⚠️ **Breaking Change**: Novos campos obrigatórios na resposta (provider, model)
