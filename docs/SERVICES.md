# Estrutura de Serviços - Cognitive ATS

## Visão Geral

O projeto Cognitive ATS foi reorganizado em uma arquitetura de microserviços para facilitar o desenvolvimento, manutenção e escalabilidade. Cada serviço tem responsabilidades específicas e pode ser desenvolvido e implantado independentemente.

## Serviços Atuais

### 1. Companies Service
**Localização**: `companies-service/`

Serviço dedicado à gestão de empresas e seus processos internos.

#### Estrutura:
```
companies-service/
├── backend/          # API NestJS
│   ├── src/
│   │   ├── auth/     # Autenticação e autorização
│   │   ├── companies/ # Gestão de empresas
│   │   ├── departments/ # Gestão de departamentos
│   │   ├── jobs/     # Gestão de vagas
│   │   ├── roles/    # Gestão de perfis
│   │   └── users/    # Gestão de usuários
│   └── ...
└── frontend/         # Interface React
    ├── src/
    │   ├── components/ # Componentes React
    │   ├── services/   # Serviços de API
    │   ├── types/      # Tipos TypeScript
    │   └── ...
    └── ...
```

#### Funcionalidades:
- **Gestão de Empresas**: CRUD completo de empresas
- **Gestão de Usuários**: Cadastro, edição e perfil de usuários
- **Gestão de Departamentos**: Organização interna das empresas
- **Gestão de Vagas**: Criação, edição e publicação de vagas
- **Autenticação**: Sistema JWT com diferentes níveis de acesso
- **Integração com IA**: Criação automática de vagas usando IA

### 2. AI Service
**Localização**: `ai-service/`

Serviço de inteligência artificial para auxiliar na criação de conteúdo e processos de recrutamento.

#### Estrutura:
```
ai-service/
├── api/              # API FastAPI
│   ├── main.py       # Aplicação principal
│   ├── models/       # Modelos de dados
│   └── routes/       # Rotas da API
├── core/             # Lógica de negócio
│   ├── ai/           # Serviços de IA
│   ├── jobs/         # Processamento de vagas
│   └── resume/       # Processamento de currículos
├── consumer/         # Consumidor de filas
└── requirements.txt  # Dependências Python
```

#### Funcionalidades:
- **Geração de Descrições**: Criação automática de descrições de vagas
- **Criação de Perguntas**: Geração de perguntas para candidatos
- **Definição de Etapas**: Sugestão de etapas do processo seletivo
- **Múltiplos Provedores**: Suporte a OpenAI e Anthropic
- **Processamento de Currículos**: Análise e extração de dados de currículos

### 3. Candidates Service
**Localização**: `candidates-service/`

Serviço dedicado aos candidatos com interface React SSR.

#### Estrutura:
```
candidates-service/
├── src/
│   ├── modules/      # Módulos NestJS
│   ├── react/        # Componentes React SSR
│   └── main.ts       # Aplicação principal
├── public/           # Arquivos estáticos
└── package.json      # Dependências Node.js
```

#### Funcionalidades:
- **Interface para Candidatos**: Portal de candidatos
- **Aplicação em Vagas**: Sistema de candidatura
- **Visualização de Vagas**: Listagem de vagas públicas
- **SSR**: Server-Side Rendering com React

### 4. Async Task Service
**Localização**: `async-task-service/`

Serviço de processamento assíncrono de tarefas.

#### Estrutura:
```
async-task-service/
├── src/
│   ├── consumer.py   # Consumidor principal
│   ├── handlers/     # Handlers de tarefas
│   └── publish_test_message.py
├── requirements.txt  # Dependências Python
└── docker-compose.yml
```

#### Funcionalidades:
- **Consumo de Filas Redis**: Processamento de mensagens
- **Handlers Específicos**: Processamento por tipo de tarefa
- **Retry Logic**: Sistema de retentativas
- **DLQ**: Dead Letter Queue para falhas

## Arquitetura de Comunicação

### Comunicação entre Serviços:
```
[Companies Frontend] ←→ [Companies Backend] ←→ [AI Service]
         ↓                      ↓                    ↓
[Candidates Service] ←→ [PostgreSQL] ←→ [Redis] ←→ [Async Task Service]
         ↓                      ↓
    [MinIO S3]              [JWT Auth]
```

### Portas e Endpoints:
- **Companies Frontend**: `http://localhost:8080`
- **Companies Backend**: `http://localhost:3000`
- **AI Service**: `http://localhost:8000`
- **Candidates Service**: `http://localhost:3002`
- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`
- **MinIO Console**: `http://localhost:9001`
- **Redis Admin**: `http://localhost:9091`

## Infraestrutura

### Banco de Dados
- **PostgreSQL**: Banco principal para dados das empresas, usuários e vagas
- **Redis**: Filas de mensagens e cache para processamento assíncrono

### Storage
- **MinIO**: Compatível com S3 para armazenamento de arquivos (currículos, documentos)

### Proxy e Roteamento
- **Caddy**: Proxy reverso com suporte a subdomínios para diferentes empresas

## Próximos Serviços Planejados

### 5. Notifications Service
**Responsabilidades**:
- Envio de emails
- Notificações push
- Templates de comunicação
- Agendamento de notificações

### 6. Analytics Service
**Responsabilidades**:
- Relatórios de recrutamento
- Métricas de performance
- Dashboards analíticos
- Exportação de dados

## Benefícios da Nova Estrutura

### 1. Separação de Responsabilidades
- Cada serviço tem uma responsabilidade específica
- Facilita a manutenção e debugging
- Permite desenvolvimento paralelo

### 2. Escalabilidade
- Serviços podem ser escalados independentemente
- Possibilidade de usar diferentes tecnologias por serviço
- Deploy independente de cada serviço

### 3. Desenvolvimento
- Equipes podem trabalhar em serviços diferentes
- Testes isolados por serviço
- Menor acoplamento entre funcionalidades

### 4. Manutenção
- Bugs isolados por serviço
- Atualizações independentes
- Rollback granular

## Convenções de Nomenclatura

### Serviços:
- Nome no formato: `{domain}-service`
- Exemplo: `companies-service`, `applications-service`

### Containers Docker:
- Nome no formato: `cognitive-ats-{service}-{component}`
- Exemplo: `cognitive-ats-companies-backend-dev`

### Networks:
- Nome no formato: `cognitive-ats-network`
- Todos os serviços compartilham a mesma network

## Desenvolvimento

### Adicionando um Novo Serviço:

1. **Criar estrutura de pastas**:
```bash
mkdir new-service
mkdir new-service/backend
mkdir new-service/frontend  # se necessário
```

2. **Atualizar docker-compose.yml**:
```yaml
new-service-backend:
  build:
    context: ./new-service/backend
    dockerfile: Dockerfile.dev
  # ... outras configurações
```

3. **Documentar no README.md**:
- Adicionar descrição do serviço
- Atualizar estrutura do projeto
- Documentar funcionalidades

### Boas Práticas:

1. **Isolamento**: Cada serviço deve ser independente
2. **Comunicação**: Usar APIs REST ou gRPC entre serviços
3. **Configuração**: Usar variáveis de ambiente
4. **Logs**: Centralizar logs para debugging
5. **Monitoramento**: Implementar health checks
6. **Testes**: Testes unitários e de integração por serviço 