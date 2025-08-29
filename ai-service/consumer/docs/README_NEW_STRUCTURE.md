# Consumer SQS - Nova Estrutura Organizada

## Visão Geral

O consumer foi completamente reestruturado para seguir princípios de **Single Responsibility Principle (SRP)** e **Separation of Concerns**. Cada componente agora tem uma responsabilidade específica e bem definida.

## Nova Estrutura

```
consumer/
├── __init__.py
├── main.py                    # 🎯 Ponto de entrada principal
├── config/
│   ├── __init__.py
│   └── settings.py           # ⚙️ Configurações centralizadas
├── models/
│   ├── __init__.py
│   ├── message.py            # 📨 Modelos de mensagens SQS
│   └── result.py             # 📊 Modelos de resultado
├── services/
│   ├── __init__.py
│   ├── sqs_service.py        # 📡 Serviço de operações SQS
│   ├── file_service.py       # 📁 Serviço de arquivos
│   ├── resume_processor.py   # 🤖 Processamento de currículos
│   └── backend_service.py    # 🌐 Comunicação com backend
├── handlers/
│   ├── __init__.py
│   ├── message_handler.py    # 🎮 Handler principal
│   └── error_handler.py      # ⚠️ Tratamento de erros
├── utils/
│   ├── __init__.py
│   ├── logger.py             # 📝 Sistema de logging
│   ├── validators.py         # ✅ Validações
│   └── date_utils.py         # 📅 Utilitários de data
├── Dockerfile.listener
├── env.consumer.example      # 📋 Exemplo de configuração
└── README.md
```

## Componentes e Responsabilidades

### 1. **Config** (`config/`)
- **`settings.py`**: Centraliza todas as configurações em classes tipadas
- Carrega variáveis de ambiente com validação
- Separa configurações por domínio (SQS, Backend, Processamento, Logging)

### 2. **Models** (`models/`)
- **`message.py`**: Modelos para mensagens SQS com validação
- **`result.py`**: Modelos para resultados de processamento
- Usa dataclasses para estruturação clara dos dados

### 3. **Services** (`services/`)
- **`sqs_service.py`**: Operações SQS (conexão, recebimento, deleção)
- **`file_service.py`**: Download e gerenciamento de arquivos
- **`resume_processor.py`**: Orquestração do processamento de currículos
- **`backend_service.py`**: Comunicação com APIs externas

### 4. **Handlers** (`handlers/`)
- **`message_handler.py`**: Coordena o fluxo de processamento
- **`error_handler.py`**: Tratamento centralizado e categorizado de erros

### 5. **Utils** (`utils/`)
- **`logger.py`**: Sistema de logging estruturado e configurável
- **`validators.py`**: Validações de dados e mensagens
- **`date_utils.py`**: Manipulação e conversão de datas

## Vantagens da Nova Estrutura

### ✅ **Separação de Responsabilidades**
- Cada arquivo tem uma função específica
- Fácil de entender e manter
- Testes unitários mais simples

### ✅ **Configuração Centralizada**
- Todas as variáveis em um lugar
- Validação automática de configurações
- Fácil de debugar problemas de configuração

### ✅ **Tratamento de Erros Robusto**
- Erros categorizados por tipo
- Logging estruturado e informativo
- Recuperação automática quando possível

### ✅ **Testabilidade**
- Cada serviço pode ser testado isoladamente
- Mocks e stubs mais fáceis de implementar
- Cobertura de testes mais alta

### ✅ **Manutenibilidade**
- Mudanças em um componente não afetam outros
- Código mais legível e organizado
- Fácil de estender com novas funcionalidades

## Como Usar

### 1. **Configuração**
```bash
# Copie o arquivo de exemplo
cp env.consumer.example .env

# Configure as variáveis necessárias
nano .env
```

### 2. **Execução**
```bash
# Execute o consumer
python main.py

# Ou usando Docker
docker build -f Dockerfile.listener -t consumer .
docker run --env-file .env consumer
```

### 3. **Monitoramento**
O sistema agora fornece logs estruturados e informativos:
```
🔧 Configurações carregadas
   Fila SQS: applications-queue
   Endpoint SQS: http://localhost:4566
   Backend: http://localhost:3000
   Max Retries: 3
   Log Level: INFO

📊 Status dos serviços:
   SQS: ✅ Conectado
   Backend: ✅ Disponível
   IA Service: ✅ Inicializado

🎧 Iniciando processamento de mensagens
⏳ Aguardando mensagens... (Ctrl+C para parar)
```

## Migração do Código Antigo

### 🔄 **O que Mudou**
- `sqs_listener.py` → Dividido em múltiplos serviços
- Funções misturadas → Separadas por responsabilidade
- Configurações hardcoded → Centralizadas e configuráveis
- Logging básico → Sistema estruturado

### 🔄 **O que Permaneceu**
- Lógica de processamento de currículos
- Integração com OpenAI
- Comunicação com backend
- Tratamento de retry

### 🔄 **Como Migrar**
1. **Configuração**: Use o novo arquivo `env.consumer.example`
2. **Execução**: Use `python main.py` em vez de `python sqs_listener.py`
3. **Logs**: Os logs agora são mais informativos e estruturados
4. **Monitoramento**: Use o método `get_status()` para verificar saúde dos serviços

## Extensibilidade

### 🚀 **Adicionar Novos Processadores**
```python
# Em services/
class NewProcessor:
    async def process(self, data):
        # Sua lógica aqui
        pass

# Em message_handler.py
if 'newType' in message_data:
    result = await new_processor.process(message_data)
```

### 🚀 **Adicionar Novos Handlers de Erro**
```python
# Em error_handler.py
@staticmethod
def handle_new_error(error: Exception, context: Dict[str, Any]):
    # Seu tratamento aqui
    pass
```

### 🚀 **Adicionar Novas Validações**
```python
# Em validators.py
def validate_new_field(data: Dict[str, Any]) -> bool:
    # Sua validação aqui
    pass
```

## Benefícios para a Equipe

### 👥 **Desenvolvedores**
- Código mais fácil de entender
- Menos tempo para debugar problemas
- Implementação de features mais rápida

### 👥 **DevOps**
- Logs estruturados para monitoramento
- Configurações centralizadas
- Fácil de containerizar e escalar

### 👥 **QA**
- Testes unitários mais simples
- Melhor cobertura de testes
- Debugging mais eficiente

## Conclusão

A nova estrutura transforma o consumer de um arquivo monolítico confuso em um sistema modular, organizado e fácil de manter. Cada componente tem uma responsabilidade clara, facilitando o desenvolvimento, teste e manutenção do código.

**Antes**: Um arquivo com 600+ linhas misturando tudo
**Depois**: Múltiplos arquivos pequenos e focados

Esta abordagem segue as melhores práticas de desenvolvimento de software e torna o projeto muito mais profissional e escalável.
