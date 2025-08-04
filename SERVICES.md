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
├── main.py           # Aplicação FastAPI
├── models.py         # Modelos de dados
├── services/         # Serviços de IA
│   ├── ai_service.py
│   └── job_ai_service.py
└── requirements.txt  # Dependências Python
```

#### Funcionalidades:
- **Geração de Descrições**: Criação automática de descrições de vagas
- **Criação de Perguntas**: Geração de perguntas para candidatos
- **Definição de Etapas**: Sugestão de etapas do processo seletivo
- **Múltiplos Provedores**: Suporte a OpenAI e Anthropic

## Arquitetura de Comunicação

### Comunicação entre Serviços:
```
[Frontend] ←→ [Backend] ←→ [AI Service]
     ↓              ↓
[PostgreSQL]   [JWT Auth]
```

### Portas e Endpoints:
- **Companies Frontend**: `http://localhost:8080`
- **Companies Backend**: `http://localhost:3000`
- **AI Service**: `http://localhost:8000`
- **PostgreSQL**: `localhost:5432`

## Próximos Serviços Planejados

### 3. Applications Service
**Responsabilidades**:
- Gestão de candidaturas
- Processo de aplicação
- Tracking de candidatos
- Comunicação com candidatos

### 4. Notifications Service
**Responsabilidades**:
- Envio de emails
- Notificações push
- Templates de comunicação
- Agendamento de notificações

### 5. Analytics Service
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