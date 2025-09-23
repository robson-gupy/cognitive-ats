# Dependências - Async Task Service

Este documento descreve as dependências do async-task-service e suas funcionalidades.

## Dependências Principais (requirements.txt)

### redis>=5.0,<6
- **Propósito**: Cliente Redis para conexão com filas de mensagens
- **Uso**: Conexão com Redis Streams para processamento de mensagens
- **Funcionalidades**: BLPOP, RPUSH, XPENDING, XACK

### redis[hiredis]>=5.0,<6
- **Propósito**: Extensão de performance do cliente Redis
- **Uso**: Acelera operações Redis usando biblioteca C hiredis
- **Benefício**: Melhor performance em operações de alta frequência

### python-dotenv>=1.0,<2
- **Propósito**: Carregamento de variáveis de ambiente
- **Uso**: Carrega variáveis do arquivo .env para configuração
- **Funcionalidades**: load_dotenv() para configuração automática

### httpx>=0.24,<1
- **Propósito**: Cliente HTTP assíncrono (alternativa)
- **Uso**: Chamadas HTTP assíncronas para outros serviços
- **Funcionalidades**: Suporte a async/await, HTTP/2

### requests==2.32.5
- **Propósito**: Cliente HTTP síncrono
- **Uso**: Chamadas HTTP para backend services
- **Funcionalidades**: BackendService para atualização de scores

### aiohttp>=3.8,<4 ✅ **NOVO**
- **Propósito**: Cliente HTTP assíncrono
- **Uso**: Chamadas HTTP assíncronas para AI service
- **Funcionalidades**: Suporte a async/await, timeouts configuráveis
- **Handler**: question_responses.py para chamadas ao AI service

## Dependências de Desenvolvimento (requirements-dev.txt)

### pre-commit>=3.7,<4
- **Propósito**: Hooks de pré-commit
- **Uso**: Validação automática de código antes do commit
- **Funcionalidades**: Linting, formatação, type checking

### ruff>=0.5.6,<1
- **Propósito**: Linter e formatter Python
- **Uso**: Análise estática de código e formatação
- **Funcionalidades**: Substitui flake8, black, isort

### mypy>=1.10,<2
- **Propósito**: Type checker estático
- **Uso**: Verificação de tipos em tempo de desenvolvimento
- **Funcionalidades**: Detecção de erros de tipo antes da execução

### types-redis>=4.6.0.20240425
- **Propósito**: Stubs de tipos para Redis
- **Uso**: Suporte a type hints para biblioteca Redis
- **Funcionalidades**: IntelliSense e type checking para Redis

### types-python-dotenv>=0.19.0
- **Propósito**: Stubs de tipos para python-dotenv
- **Uso**: Suporte a type hints para python-dotenv
- **Funcionalidades**: IntelliSense e type checking para dotenv

## Uso por Handler

### handler_application_created
- **Dependências**: redis, python-dotenv
- **Funcionalidades**: Processamento de aplicações criadas

### handler_ai_score
- **Dependências**: redis, python-dotenv, requests
- **Funcionalidades**: Chamadas HTTP para AI service e backend

### handler_question_responses ✅ **NOVO**
- **Dependências**: redis, python-dotenv, aiohttp
- **Funcionalidades**: Chamadas HTTP assíncronas para AI service

## Configuração de Instalação

### Desenvolvimento
```bash
# Instalar dependências principais
pip install -r requirements.txt

# Instalar dependências de desenvolvimento
pip install -r requirements-dev.txt

# Instalar pre-commit hooks
pre-commit install
```

### Docker
```dockerfile
# No Dockerfile.dev
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY requirements-dev.txt .
RUN pip install -r requirements-dev.txt
```

### Produção
```bash
# Apenas dependências principais
pip install -r requirements.txt
```

## Resolução de Problemas

### Erro: No module named 'aiohttp'
**Problema**: Módulo aiohttp não encontrado
**Solução**: 
```bash
pip install aiohttp>=3.8,<4
# ou
pip install -r requirements.txt
```

### Erro: No module named 'redis'
**Problema**: Cliente Redis não encontrado
**Solução**:
```bash
pip install redis[hiredis]>=5.0,<6
```

### Erro: No module named 'httpx'
**Problema**: Cliente HTTP assíncrono não encontrado
**Solução**:
```bash
pip install httpx>=0.24,<1
```

## Versões e Compatibilidade

### Python
- **Versão Mínima**: Python 3.8+
- **Versão Recomendada**: Python 3.11+
- **Testado em**: Python 3.9, 3.10, 3.11

### Redis
- **Versão Mínima**: Redis 6.0+
- **Versão Recomendada**: Redis 7.0+
- **Funcionalidades**: Redis Streams, BLPOP, RPUSH

### aiohttp
- **Versão Mínima**: aiohttp 3.8+
- **Versão Recomendada**: aiohttp 3.9+
- **Funcionalidades**: Cliente HTTP assíncrono, timeouts

## Atualizações de Dependências

### Quando Atualizar
- **Vulnerabilidades**: Quando há vulnerabilidades de segurança
- **Novas Funcionalidades**: Quando precisamos de novas features
- **Correções de Bugs**: Quando há bugs conhecidos

### Como Atualizar
```bash
# Verificar atualizações disponíveis
pip list --outdated

# Atualizar dependência específica
pip install --upgrade aiohttp

# Atualizar requirements.txt
pip freeze > requirements.txt
```

### Testes Após Atualização
```bash
# Executar testes
python -m pytest

# Executar handlers manualmente
python test_question_responses_handler.py
```

## Monitoramento de Dependências

### Verificação de Vulnerabilidades
```bash
# Instalar safety
pip install safety

# Verificar vulnerabilidades
safety check -r requirements.txt
```

### Verificação de Licenças
```bash
# Instalar pip-licenses
pip install pip-licenses

# Verificar licenças
pip-licenses --format=json
```

## Exemplo de Uso

### Handler com aiohttp
```python
import aiohttp

async def _call_ai_service_for_evaluation(question_responses, job_data):
    """Chama o endpoint do AI service para avaliar as question responses"""
    try:
        ai_service_url = f"{os.getenv('AI_SERVICE_URL')}/question-responses/evaluate"
        
        payload = {
            "question_responses": question_responses,
            "job_data": job_data
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                ai_service_url,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=aiohttp.ClientTimeout(total=120)
            ) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    return None
                    
    except Exception as e:
        logger.error(f"Erro ao chamar AI service: {str(e)}")
        return None
```

## Conclusão

As dependências do async-task-service são:

- ✅ **Bem definidas**: Versões específicas para estabilidade
- ✅ **Bem documentadas**: Propósito e uso de cada dependência
- ✅ **Atualizadas**: Incluindo aiohttp para funcionalidades assíncronas
- ✅ **Testadas**: Compatibilidade verificada
- ✅ **Monitoradas**: Verificação de vulnerabilidades e licenças

O sistema está pronto para executar todos os handlers com as dependências corretas!
