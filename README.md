# Cognitive ATS - Sistema de Recrutamento Inteligente

Este projeto é composto por múltiplos serviços organizados de forma modular para facilitar o desenvolvimento e manutenção.

## Estrutura do Projeto

```
cognitive-ats/
├── companies-service/          # Serviço de Gestão de Empresas
│   ├── backend/              # API NestJS para empresas
│   └── frontend/             # Interface React para empresas
├── ai-service/               # Serviço de IA (FastAPI)
├── docker-compose.yml        # Orquestração dos serviços
└── README-Docker.md         # Documentação Docker
```

## Serviços

### Companies Service
Serviço dedicado à gestão de empresas, usuários, departamentos e vagas.

- **Backend**: API REST em NestJS com autenticação JWT
- **Frontend**: Interface React com Ant Design
- **Funcionalidades**: 
  - Gestão de empresas
  - Gestão de usuários e perfis
  - Gestão de departamentos
  - Criação e gestão de vagas
  - Upload de currículos (S3 via LocalStack)
  - Integração com IA para criação de vagas

### AI Service
Serviço de inteligência artificial para auxiliar na criação de vagas e processos de recrutamento.

- **Tecnologia**: FastAPI
- **Funcionalidades**:
  - Geração de descrições de vagas
  - Criação de perguntas para candidatos
  - Definição de etapas do processo seletivo

## Como Executar

### Pré-requisitos
- Docker e Docker Compose
- Node.js (para desenvolvimento local)

### Execução com Docker
```bash
# Executar todos os serviços
docker-compose up -d

# Configurar LocalStack (primeira execução)
./scripts/setup-localstack.sh

# Acessar os serviços:
# - Frontend: http://localhost:8080
# - Backend: http://localhost:3000
# - AI Service: http://localhost:8000
# - LocalStack: http://localhost:4566

### Proxy Reverso (Caddy)
O projeto inclui um proxy reverso configurado com Caddy que permite acesso organizado através de subdomínios:

```bash
# URLs com Caddy (após docker-compose up -d):
# - Frontend empresas: http://gupy.admin.localhost
# - Backend empresas: http://gupy.api.localhost  
# - AI Service: http://ai.localhost
```

Para mais detalhes sobre o Caddy, consulte [CADDY_README.md](./CADDY_README.md).
```

### Desenvolvimento Local
```bash
# Companies Service - Backend
cd companies-service/backend
npm install
npm run start:dev

# Companies Service - Frontend
cd companies-service/frontend
npm install
npm run dev

# AI Service
cd ai-service
pip install -r requirements.txt
python main.py
```

## Próximos Serviços

A estrutura está preparada para adicionar novos serviços como:
- **applications-service**: Gestão de candidaturas
- **notifications-service**: Sistema de notificações
- **analytics-service**: Análises e relatórios

## Configuração de Ambiente

Copie o arquivo `.env.example` para `.env` e configure as variáveis necessárias:

```bash
# Para o AI Service
OPENAI_API_KEY=sua_chave_aqui
ANTHROPIC_API_KEY=sua_chave_aqui
```

## Contribuição

1. Faça fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request 