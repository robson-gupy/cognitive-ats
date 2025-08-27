# Atualização Direta de Scores no Banco de Dados

Este documento descreve a funcionalidade implementada para permitir que o `ai-service` faça atualizações diretamente na tabela `applications` do banco de dados do `companies-service`.

## 🎯 Objetivo

Permitir que o `ai-service` atualize diretamente os scores de applications no banco de dados PostgreSQL, especificamente os campos:
- `overall_score`
- `education_score` 
- `experience_score`

## 🏗️ Arquitetura

### Componentes Principais

1. **`DatabaseService`** (`consumer/services/database_service.py`)
   - Gerencia conexão direta com PostgreSQL
   - Executa queries SQL para atualização
   - Pool de conexões para performance

2. **`ApplicationsService`** (`consumer/services/applications_service.py`)
   - Interface de alto nível para operações com applications
   - Validação de dados
   - Integração com resultados de IA

3. **Configurações** (`consumer/config/settings.py`)
   - Parâmetros de conexão com banco
   - Variáveis de ambiente configuráveis

## 🔧 Configuração

### Variáveis de Ambiente

Adicione as seguintes variáveis ao arquivo `.env`:

```bash
# Configurações do Banco de Dados
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=cognitive_ats
```

### Dependências

Instale a dependência necessária:

```bash
pip install asyncpg==0.29.0
```

## 📖 Como Usar

### 1. Atualização Direta de Scores

```python
from consumer.services.applications_service import applications_service

# Atualizar scores específicos
result = await applications_service.update_application_scores(
    application_id="uuid-da-application",
    overall_score=8.5,
    education_score=9.0,
    experience_score=7.8
)

if result['success']:
    print("✅ Scores atualizados com sucesso!")
else:
    print(f"❌ Erro: {result['error']}")
```

### 2. Atualização Baseada em Resultado de IA

```python
# Resultado de avaliação de IA
ai_result = {
    'overall_score': 8.2,
    'education_score': 8.8,
    'experience_score': 7.5,
    'confidence': 0.85
}

# Atualizar scores baseado no resultado da IA
result = await applications_service.update_scores_from_ai_evaluation(
    application_id="uuid-da-application",
    ai_evaluation_result=ai_result
)
```

### 3. Busca de Application

```python
# Buscar application por ID
application = await applications_service.get_application_by_id("uuid-da-application")

if application:
    print(f"Overall Score: {application['overall_score']}")
    print(f"Education Score: {application['education_score']}")
    print(f"Experience Score: {application['experience_score']}")
```

## 🧪 Testando

Execute o script de teste para verificar a funcionalidade:

```bash
cd ai-service
python test_database_update.py
```

**⚠️ Importante:** Substitua `"test-application-id"` por um ID real de application antes de executar os testes.

## 🔄 Integração com SQS Consumer

A funcionalidade está integrada ao consumer SQS e pode ser usada para:

1. **Processamento de Mensagens**: Atualizar scores após análise de currículos
2. **Batch Updates**: Processar múltiplas applications em lote
3. **Real-time Updates**: Atualizações imediatas baseadas em resultados de IA

### Exemplo de Uso no Consumer

```python
# No message handler ou orchestrator
async def process_resume_message(message_data):
    # ... processamento do currículo ...
    
    # Após análise de IA, atualizar scores
    if ai_evaluation_result:
        await applications_service.update_scores_from_ai_evaluation(
            application_id=message_data['applicationId'],
            ai_evaluation_result=ai_evaluation_result
        )
```

## 📊 Monitoramento

### Status do Banco

O consumer agora exibe o status da conexão com o banco:

```
📊 Status dos serviços:
   SQS: ✅ Conectado
   Backend: ✅ Disponível
   IA Service: ✅ Inicializado
   Database: ✅ Conectado
```

### Logs

Todas as operações são logadas com detalhes:

```
🔄 Atualizando scores da application abc-123
✅ Scores da application abc-123 atualizados com sucesso
   Overall Score: 8.5
   Education Score: 9.0
   Experience Score: 7.8
```

## 🚀 Performance

- **Pool de Conexões**: Reutiliza conexões para melhor performance
- **Queries Otimizadas**: Usa RETURNING para confirmar atualizações
- **Transações Assíncronas**: Não bloqueia o processamento de mensagens

## 🔒 Segurança

- **Validação de Dados**: Verifica se pelo menos um score foi fornecido
- **Tratamento de Erros**: Captura e loga todos os erros
- **Conexões Seguras**: Usa credenciais configuráveis via variáveis de ambiente

## 🐛 Troubleshooting

### Erro de Conexão

```
❌ Erro ao conectar ao banco: connection refused
```

**Solução**: Verifique se o PostgreSQL está rodando e as credenciais estão corretas.

### Erro de Tabela

```
❌ Erro ao executar query: relation "public.applications" does not exist
```

**Solução**: Verifique se a tabela `applications` existe no schema `public` do banco.

### Erro de Permissão

```
❌ Erro ao executar query: permission denied for table applications
```

**Solução**: Verifique se o usuário do banco tem permissões UPDATE na tabela.

## 📝 Próximos Passos

1. **Métricas**: Adicionar métricas de performance e sucesso
2. **Retry Logic**: Implementar retry automático para falhas de banco
3. **Batch Updates**: Suporte para atualizações em lote
4. **Audit Trail**: Log de todas as alterações para auditoria
