# Exemplo de Uso do QuestionEvaluator

Este documento demonstra como usar o novo serviço `QuestionEvaluator` para avaliar respostas de perguntas de candidatos usando IA.

## Importação e Configuração

```python
from core.question_evaluator import QuestionEvaluator
from core.ai.service import AIService
from shared.config import AIProvider

# Configurar o serviço de IA
ai_service = AIService(
    provider=AIProvider.OPENAI,
    api_key="sua-api-key-aqui"
)

# Criar instância do avaliador
evaluator = QuestionEvaluator(ai_service)
```

## Exemplo 1: Avaliar Múltiplas Respostas

```python
import asyncio

async def avaliar_respostas_candidato():
    # Dados da vaga
    job_data = {
        "title": "Desenvolvedor Python Senior",
        "description": "Desenvolvedor Python com experiência em APIs, microserviços e cloud computing",
        "requirements": "Python 3.8+, FastAPI, Docker, AWS, 5+ anos de experiência"
    }
    
    # Respostas do candidato
    question_responses = [
        {
            "question": "Como você implementaria autenticação JWT em uma API FastAPI?",
            "answer": "Usaria o FastAPI-JWT-Auth ou implementaria manualmente com PyJWT, criando endpoints para login/logout e middleware para validar tokens nas rotas protegidas."
        },
        {
            "question": "Explique sua experiência com Docker e containers",
            "answer": "Trabalho com Docker há 3 anos, criando Dockerfiles, docker-compose para desenvolvimento local e orquestrando containers em produção com Kubernetes."
        },
        {
            "question": "Como você abordaria a migração de um monólito para microserviços?",
            "answer": "Começaria identificando domínios de negócio, extraindo gradualmente serviços, implementando API Gateway e garantindo comunicação assíncrona entre serviços."
        }
    ]
    
    try:
        # Avaliar as respostas
        evaluation = await evaluator.evaluate_question_responses(
            question_responses=question_responses,
            job_data=job_data,
            temperature=0.3  # Baixa temperatura para respostas mais consistentes
        )
        
        print(f"Score geral: {evaluation['score']}/100")
        print(f"Feedback: {evaluation['feedback']}")
        print(f"Áreas de melhoria: {evaluation['improvement_areas']}")
        
        # Detalhes da avaliação
        details = evaluation['details']
        print(f"Relevância: {details['relevance_score']}/100")
        print(f"Especificidade: {details['specificity_score']}/100")
        print(f"Alinhamento: {details['alignment_score']}/100")
        
    except Exception as e:
        print(f"Erro na avaliação: {e}")

# Executar
asyncio.run(avaliar_respostas_candidato())
```

## Exemplo 2: Avaliar Uma Única Resposta

```python
async def avaliar_resposta_unica():
    job_data = {
        "title": "Analista de Dados",
        "description": "Analista responsável por análise exploratória, criação de dashboards e relatórios",
        "requirements": "SQL, Python, Pandas, Power BI, experiência com análise de dados"
    }
    
    question = "Como você analisaria a performance de vendas de uma empresa?"
    answer = "Começaria coletando dados de vendas por período, região e produto. Usaria SQL para agregações e Python/Pandas para análise estatística, criando visualizações para identificar tendências e padrões sazonais."
    
    try:
        evaluation = await evaluator.evaluate_single_response(
            question=question,
            answer=answer,
            job_data=job_data
        )
        
        print(f"Score: {evaluation['score']}/100")
        print(f"Feedback: {evaluation['feedback']}")
        
    except Exception as e:
        print(f"Erro na avaliação: {e}")

# Executar
asyncio.run(avaliar_resposta_unica())
```

## Exemplo 3: Integração com API

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI()

class QuestionResponse(BaseModel):
    question: str
    answer: str

class JobData(BaseModel):
    title: str
    description: str
    requirements: str

class EvaluationRequest(BaseModel):
    question_responses: List[QuestionResponse]
    job_data: JobData

@app.post("/evaluate-questions")
async def evaluate_questions(request: EvaluationRequest):
    try:
        # Converter para dict
        job_dict = request.job_data.dict()
        responses_list = [resp.dict() for resp in request.question_responses]
        
        # Avaliar
        evaluation = await evaluator.evaluate_question_responses(
            question_responses=responses_list,
            job_data=job_dict
        )
        
        return evaluation
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## Estrutura de Resposta

O serviço retorna um dicionário com a seguinte estrutura:

```json
{
    "score": 85,
    "details": {
        "overall_assessment": "Respostas demonstram bom conhecimento técnico",
        "strengths": ["Conhecimento prático de FastAPI", "Experiência com Docker"],
        "weaknesses": ["Poderia detalhar mais sobre segurança"],
        "relevance_score": 90,
        "specificity_score": 85,
        "alignment_score": 88,
        "clarity_score": 82,
        "depth_score": 80
    },
    "feedback": "O candidato demonstra conhecimento sólido em Python e tecnologias relacionadas...",
    "improvement_areas": [
        "Detalhar mais sobre práticas de segurança",
        "Mencionar experiências específicas com métricas"
    ],
    "evaluated_at": "2024-01-15T10:30:00Z",
    "provider": "openai",
    "model": "gpt-4"
}
```

## Configurações Recomendadas

- **Temperature**: 0.3 para avaliações mais consistentes
- **Max Tokens**: 1000-1500 para respostas detalhadas
- **Provider**: OpenAI GPT-4 ou Anthropic Claude para melhor qualidade

## Tratamento de Erros

O serviço lança `QuestionEvaluationError` em caso de problemas:

```python
from shared.exceptions import QuestionEvaluationError

try:
    evaluation = await evaluator.evaluate_question_responses(...)
except QuestionEvaluationError as e:
    print(f"Erro na avaliação: {e}")
    # Tratar erro específico
except Exception as e:
    print(f"Erro inesperado: {e}")
    # Tratar erro genérico
```

## Casos de Uso

1. **Avaliação de Candidatos**: Score automático de respostas em processos seletivos
2. **Qualidade de Respostas**: Análise de qualidade de respostas em questionários
3. **Feedback de Entrevistas**: Avaliação de respostas em entrevistas técnicas
4. **Treinamento**: Identificação de áreas de melhoria para candidatos
5. **Ranking**: Ordenação de candidatos por qualidade das respostas
