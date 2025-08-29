# Estrutura Reorganizada do AI Service

## Visão Geral

O projeto `ai-service` foi reorganizado para seguir uma arquitetura mais modular e escalável, separando claramente as responsabilidades e facilitando a manutenção.

## Nova Estrutura de Diretórios

```
ai-service/
├── api/                    # Camada de API (FastAPI)
│   ├── __init__.py
│   ├── main.py            # Aplicação FastAPI principal
│   ├── routes/            # Rotas organizadas por funcionalidade
│   │   ├── __init__.py
│   │   ├── ai.py          # Rotas de IA geral
│   │   └── jobs.py        # Rotas específicas para jobs
│   └── models/            # Modelos Pydantic
│       ├── __init__.py
│       ├── ai.py          # Modelos para requisições de IA
│       ├── jobs.py        # Modelos para jobs
│       └── models.py      # Modelos gerais (Job, Resume, etc.)
├── core/                   # Lógica de negócio principal
│   ├── __init__.py
│   ├── ai/                # Serviços de IA
│   │   ├── __init__.py
│   │   ├── base.py        # Classe base para providers
│   │   ├── openai.py      # Provider OpenAI
│   │   ├── anthropic.py   # Provider Anthropic
│   │   ├── factory.py     # Factory para criar providers
│   │   └── service.py     # Serviço principal de IA
│   ├── jobs/              # Serviços específicos para jobs
│   │   ├── __init__.py
│   │   ├── creator.py     # Criação de jobs com IA
│   │   └── enhancer.py    # Melhoria de jobs
│   └── resume/            # Processamento de currículos
│       ├── __init__.py
│       └── parser.py      # Parser de currículos
├── consumer/              # Consumidor SQS (mantido)
│   ├── __init__.py
│   ├── sqs_listener.py
│   ├── Dockerfile.listener
│   └── README.md
├── shared/                # Utilitários compartilhados
│   ├── __init__.py
│   ├── config.py          # Configurações centralizadas
│   ├── exceptions.py      # Exceções customizadas
│   └── utils.py           # Utilitários gerais
├── tests/                 # Testes
│   ├── __init__.py
│   └── test_ai_service.py
├── Dockerfile             # Dockerfile principal
├── requirements.txt        # Dependências
├── env.example            # Exemplo de variáveis de ambiente
└── README.md             # Documentação principal
```

## Componentes Principais

### 1. API (`api/`)

