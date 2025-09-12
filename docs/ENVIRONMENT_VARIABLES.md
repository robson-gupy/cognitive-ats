# 🔧 Variáveis de Ambiente - Cognitive ATS

Este documento descreve todas as variáveis de ambiente necessárias para executar o projeto Cognitive ATS.

## 📋 Configuração Inicial

1. Copie o arquivo de exemplo:
   ```bash
   cp config/env.example .env
   ```

2. Edite o arquivo `.env` com suas configurações específicas

## 🗂️ Categorias de Variáveis

### 🗄️ **PostgreSQL Database**
Configurações do banco de dados principal.

| Variável | Descrição | Valor Padrão | Obrigatória |
|----------|-----------|--------------|-------------|
| `POSTGRES_DB` | Nome do banco de dados | `cognitive_ats` | ✅ |
| `POSTGRES_USER` | Usuário do PostgreSQL | `postgres` | ✅ |
| `POSTGRES_PASSWORD` | Senha do PostgreSQL | `postgres` | ✅ |
| `POSTGRES_PORT` | Porta do PostgreSQL | `5432` | ✅ |

### 🏢 **Companies Service - Backend**
Configurações do serviço backend das empresas.

| Variável | Descrição | Valor Padrão | Obrigatória |
|----------|-----------|--------------|-------------|
| `NODE_ENV` | Ambiente Node.js | `development` | ✅ |
| `COMPANIES_BACKEND_PORT` | Porta do backend | `3000` | ✅ |
| `DB_HOST` | Host do banco de dados | `postgres` | ✅ |
| `DB_PORT` | Porta do banco de dados | `5432` | ✅ |
| `DB_USERNAME` | Usuário do banco | `postgres` | ✅ |
| `DB_PASSWORD` | Senha do banco | `postgres` | ✅ |
| `DB_NAME` | Nome do banco | `cognitive_ats` | ✅ |
| `DB_DATABASE` | Nome do banco (alias) | `cognitive_ats` | ✅ |
| `AI_SERVICE_URL` | URL do serviço de IA | `http://ai-service:8000` | ✅ |
| `ENDPOINT_URL` | URL do MinIO | `http://minio:9000` | ✅ |

### 🎨 **Companies Service - Frontend**
Configurações do frontend das empresas.

| Variável | Descrição | Valor Padrão | Obrigatória |
|----------|-----------|--------------|-------------|
| `COMPANIES_FRONTEND_PORT` | Porta do frontend | `8080` | ✅ |

### 👥 **Candidates Service**
Configurações do serviço de candidatos.

| Variável | Descrição | Valor Padrão | Obrigatória |
|----------|-----------|--------------|-------------|
| `CANDIDATES_SERVICE_PORT` | Porta do serviço | `3002` | ✅ |

### 🤖 **AI Service**
Configurações do serviço de inteligência artificial.

| Variável | Descrição | Valor Padrão | Obrigatória |
|----------|-----------|--------------|-------------|
| `AI_SERVICE_PORT` | Porta do serviço | `8000` | ✅ |
| `DEFAULT_AI_PROVIDER` | Provider padrão | `openai` | ✅ |
| `OPENAI_API_KEY` | Chave da API OpenAI | - | ✅ |
| `ANTHROPIC_API_KEY` | Chave da API Anthropic | - | ✅ |
| `DEFAULT_MODEL` | Modelo padrão | `gpt-4` | ✅ |
| `DEFAULT_MAX_TOKENS` | Tokens máximos | `1000` | ✅ |
| `DEFAULT_TEMPERATURE` | Temperatura | `0.7` | ✅ |
| `REQUEST_TIMEOUT` | Timeout das requisições | `30` | ✅ |

### ☁️ **AWS / MinIO Configuration**
Configurações para compatibilidade com AWS S3 via MinIO.

| Variável | Descrição | Valor Padrão | Obrigatória |
|----------|-----------|--------------|-------------|
| `AWS_ACCESS_KEY_ID` | Chave de acesso | `minioadmin` | ✅ |
| `AWS_SECRET_ACCESS_KEY` | Chave secreta | `minioadmin` | ✅ |
| `AWS_REGION` | Região AWS | `us-east-1` | ✅ |
| `AWS_DEFAULT_REGION` | Região padrão | `us-east-1` | ✅ |

### 📁 **S3 Configuration (MinIO)**
Configurações específicas do MinIO.

| Variável | Descrição | Valor Padrão | Obrigatória |
|----------|-----------|--------------|-------------|
| `RESUMES_BUCKET_NAME` | Nome do bucket | `cognitive-ats-uploads` | ✅ |

### 📨 **SQS Configuration (Redis - Migração)**
Configurações das filas de mensagens.

| Variável | Descrição | Valor Padrão | Obrigatória |
|----------|-----------|--------------|-------------|
| `APPLICATIONS_SQS_QUEUE_NAME` | Fila de aplicações | `applications-queue` | ✅ |
| `QUESTION_RESPONSES_SQS_QUEUE_NAME` | Fila de respostas | `question-responses-queue` | ✅ |

### 🔐 **JWT Configuration**
Configurações de autenticação JWT.

| Variável | Descrição | Valor Padrão | Obrigatória |
|----------|-----------|--------------|-------------|
| `JWT_SECRET` | Chave secreta JWT | - | ✅ |

### 🌐 **Caddy Proxy Reverse**
Configurações do proxy reverso.

| Variável | Descrição | Valor Padrão | Obrigatória |
|----------|-----------|--------------|-------------|
| `CADDY_PORT_HTTP` | Porta HTTP | `80` | ✅ |
| `CADDY_PORT_HTTPS` | Porta HTTPS | `443` | ✅ |

## 🔑 **Chaves de API Necessárias**

### OpenAI
- **Variável**: `OPENAI_API_KEY`
- **Formato**: `sk-...`
- **Onde obter**: [OpenAI Platform](https://platform.openai.com/api-keys)

### Anthropic
- **Variável**: `ANTHROPIC_API_KEY`
- **Formato**: `sk-ant-...`
- **Onde obter**: [Anthropic Console](https://console.anthropic.com/)

## ⚠️ **Importante para Produção**

### Segurança
1. **JWT Secret**: Use uma string longa e aleatória
2. **Senhas**: Altere todas as senhas padrão
3. **Chaves de API**: Mantenha as chaves seguras e não as commite no Git

### Exemplo de JWT Secret Seguro
```bash
# Gere uma chave segura
openssl rand -base64 64
```

### Variáveis Sensíveis
As seguintes variáveis contêm informações sensíveis e devem ser protegidas:
- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

## 🚀 **Ambientes**

### Desenvolvimento
- Use os valores padrão do `env.example`
- Configure apenas as chaves de API necessárias
- MinIO usa credenciais padrão para facilitar o desenvolvimento

### Produção
- Altere todas as senhas padrão
- Use chaves de API de produção
- Configure JWT secret seguro
- Use banco de dados e storage de produção

## 🔍 **Verificação de Configuração**

Para verificar se todas as variáveis estão configuradas corretamente:

```bash
# Verificar se o arquivo .env existe
ls -la .env

# Verificar variáveis específicas
echo $OPENAI_API_KEY
echo $JWT_SECRET

# Testar conexão com banco
docker exec cognitive-ats-postgres psql -U postgres -d cognitive_ats -c "SELECT 1;"

# Testar MinIO
curl http://localhost:9000/minio/health/live
```

## 📚 **Referências**

- [Docker Compose Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [MinIO Documentation](https://docs.min.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
