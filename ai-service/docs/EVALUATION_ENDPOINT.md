# Endpoint de Avaliação de Candidatos

Este endpoint avalia a aderência de um candidato a uma vaga específica, fornecendo notas em diferentes critérios.

## Endpoint

```
POST /ai/evaluate-candidate
```

## Parâmetros de Entrada

### ResumeData
```json
{
  "personal_info": {
    "name": "string",
    "email": "string",
    "phone": "string"
  },
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "year": "string",
      "gpa": "string"
    }
  ],
  "experience": [
    {
      "title": "string",
      "company": "string",
      "duration": "string",
      "description": "string"
    }
  ],
  "skills": ["string"],
  "languages": [
    {
      "language": "string",
      "level": "string"
    }
  ],
  "achievements": ["string"]
}
```

### JobData
```json
{
  "title": "string",
  "description": "string",
  "requirements": ["string"],
  "responsibilities": ["string"],
  "education_required": "string",
  "experience_required": "string",
  "skills_required": ["string"]
}
```

### QuestionResponse (opcional)
```json
{
  "question": "string",
  "answer": "string"
}
```

### Request Completa
```json
{
  "resume": ResumeData,
  "job": JobData,
  "question_responses": [QuestionResponse],
  "provider": "string",
  "api_key": "string",
  "model": "string"
}
```

## Resposta

```json
{
  "overall_score": 85,
  "question_responses_score": 90,
  "education_score": 95,
  "experience_score": 80,
  "provider": "openai",
  "model": "gpt-4",
  "evaluation_details": {
    "overall_score": 85,
    "question_responses_score": 90,
    "education_score": 95,
    "experience_score": 80
  }
}
```

## Critérios de Avaliação

### 1. Nota Geral (overall_score)
- **0-100**: Avaliação geral da aderência do candidato à vaga
- Considera todos os aspectos: experiência, formação, habilidades e respostas

### 2. Respostas das Perguntas (question_responses_score)
- **0-100**: Qualidade e relevância das respostas às perguntas
- Avalia se as respostas alinham com o que se espera para a vaga

### 3. Formação Acadêmica (education_score)
- **0-100**: Adequação da formação acadêmica aos requisitos da vaga
- Considera nível de escolaridade, área de estudo e instituição

### 4. Experiência Profissional (experience_score)
- **0-100**: Relevância da experiência profissional para a vaga
- Avalia anos de experiência, responsabilidades e tecnologias utilizadas

## Exemplo de Uso

### cURL
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

### Python
```python
import requests

url = "http://localhost:8000/ai/evaluate-candidate"
data = {
    "resume": {
        "personal_info": {"name": "João Silva"},
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
    }
}

response = requests.post(url, json=data)
result = response.json()
print(f"Nota Geral: {result['overall_score']}/100")
```

## Interpretação das Notas

### Nota Geral
- **80-100**: Excelente candidato - Altamente recomendado
- **60-79**: Bom candidato - Recomendado com ressalvas
- **40-59**: Candidato adequado - Considerar com atenção
- **0-39**: Candidato não adequado - Não recomendado

### Notas Específicas
- **90-100**: Excelente aderência no critério
- **70-89**: Boa aderência no critério
- **50-69**: Aderência adequada no critério
- **30-49**: Baixa aderência no critério
- **0-29**: Aderência muito baixa no critério

## Configuração

### Providers Suportados
- **OpenAI**: GPT-4, GPT-3.5-turbo
- **Anthropic**: Claude-3, Claude-2

### Configuração de Ambiente
```env
# Provider padrão
DEFAULT_AI_PROVIDER=openai

# OpenAI
OPENAI_API_KEY=sua_chave_aqui
OPENAI_MODEL=gpt-4

# Anthropic
ANTHROPIC_API_KEY=sua_chave_aqui
ANTHROPIC_MODEL=claude-3-sonnet-20240229
```

## Tratamento de Erros

### Erro 400 - Bad Request
- Dados de entrada inválidos
- Provider não suportado
- Provider não configurado

### Erro 500 - Internal Server Error
- Erro no provider de IA
- Erro interno do serviço

## Limitações

1. **Tamanho do Prompt**: O prompt pode ser grande para currículos muito detalhados
2. **Tempo de Resposta**: Pode levar alguns segundos dependendo do provider
3. **Qualidade da Avaliação**: Depende da qualidade dos dados fornecidos
4. **Subjetividade**: A avaliação é baseada em critérios subjetivos da IA

## Melhorias Futuras

1. **Cache de Avaliações**: Implementar cache para evitar reavaliações
2. **Métricas Detalhadas**: Adicionar mais critérios de avaliação
3. **Explicações**: Incluir justificativas para as notas
4. **Comparação**: Comparar candidatos entre si
5. **Histórico**: Manter histórico de avaliações
