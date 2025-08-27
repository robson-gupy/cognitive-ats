# CLI Genérico para o AI Service

Este CLI genérico permite executar diferentes operações do sistema via linha de comando, incluindo o processamento de currículos e futuras funcionalidades.

## 📋 Pré-requisitos

- Python 3.7+
- Todas as dependências do projeto instaladas
- Arquivo `.env` configurado com as chaves de API necessárias
- Arquivo PDF válido para processamento de currículos

## 🚀 Como usar

### Estrutura geral

```bash
python ai_service_cli.py [comando] [opções]
```

### Comandos disponíveis

#### 1. `resume` - Processamento de currículos
```bash
python ai_service_cli.py resume --pdf caminho/para/arquivo.pdf --application-id ID123
```

**Parâmetros obrigatórios:**
- `--pdf` ou `-p`: Caminho para o arquivo PDF do currículo
- `--application-id` ou `-a`: ID da aplicação para o currículo

**Parâmetros opcionais:**
- `--output` ou `-o`: Arquivo de saída para salvar o resultado em JSON
- `--verbose` ou `-v`: Modo verboso com mais detalhes

#### 2. `jobs` - Operações relacionadas a vagas (futuro)
```bash
python ai_service_cli.py jobs --action create --input vaga.json
```

**Parâmetros:**
- `--action`: Ação a ser executada (create, enhance, analyze)
- `--input` ou `-i`: Arquivo de entrada para processamento

#### 3. `ai` - Operações gerais de IA (futuro)
```bash
python ai_service_cli.py ai --model gpt-4 --prompt "Analise este texto"
```

**Parâmetros:**
- `--model`: Modelo de IA a ser usado
- `--prompt` ou `-p`: Prompt para processamento

## 📝 Exemplos de uso

### Processar um currículo básico
```bash
# Com a venv ativada
python ai_service_cli.py resume --pdf meu_curriculo.pdf --application-id APP123
```

### Processar e salvar resultado
```bash
python ai_service_cli.py resume \
  --pdf meu_curriculo.pdf \
  --application-id APP123 \
  --output resultado_processamento.json
```

### Usando atalhos
```bash
python ai_service_cli.py resume -p meu_curriculo.pdf -a APP123 -o resultado.json
```

### Modo verboso
```bash
python ai_service_cli.py resume \
  --pdf meu_curriculo.pdf \
  --application-id APP123 \
  --verbose
```

### Ajuda geral
```bash
python ai_service_cli.py --help
```

### Ajuda específica de um comando
```bash
python ai_service_cli.py resume --help
python ai_service_cli.py jobs --help
python ai_service_cli.py ai --help
```

## 🔧 Como funciona

### Arquitetura modular

O CLI usa uma arquitetura modular baseada em comandos:

1. **BaseCommand**: Classe abstrata base para todos os comandos
2. **ResumeCommand**: Implementa processamento de currículos
3. **JobsCommand**: Placeholder para operações de vagas
4. **AICommand**: Placeholder para operações gerais de IA
5. **GenericCLI**: Gerencia e coordena todos os comandos

### Fluxo de execução

1. **Validação**: O CLI valida o comando solicitado
2. **Inicialização**: Inicializa o processador específico do comando
3. **Processamento**: Executa a lógica do comando
4. **Resultado**: Exibe o resultado e opcionalmente salva em arquivo

## 📊 Saída

### Sucesso:
```
✅ Processador de currículos inicializado
🔄 Processando currículo: meu_curriculo.pdf
   Application ID: APP123
✅ Currículo processado com sucesso!
   Tempo de processamento: 2.45s

==================================================
📋 RESUMO DO COMANDO: RESUME
==================================================
✅ Status: Sucesso
🆔 Application ID: APP123
⏱️  Tempo: 2.45s
🕐 Timestamp: 2025-08-27T13:30:00
📝 Mensagem: Currículo processado com sucesso
==================================================
```

### Erro:
```
❌ Erro ao inicializar processador: Provider 'openai' não está configurado
```

## 🚨 Tratamento de erros

- Validação de comandos e argumentos
- Verificação de dependências
- Tratamento de erros de processamento
- Exit codes apropriados para scripts

## 🔍 Debug

Para problemas, verifique:

1. Se o arquivo `.env` está configurado corretamente
2. Se todas as dependências estão instaladas
3. Se o comando está sendo usado corretamente
4. Se as chaves de API estão funcionando

## 📁 Estrutura de arquivos

```
ai-service/
├── ai_service_cli.py       # CLI genérico principal
├── CLI_README.md           # Este README
├── exemplo_uso_cli.md      # Exemplos práticos
├── testar_cli.sh          # Script de teste
├── consumer/               # Módulos do sistema
├── core/                   # Serviços de IA
└── shared/                 # Configurações compartilhadas
```

## 🐳 Executando em container

Se estiver usando Docker, execute dentro do container:

```bash
docker exec -it nome-do-container python process_resume_cli.py resume --pdf /caminho/para/arquivo.pdf --application-id ID123
```

## 🔮 Extensibilidade

### Adicionando novos comandos

Para adicionar um novo comando:

1. Crie uma nova classe que herda de `BaseCommand`
2. Implemente os métodos `add_arguments()` e `execute()`
3. Registre o comando em `GenericCLI._register_commands()`

### Exemplo de novo comando

```python
class NewCommand(BaseCommand):
    def __init__(self):
        super().__init__(
            name="new",
            description="Nova funcionalidade"
        )
    
    def add_arguments(self, parser):
        parser.add_argument('--option', help='Nova opção')
    
    async def execute(self, args):
        # Implementar lógica aqui
        return {"success": True, "message": "Comando executado"}
```

## 📝 Notas importantes

- O CLI não modifica arquivos existentes do projeto
- Usa a mesma infraestrutura do sistema principal
- Requer as mesmas configurações de ambiente
- Arquitetura modular permite fácil extensão
- Cada comando tem seus próprios argumentos e validações
- Gera IDs únicos para cada execução
