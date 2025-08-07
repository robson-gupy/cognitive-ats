# AI Service

Serviço configurável para diferentes providers de IA (OpenAI, Anthropic, etc.)

## Funcionalidades

- **Geração de Texto**: Gera texto usando diferentes modelos de IA
- **Chat Completion**: Gera respostas de chat
- **Embeddings**: Gera embeddings de texto
- **Criação de Vagas**: Cria vagas usando IA
- **Melhoria de Vagas**: Melhora vagas existentes
- **Análise de Currículos**: Analisa e extrai informações de currículos
- **Avaliação de Candidatos**: Avalia a aderência de candidatos a vagas

## Configuração

1. Copie o arquivo de exemplo de ambiente:
```bash
cp env.example .env
```

2. Configure as variáveis de ambiente no arquivo `.env`:
```env
# Provider padrão (openai, anthropic)
DEFAULT_AI_PROVIDER=openai

# OpenAI
OPENAI_API_KEY=sua_chave_aqui
OPENAI_MODEL=gpt-4

# Anthropic
ANTHROPIC_API_KEY=sua_chave_aqui
ANTHROPIC_MODEL=claude-3-sonnet-20240229
```

## Instalação

```bash
# Instalar dependências
pip install -r requirements.txt

# Executar o serviço
uvicorn api.main:app --reload
```

## Endpoints

### Geração de Texto
```bash
POST /ai/generate-text
```

### Chat
```bash
POST /ai/chat
```

### Embeddings
```bash
POST /ai/embedding
```

### Criação de Vagas
```bash
POST /ai/jobs/create
```

### Melhoria de Vagas
```bash
POST /ai/jobs/enhance
```

### Análise de Currículos
```bash
POST /ai/resume/parse
```

### Avaliação de Candidatos
```bash
POST /ai/evaluate-candidate
```

## Exemplo de Avaliação de Candidatos

```bash
curl -X POST "http://localhost:8000/ai/evaluate-candidate" \
  -H "Content-Type: application/json" \
  -d '{
    "resume": {
      "personal_info": {
        "name": "João Silva",
        "email": "joao@email.com"
      },
      "education": [
        {
          "degree": "Bacharelado em Ciência da Computação",
          "institution": "Universidade Federal",
          "year": "2020"
        }
      ],
      "experience": [
        {
          "title": "Desenvolvedor Full Stack",
          "company": "Tech Corp",
          "duration": "2 anos",
          "description": "Desenvolvimento de aplicações web com React e Node.js"
        }
      ],
      "skills": ["JavaScript", "React", "Node.js", "Python"]
    },
    "job": {
      "title": "Desenvolvedor Full Stack Senior",
      "description": "Desenvolvimento de aplicações web modernas",
      "requirements": ["React", "Node.js", "TypeScript"],
      "education_required": "Bacharelado em Ciência da Computação",
      "experience_required": "3+ anos"
    },
    "question_responses": [
      {
        "question": "Como você lida com prazos apertados?",
        "answer": "Organizo as tarefas por prioridade e uso metodologias ágeis"
      }
    ]
  }'
```

**Resposta:**
```json
{
  "overall_score": 75,
  "question_responses_score": 80,
  "education_score": 90,
  "experience_score": 70,
  "provider": "openai",
  "model": "gpt-4",
  "evaluation_details": {
    "overall_score": 75,
    "question_responses_score": 80,
    "education_score": 90,
    "experience_score": 70
  }
}
```

## Estrutura do Projeto

```
ai-service/
├── api/
│   ├── main.py              # Aplicação FastAPI
│   ├── models/              # Modelos Pydantic
│   └── routes/              # Rotas da API
├── core/
│   ├── ai/                  # Lógica de IA
│   ├── jobs/                # Lógica de vagas
│   └── resume/              # Lógica de currículos
├── shared/
│   ├── config.py            # Configurações
│   ├── exceptions.py        # Exceções customizadas
│   └── utils.py             # Utilitários
└── tests/                   # Testes
```

## Providers Suportados

- **OpenAI**: GPT-4, GPT-3.5-turbo
- **Anthropic**: Claude-3, Claude-2

## Desenvolvimento

```bash
# Instalar dependências de desenvolvimento
pip install -r requirements.txt

# Executar testes
pytest

# Executar com hot reload
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

## Docker

```bash
# Construir imagem
docker build -t ai-service .

# Executar container
docker run -p 8000:8000 ai-service
```
