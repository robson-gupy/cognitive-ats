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

- **Frontend:** http://localhost:8080
- **Backend:** http://localhost:3000
- **AI Service:** http://localhost:8000
- **API via Frontend:** http://localhost:8080/api/ (proxy configurado no nginx)

## Configurações

### Backend (NestJS)
- Porta: 3000
- Framework: NestJS
- Linguagem: TypeScript

### Frontend (React)
- Porta: 8080
- Framework: React + Vite
- Servidor: Nginx
- Proxy configurado para API

### AI Service (FastAPI)
- Porta: 8000
- Framework: FastAPI
- Linguagem: Python
- Providers suportados: OpenAI, Anthropic

## Configuração de Variáveis de Ambiente

Para o AI Service funcionar corretamente, você precisa configurar as chaves de API dos providers de IA. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```bash
# Configurações do AI Service
DEFAULT_AI_PROVIDER=openai
OPENAI_API_KEY=sk-sua-chave-openai-aqui
ANTHROPIC_API_KEY=sk-ant-sua-chave-anthropic-aqui
```

### Providers Suportados

- **OpenAI**: Requer `OPENAI_API_KEY`
- **Anthropic**: Requer `ANTHROPIC_API_KEY`

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

O docker-compose.yml está configurado para não persistir dados. Se precisar de persistência (ex: banco de dados), adicione volumes na seção `volumes` do docker-compose.yml.

## Troubleshooting

1. **Porta já em uso:**
   - Altere as portas no docker-compose.yml
   - Ou pare outros serviços que estejam usando as portas 80 e 3000

2. **Erro de build:**
   - Verifique se todos os arquivos estão presentes
   - Execute `docker-compose build --no-cache` para rebuild completo

3. **Problemas de rede:**
   - Verifique se a rede `cognitive-ats-network` foi criada
   - Execute `docker network prune` se necessário

4. **Porta já em uso:**
   - Altere as portas no docker-compose.yml
   - Ou pare outros serviços que estejam usando as portas 8080 e 3000 