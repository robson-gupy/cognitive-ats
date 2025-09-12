# Cognitive ATS - Docker Setup

Este projeto inclui configuração Docker para executar tanto o backend (NestJS) quanto o frontend (React) da aplicação Cognitive ATS.

## Estrutura do Projeto

```
cognitive-ats/
├── back/                 # Backend NestJS
│   ├── Dockerfile
│   └── .dockerignore
├── front/               # Frontend React
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .dockerignore
├── ai-service/          # AI Service (FastAPI)
│   ├── Dockerfile
│   └── requirements.txt
└── docker-compose.yml   # Orquestração dos serviços
```

## Como Executar

### Pré-requisitos

- Docker
- Docker Compose

### Comandos

1. **Construir e iniciar todos os serviços:**
   ```bash
   docker-compose up --build
   ```

2. **Executar em background:**
   ```bash
   docker-compose up -d --build
   ```

3. **Parar os serviços:**
   ```bash
   docker-compose down
   ```

4. **Ver logs:**
   ```bash
   docker-compose logs -f
   ```

5. **Reconstruir apenas um serviço:**
   ```bash
   docker-compose up --build back       # Apenas backend
   docker-compose up --build front      # Apenas frontend
   docker-compose up --build ai-service # Apenas AI service
   ```

## Acessos

### Desenvolvimento Local (sem Caddy)
- **Frontend:** http://localhost:8080
- **Backend:** http://localhost:3000
- **AI Service:** http://localhost:8000
- **Candidates Service:** http://localhost:3002
- **MinIO Console:** http://localhost:9001
- **MinIO API:** http://localhost:9000
- **Redis:** localhost:6379

### Desenvolvimento com Caddy (Proxy Reverso)
- **Frontend:** http://gupy.localhost (ou slug-da-empresa.localhost)
- **Backend:** http://gupy.localhost/api (ou slug-da-empresa.localhost/api)
- **AI Service:** http://ai.localhost
- **Candidates Service:** http://candidates.localhost

### Portas dos Containers
- **Caddy:** 80 (HTTP) e 443 (HTTPS)
- **Frontend:** 5173 (interno)
- **Backend:** 3000 (interno)
- **AI Service:** 8000 (interno)
- **Candidates Service:** 3002 (interno)
- **MinIO Console:** 9001 (interno)
- **MinIO API:** 9000 (interno)
- **PostgreSQL:** 5432 (interno)
- **Redis:** 6379 (interno)

## Configurações

### Backend (NestJS)
- Porta: 3000
- Framework: NestJS
- Linguagem: TypeScript
- Banco: PostgreSQL

### Frontend (React)
- Porta: 5173 (container) / 8080 (host)
- Framework: React + Vite
- Servidor: Vite Dev Server (desenvolvimento)
- Proxy configurado via Caddy para API

### Candidates Service (NestJS + React SSR)
- Porta: 3002
- Framework: NestJS + React
- Linguagem: TypeScript
- SSR: React Server-Side Rendering

