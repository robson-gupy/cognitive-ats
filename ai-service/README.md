# AI Service

Serviço de Inteligência Artificial configurável para diferentes providers (OpenAI, Anthropic, etc.).

## Estrutura do Projeto

```
ai-service/
├── api/                    # API FastAPI principal
│   ├── __init__.py
│   ├── main.py            # Aplicação FastAPI
│   ├── routes/            # Rotas da API
│   │   ├── __init__.py
│   │   ├── ai.py          # Rotas de IA geral
│   │   └── jobs.py        # Rotas específicas para jobs
│   └── models/            # Modelos Pydantic
│       ├── __init__.py
│       ├── ai.py          # Modelos para requisições de IA
│       └── jobs.py        # Modelos para jobs
├── core/                   # Lógica de negócio principal
│   ├── __init__.py
│   ├── ai/                # Serviços de IA
│   │   ├── __init__.py
│   │   ├── base.py        # Classe base para providers
│   │   ├── openai.py      # Provider OpenAI
│   │   ├── anthropic.py   # Provider Anthropic
│   │   └── factory.py     # Factory para criar providers
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
│   ├── config.py          # Configurações
│   ├── exceptions.py      # Exceções customizadas
│   └── utils.py           # Utilitários gerais
├── tests/                 # Testes
│   ├── __init__.py
│   ├── test_ai_service.py
│   └── test_jobs.py
├── Dockerfile             # Dockerfile principal
├── requirements.txt        # Dependências
└── README.md             # Este arquivo
```

## Componentes Principais

### API (`api/`)
- **main.py**: Aplicação FastAPI principal
- **routes/**: Rotas organizadas por funcionalidade
- **models/**: Modelos Pydantic para validação

### Core (`core/`)
- **ai/**: Implementações dos providers de IA
- **jobs/**: Lógica específica para criação e melhoria de jobs
- **resume/**: Processamento de currículos

### Consumer (`consumer/`)
- Consumidor SQS para processamento assíncrono de currículos
- Mantido como está para não quebrar funcionalidade existente

### Shared (`shared/`)
- Configurações, exceções e utilitários compartilhados

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

## Endpoints Principais

- `GET /health` - Health check
- `GET /providers` - Lista providers disponíveis
- `POST /generate-text` - Geração de texto
- `POST /chat` - Chat com IA
- `POST /embedding` - Geração de embeddings
- `POST /jobs/create-from-prompt` - Criação de jobs
- `POST /jobs/generate-questions` - Geração de perguntas
- `POST /jobs/generate-stages` - Geração de estágios

## Configuração

Configure as variáveis de ambiente:
- `DEFAULT_AI_PROVIDER`: Provider padrão (openai, anthropic)
- `OPENAI_API_KEY`: Chave da API OpenAI
- `ANTHROPIC_API_KEY`: Chave da API Anthropic
