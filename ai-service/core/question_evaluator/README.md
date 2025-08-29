# Question Evaluator Core

Este módulo fornece funcionalidades para avaliar respostas de perguntas de candidatos usando IA, gerando scores de 0 a 100 baseados no alinhamento das respostas com os requisitos da vaga.

## Estrutura

```
question_evaluator/
├── __init__.py              # Exporta a classe QuestionEvaluator
├── question_evaluator.py    # Implementação principal do serviço
├── question_evaluation.prompt # Prompt estruturado para a IA
└── README.md               # Este arquivo
```

## Funcionalidades

### QuestionEvaluator

Classe principal que gerencia a avaliação de respostas de perguntas:

- **`evaluate_question_responses()`**: Avalia múltiplas respostas de perguntas
- **`evaluate_single_response()`**: Avalia uma única resposta de pergunta
- **Validação automática**: Valida e normaliza os dados retornados pela IA
- **Tratamento de erros**: Lança exceções específicas para problemas de avaliação

## Uso Básico

```python
from core.question_evaluator import QuestionEvaluator
from core.ai.service import AIService
from shared.config import AIProvider

# Configurar
ai_service = AIService(AIProvider.OPENAI, api_key="sua-key")
evaluator = QuestionEvaluator(ai_service)

# Avaliar respostas
evaluation = await evaluator.evaluate_question_responses(
    question_responses=responses,
    job_data=job_info
)
```

## Prompt Estruturado

O arquivo `question_evaluation.prompt` contém um template estruturado que:

1. **Define o contexto**: Especialista em recrutamento e seleção
2. **Especifica critérios**: Relevância, especificidade, alinhamento, clareza, profundidade
3. **Estabelece escala**: 0-100 com critérios específicos para cada faixa
4. **Formato de resposta**: JSON estruturado com score, detalhes e feedback

## Critérios de Avaliação

- **90-100**: Resposta excepcional
- **80-89**: Resposta muito boa
- **70-79**: Resposta boa
- **60-69**: Resposta satisfatória
- **50-59**: Resposta mediana
- **40-49**: Resposta abaixo da média
- **30-39**: Resposta ruim
- **20-29**: Resposta muito ruim
- **10-19**: Resposta extremamente ruim
- **0-9**: Resposta inaceitável

## Estrutura de Resposta

```json
{
    "score": 85,
    "details": {
        "overall_assessment": "Avaliação geral",
        "strengths": ["Pontos fortes"],
        "weaknesses": ["Pontos fracos"],
        "relevance_score": 90,
        "specificity_score": 85,
        "alignment_score": 88,
        "clarity_score": 82,
        "depth_score": 80
    },
    "feedback": "Feedback detalhado",
    "improvement_areas": ["Áreas de melhoria"],
    "evaluated_at": "2024-01-15T10:30:00Z",
    "provider": "openai",
    "model": "gpt-4"
}
```

## Tratamento de Erros

O serviço lança `QuestionEvaluationError` para problemas específicos:

- Arquivo de prompt não encontrado
- Erro na leitura do prompt
- Falha na extração de JSON
- Erro na validação dos dados

## Configurações Recomendadas

- **Temperature**: 0.3 para avaliações consistentes
- **Max Tokens**: 1000-1500 para respostas detalhadas
- **Provider**: OpenAI GPT-4 ou Anthropic Claude

## Integração

Este core pode ser integrado com:

- APIs de avaliação de candidatos
- Sistemas de recrutamento
- Processos de seleção automatizados
- Análise de qualidade de respostas

## Testes

Execute o teste com:

```bash
# Script automatizado
./testar_question_evaluator.sh

# Ou diretamente
python test_question_evaluator.py
```

## Dependências

- `core.ai.service.AIService`
- `shared.exceptions.QuestionEvaluationError`
- `shared.utils.extract_json_from_text`

## Exemplos

Veja `exemplo_uso_question_evaluator.md` para exemplos completos de uso.