### Caddy (Proxy Reverso)
- Porta: 80 (HTTP) e 443 (HTTPS)
- Roteamento baseado em path para backend (/api/*)
- Roteamento direto para frontend (/*)
- Suporte a múltiplos subdomínios de empresas

### AI Service (FastAPI)
- Porta: 8000
- Framework: FastAPI
- Linguagem: Python
- Providers suportados: OpenAI, Anthropic

### MinIO (S3 Compatible Storage)
- Porta API: 9000
- Porta Console: 9001
- Usuário padrão: minioadmin
- Senha padrão: minioadmin
- Bucket padrão: cognitive-ats-uploads

### PostgreSQL Database
- Porta: 5432
- Usuário: postgres
- Senha: postgres
- Database: cognitive_ats

### Redis (Message Queue)
- Porta: 6379
- Persistência: AOF (Append Only File)
- Uso: Filas de mensagens para tarefas assíncronas

### Async Task Service Consumer
- Framework: Python
- Função: Consumidor de filas Redis
- Filas: send-email-queue, close-job-queue
- Hot-reload: Montagem de código para desenvolvimento

## Configuração de Variáveis de Ambiente

Para o projeto funcionar corretamente, você precisa configurar as variáveis de ambiente. Copie o arquivo `config/env.example` para `.env` na raiz do projeto e ajuste os valores conforme necessário:

```bash
cp config/env.example .env
```

### Variáveis Principais

#### 🗄️ **PostgreSQL Database**
```bash
POSTGRES_DB=cognitive_ats
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432
```

#### 🏢 **Companies Service - Backend**
```bash
NODE_ENV=development
COMPANIES_BACKEND_PORT=3000
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=cognitive_ats
DB_DATABASE=cognitive_ats
AI_SERVICE_URL=http://ai-service:8000
ENDPOINT_URL=http://minio:9000
```

#### 🎨 **Companies Service - Frontend**
```bash
COMPANIES_FRONTEND_PORT=8080
```

#### 👥 **Candidates Service**
```bash
CANDIDATES_SERVICE_PORT=3002
```

#### 🤖 **AI Service**
```bash
AI_SERVICE_PORT=8000
DEFAULT_AI_PROVIDER=openai
OPENAI_API_KEY=sua_chave_openai_aqui
ANTHROPIC_API_KEY=sua_chave_anthropic_aqui
DEFAULT_MODEL=gpt-4
DEFAULT_MAX_TOKENS=1000
DEFAULT_TEMPERATURE=0.7
REQUEST_TIMEOUT=30
```

#### ☁️ **AWS / MinIO Configuration**
```bash
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_REGION=us-east-1
AWS_DEFAULT_REGION=us-east-1
```

#### 📁 **S3 Configuration (MinIO)**
```bash
RESUMES_BUCKET_NAME=cognitive-ats-uploads
```

#### 📨 **SQS Configuration (Redis - Migração)**
```bash
APPLICATIONS_SQS_QUEUE_NAME=applications-queue
QUESTION_RESPONSES_SQS_QUEUE_NAME=question-responses-queue
```

#### 🔐 **JWT Configuration**
```bash
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
```

#### 🔴 **Redis Configuration**
```bash
REDIS_PORT=6379
REDIS_URL=redis://redis:6379/0
```

#### ⚡ **Async Task Service Configuration**
```bash
QUEUES_NAMES=send-email-queue,close-job-queue
LOG_LEVEL=INFO
BLPOP_TIMEOUT_SECONDS=5
```

#### 🌐 **Caddy Proxy Reverse**
```bash
CADDY_PORT_HTTP=80
CADDY_PORT_HTTPS=443
```

### Providers de IA Suportados

- **OpenAI**: Requer `OPENAI_API_KEY`
- **Anthropic**: Requer `ANTHROPIC_API_KEY`

### ⚠️ **Importante**

1. **Chaves de API**: Configure suas chaves reais dos providers de IA
2. **JWT Secret**: Use uma string segura e única para produção
3. **Senhas**: Altere as senhas padrão para ambientes de produção
4. **MinIO**: As credenciais padrão são `minioadmin/minioadmin` para desenvolvimento

## Desenvolvimento

Para desenvolvimento local sem Docker:

### Backend
```bash
cd back
npm install
npm run start:dev
```

### Frontend
```bash
cd front
npm install
npm run dev
```

### AI Service
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Volumes e Persistência

O docker-compose.yml está configurado com volumes persistentes para os seguintes serviços:

### Volumes Configurados
- **postgres_data**: Dados do PostgreSQL
- **minio_data**: Arquivos do MinIO (S3)
- **redis_data**: Dados do Redis (AOF)
- **caddy_data**: Dados do Caddy
- **caddy_config**: Configurações do Caddy

### Localização dos Volumes
Os volumes são gerenciados pelo Docker e ficam armazenados em:
- **Linux**: `/var/lib/docker/volumes/`
- **macOS**: `~/Library/Containers/com.docker.docker/Data/vms/0/data/docker/volumes/`
- **Windows**: `C:\ProgramData\docker\volumes\`

### Backup e Restore
Para fazer backup dos dados:
```bash
# Backup do PostgreSQL
docker exec cognitive-ats-postgres pg_dump -U postgres cognitive_ats > backup.sql

# Backup do MinIO (via mc client)
docker run --rm -v minio_data:/data alpine tar czf - /data > minio-backup.tar.gz

# Backup do Redis
docker exec cognitive-ats-redis redis-cli BGSAVE
docker cp cognitive-ats-redis:/data/dump.rdb ./redis-backup.rdb
```

## Troubleshooting

1. **Porta já em uso:**
   - Altere as portas no docker-compose.yml
   - Ou pare outros serviços que estejam usando as portas 80, 3000, 8000, 9000, 9001, 6379

2. **Erro de build:**
   - Verifique se todos os arquivos estão presentes
   - Execute `docker-compose build --no-cache` para rebuild completo

3. **Problemas de rede:**
   - Verifique se a rede `cognitive-ats-network` foi criada
   - Execute `docker network prune` se necessário

4. **MinIO não acessível:**
   - Verifique se o container está rodando: `docker ps`
   - Acesse o console em http://localhost:9001
   - Credenciais padrão: minioadmin/minioadmin

5. **PostgreSQL connection refused:**
   - Verifique se o container postgres está rodando
   - Teste a conexão: `docker exec -it cognitive-ats-postgres psql -U postgres -d cognitive_ats`

6. **AI Service não responde:**
   - Verifique se as chaves de API estão configuradas no .env
   - Teste o endpoint: `curl http://localhost:8000/health`

7. **Caddy não roteia corretamente:**
   - Verifique o Caddyfile em `config/Caddyfile`
   - Reinicie o container: `docker-compose restart caddy-proxy`

8. **Redis não conecta:**
   - Verifique se o container está rodando: `docker ps`
   - Teste a conexão: `docker exec -it cognitive-ats-redis redis-cli ping`
   - Verifique os logs: `docker logs cognitive-ats-redis`

9. **Async Task Consumer não processa filas:**
   - Verifique se o Redis está rodando
   - Verifique os logs: `docker logs cognitive-ats-async-task-consumer`
   - Teste a conexão Redis: `docker exec -it cognitive-ats-redis redis-cli ping` 