A camada de API é responsável por:
- **main.py**: Aplicação FastAPI principal com configurações de CORS e middleware
- **routes/**: Rotas organizadas por funcionalidade
  - `ai.py`: Endpoints para geração de texto, chat e embeddings
  - `jobs.py`: Endpoints para criação e melhoria de jobs
- **models/**: Modelos Pydantic para validação de dados
  - `ai.py`: Modelos para requisições de IA
  - `jobs.py`: Modelos para requisições de jobs
  - `models.py`: Modelos gerais (Job, Resume, etc.)

### 2. Core (`core/`)

A camada de lógica de negócio é dividida em:

#### AI (`core/ai/`)
- **base.py**: Classe base abstrata para providers de IA
- **openai.py**: Implementação do provider OpenAI
- **anthropic.py**: Implementação do provider Anthropic
- **factory.py**: Factory pattern para criar providers
- **service.py**: Serviço principal que gerencia diferentes providers

#### Jobs (`core/jobs/`)
- **creator.py**: Serviço para criação de jobs usando IA
- **enhancer.py**: Serviço para melhoria de jobs existentes

#### Resume (`core/resume/`)
- **parser.py**: Parser de currículos usando IA

### 3. Shared (`shared/`)

Utilitários compartilhados:
- **config.py**: Configurações centralizadas com enum de providers
- **exceptions.py**: Exceções customizadas para diferentes tipos de erro
- **utils.py**: Funções utilitárias (conversão de datas, extração de JSON, etc.)

### 4. Consumer (`consumer/`)

Mantido como estava para não quebrar funcionalidade existente:
- **sqs_listener.py**: Consumidor SQS para processamento assíncrono
- **Dockerfile.listener**: Dockerfile específico para o consumer

## Benefícios da Nova Estrutura

### 1. **Separação de Responsabilidades**
- API separada da lógica de negócio
- Providers de IA isolados e extensíveis
- Utilitários compartilhados centralizados

### 2. **Escalabilidade**
- Fácil adição de novos providers de IA
- Estrutura modular permite crescimento
- Testes organizados por funcionalidade

### 3. **Manutenibilidade**
- Código organizado e bem documentado
- Exceções customizadas para melhor debugging
- Configurações centralizadas

### 4. **Flexibilidade**
- Factory pattern para providers
- Configuração via variáveis de ambiente
- Suporte a múltiplos providers

## Migração de Código

### Arquivos Movidos/Reorganizados

1. **main.py** → **api/main.py**
   - Agora usa rotas organizadas
   - Configuração de CORS
   - Endpoints de health check

2. **services/ai_service.py** → **core/ai/service.py**
   - Refatorado para usar factory pattern
   - Separação clara de responsabilidades

3. **services/job_ai_service.py** → **core/jobs/creator.py** + **core/jobs/enhancer.py**
   - Funcionalidades separadas em serviços específicos
   - Melhor organização do código

4. **models.py** → **api/models/models.py**
   - Modelos Pydantic organizados
   - Separação por funcionalidade

### Novos Arquivos

1. **shared/config.py**: Configurações centralizadas
2. **shared/exceptions.py**: Exceções customizadas
3. **shared/utils.py**: Utilitários compartilhados
4. **core/ai/factory.py**: Factory para providers
5. **core/ai/base.py**: Classe base para providers
6. **core/resume/parser.py**: Parser de currículos

## Como Usar

### Desenvolvimento Local
```bash
cd ai-service
pip install -r requirements.txt
uvicorn api.main:app --reload
```

### Docker
```bash
docker build -t ai-service .
docker run -p 8000:8000 ai-service
```

### Consumer SQS
```bash
cd consumer
docker build -f Dockerfile.listener -t sqs-listener .
docker run sqs-listener
```

## Configuração

As variáveis de ambiente foram expandidas:

```bash
# Provider padrão
DEFAULT_AI_PROVIDER=openai

# API Keys
OPENAI_API_KEY=sk-sua-chave-aqui
ANTHROPIC_API_KEY=sua-chave-anthropic-aqui

# Configurações de modelo
DEFAULT_MODEL=gpt-4
DEFAULT_MAX_TOKENS=1000
DEFAULT_TEMPERATURE=0.7

# Timeout
REQUEST_TIMEOUT=30
```

## Endpoints Disponíveis

### IA Geral
- `POST /ai/generate-text` - Geração de texto
- `POST /ai/chat` - Chat com IA
- `POST /ai/embedding` - Geração de embeddings
- `GET /ai/providers` - Lista providers disponíveis
- `GET /ai/provider-info` - Informações do provider

### Jobs
- `POST /jobs/create-from-prompt` - Criação de jobs
- `POST /jobs/enhance-description` - Melhoria de descrição
- `POST /jobs/enhance-requirements` - Melhoria de requisitos
- `POST /jobs/enhance-title` - Melhoria de título
- `POST /jobs/generate-questions` - Geração de perguntas
- `POST /jobs/generate-stages` - Geração de estágios

### Sistema
- `GET /` - Endpoint raiz
- `GET /health` - Health check
- `GET /info` - Informações do serviço

## Próximos Passos

1. **Testes**: Implementar testes unitários e de integração
2. **Documentação**: Adicionar docstrings e exemplos de uso
3. **Monitoramento**: Implementar logs estruturados
4. **Cache**: Adicionar cache para respostas de IA
5. **Rate Limiting**: Implementar rate limiting por provider
6. **Métricas**: Adicionar métricas de performance
