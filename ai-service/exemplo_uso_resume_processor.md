# Exemplo de Uso do ResumeProcessor Refatorado

## Visão Geral

O `ResumeProcessor` foi refatorado para ser transparente à origem dos dados. Agora ele recebe apenas o **path do PDF** e o **application_id**, sem se preocupar com download, mensagens SQS ou outras origens.

## Estrutura da Refatoração

### 1. ResumeProcessor (Core)
- **Responsabilidade**: Processar currículos a partir de um arquivo PDF local
- **Entrada**: `pdf_path` (string) + `application_id` (string)
- **Saída**: `ProcessingResult` com dados processados

### 2. ResumeOrchestrator (Orchestration Layer)
- **Responsabilidade**: Orquestrar diferentes origens de dados
- **Métodos**:
  - `process_resume_from_message()` - Para mensagens SQS
  - `process_resume_from_file()` - Para arquivos locais
  - `process_resume_from_url()` - Para URLs

## Exemplos de Uso

### 1. Uso Direto do ResumeProcessor

```python
from consumer.services.resume_processor import ResumeProcessor

# Inicializa o processador
processor = ResumeProcessor()

# Processa um currículo local
result = await processor.process_resume(
    pdf_path="/path/to/resume.pdf",
    application_id="app_123"
)

if result.success:
    print(f"✅ Processado em {result.processing_time}s")
    print(f"Experiências: {len(result.resume_data.get('professionalExperiences', []))}")
else:
    print(f"❌ Erro: {result.error}")
```

### 2. Uso do ResumeOrchestrator para Arquivo Local

```python
from consumer.services.resume_orchestrator import ResumeOrchestrator

# Inicializa o orquestrador
orchestrator = ResumeOrchestrator()

# Processa um arquivo local
result = await orchestrator.process_resume_from_file(
    pdf_path="/path/to/resume.pdf",
    application_id="app_123"
)
```

### 3. Uso do ResumeOrchestrator para URL

```python
from consumer.services.resume_orchestrator import ResumeOrchestrator

# Inicializa o orquestrador
orchestrator = ResumeOrchestrator()

# Processa uma URL
result = await orchestrator.process_resume_from_url(
    url="https://example.com/resume.pdf",
    application_id="app_123"
)
```

### 4. Uso do ResumeOrchestrator para Mensagem SQS

```python
from consumer.services.resume_orchestrator import ResumeOrchestrator

# Inicializa o orquestrador
orchestrator = ResumeOrchestrator()

# Processa uma mensagem SQS
result = await orchestrator.process_resume_from_message(
    resume_message=resume_message,  # Objeto ResumeMessage
    message_id="msg_456"
)
```

## Vantagens da Refatoração

### ✅ **Separação de Responsabilidades**
- `ResumeProcessor`: Foco no processamento de IA
- `ResumeOrchestrator`: Foco na orquestração de origens
- `FileService`: Foco no download e validação de arquivos

### ✅ **Reutilização**
- O `ResumeProcessor` pode ser usado em diferentes contextos
- Fácil de testar isoladamente
- Pode ser integrado em outros sistemas

### ✅ **Flexibilidade**
- Suporte a múltiplas origens de dados
- Fácil adição de novas origens
- Processamento síncrono e assíncrono

### ✅ **Manutenibilidade**
- Código mais limpo e organizado
- Responsabilidades bem definidas
- Fácil de debugar e modificar

## Estrutura de Arquivos

```
consumer/services/
├── resume_processor.py      # Core do processamento
├── resume_orchestrator.py   # Orquestração de origens
├── file_service.py          # Download e validação
└── backend_service.py       # Comunicação com backend
```

## Fluxo de Processamento

### Para Arquivo Local:
```
ResumeProcessor.process_resume()
    ↓
Validação do PDF
    ↓
Processamento com IA
    ↓
Mapeamento para Backend
    ↓
Envio para Backend
    ↓
Retorno do Resultado
```

### Para Mensagem SQS:
```
ResumeOrchestrator.process_resume_from_message()
    ↓
Download do PDF
    ↓
Validação do PDF
    ↓
ResumeProcessor.process_resume()
    ↓
Limpeza do arquivo temporário
    ↓
Retorno do Resultado
```

## Testes

### Teste do ResumeProcessor

```python
import pytest
from consumer.services.resume_processor import ResumeProcessor

@pytest.mark.asyncio
async def test_process_resume_local():
    processor = ResumeProcessor()
    
    result = await processor.process_resume(
        pdf_path="tests/fixtures/sample_resume.pdf",
        application_id="test_123"
    )
    
    assert result.success
    assert result.application_id == "test_123"
    assert "professionalExperiences" in result.resume_data
```

### Teste do ResumeOrchestrator

```python
import pytest
from consumer.services.resume_orchestrator import ResumeOrchestrator

@pytest.mark.asyncio
async def test_process_resume_from_file():
    orchestrator = ResumeOrchestrator()
    
    result = await orchestrator.process_resume_from_file(
        pdf_path="tests/fixtures/sample_resume.pdf",
        application_id="test_123"
    )
    
    assert result.success
    assert result.application_id == "test_123"
```

## Migração

### Antes (Código Antigo):
```python
# O ResumeProcessor fazia tudo
result = await resume_processor.process_resume(
    resume_message,  # Mensagem completa
    message_id
)
```

### Depois (Código Novo):
```python
# ResumeOrchestrator orquestra, ResumeProcessor processa
result = await resume_orchestrator.process_resume_from_message(
    resume_message,
    message_id
)

# Ou uso direto do ResumeProcessor
result = await resume_processor.process_resume(
    pdf_path="/path/to/file.pdf",
    application_id="app_123"
)
```

## Considerações

### 🔒 **Segurança**
- Validação de PDF mantida
- Limpeza automática de arquivos temporários
- Validação de entrada

### 📊 **Performance**
- Sem overhead desnecessário para arquivos locais
- Download assíncrono quando necessário
- Reutilização de instâncias

### 🧪 **Testabilidade**
- Fácil mock de dependências
- Testes isolados por responsabilidade
- Cobertura de código melhorada
