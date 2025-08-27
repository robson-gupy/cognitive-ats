# Exemplo de Uso do CLI Genérico

## 🚀 Como usar o CLI genérico para diferentes operações

### 1. Pré-requisitos

Antes de usar o CLI, certifique-se de:

1. **Ativar a venv do projeto:**
   ```bash
   source .venv/bin/activate
   ```

2. **Configurar o arquivo .env:**
   ```bash
   cp env.example .env
   # Edite o arquivo .env com suas chaves de API
   ```

3. **Ter os arquivos necessários para cada comando**

### 2. Comando: `resume` - Processamento de currículos

#### Uso básico
```bash
# Com a venv ativada
python ai_service_cli.py resume --pdf meu_curriculo.pdf --application-id APP123
```

#### Com saída em arquivo
```bash
python ai_service_cli.py resume \
  --pdf meu_curriculo.pdf \
  --application-id APP123 \
  --output resultado_processamento.json
```

#### Usando atalhos
```bash
python ai_service_cli.py resume -p meu_curriculo.pdf -a APP123 -o resultado.json
```

#### Modo verboso
```bash
python ai_service_cli.py resume \
  --pdf meu_curriculo.pdf \
  --application-id APP123 \
  --verbose
```

### 3. Comando: `jobs` - Operações de vagas (futuro)

#### Análise de vaga
```bash
python ai_service_cli.py jobs --action analyze --input vaga.json
```

#### Criação de vaga
```bash
python ai_service_cli.py jobs --action create --input dados_vaga.json
```

#### Melhoria de vaga
```bash
python ai_service_cli.py jobs --action enhance --input vaga_original.json
```

### 4. Comando: `ai` - Operações gerais de IA (futuro)

#### Análise de texto
```bash
python ai_service_cli.py ai --model gpt-4 --prompt "Analise este texto"
```

#### Geração de conteúdo
```bash
python ai_service_cli.py ai --model gpt-3.5-turbo --prompt "Gere um resumo"
```

### 5. Ajuda e documentação

#### Ajuda geral
```bash
python ai_service_cli.py --help
```

#### Ajuda específica de cada comando
```bash
python ai_service_cli.py resume --help
python ai_service_cli.py jobs --help
python ai_service_cli.py ai --help
```

### 6. Saída esperada

#### Sucesso (resume):
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

#### Comando não implementado (jobs/ai):
```
🚧 Comando 'jobs' ainda não implementado
   Ação solicitada: create
   Arquivo de entrada: vaga.json

==================================================
📋 RESUMO DO COMANDO: JOBS
==================================================
❌ Status: Falha
📝 Mensagem: Comando jobs ainda não implementado
==================================================
```

#### Erro de configuração:
```
❌ Erro ao inicializar processador: Provider 'openai' não está configurado
```

### 7. Estrutura de arquivos necessários

```
ai-service/
├── .env                    # Configurações de API (criar a partir de env.example)
├── ai_service_cli.py      # CLI genérico principal
├── CLI_README.md          # Documentação completa
├── exemplo_uso_cli.md     # Este arquivo
├── testar_cli.sh         # Script de teste
├── [seu_arquivo.pdf]      # Arquivo PDF para processamento de currículos
├── [vaga.json]            # Arquivo JSON para operações de vagas (futuro)
└── [texto.txt]            # Arquivo de texto para operações de IA (futuro)
```

### 8. Solução de problemas

#### Erro: "Provider 'openai' não está configurado"
- Verifique se o arquivo `.env` existe
- Confirme se `OPENAI_API_KEY` está configurada
- Verifique se a venv está ativada

#### Erro: "Comando não encontrado"
- Verifique se está usando o comando correto
- Use `python process_resume_cli.py --help` para ver comandos disponíveis
- Confirme a sintaxe: `python process_resume_cli.py [comando] [opções]`

#### Erro: "Arquivo não encontrado"
- Verifique o caminho do arquivo
- Use caminho absoluto se necessário
- Confirme se o arquivo existe

#### Erro: "Arquivo não é um PDF válido"
- Verifique se o arquivo é realmente um PDF
- Tente abrir o arquivo em um leitor de PDF
- Verifique se o arquivo não está corrompido

### 9. Integração com scripts

O CLI pode ser facilmente integrado em scripts:

```bash
#!/bin/bash
# Script de exemplo para múltiplos comandos

# Ativa a venv
source .venv/bin/activate

# Processa currículos
for pdf in curriculos/*.pdf; do
    echo "Processando currículo: $pdf"
    python ai_service_cli.py resume \
      --pdf "$pdf" \
      --application-id "APP_$(basename "$pdf" .pdf)" \
      --output "resultados/curriculos/$(basename "$pdf" .pdf).json"
done

# Processa vagas (quando implementado)
for vaga in vagas/*.json; do
    echo "Processando vaga: $vaga"
    python ai_service_cli.py jobs \
      --action analyze \
      --input "$vaga"
done

# Operações de IA (quando implementado)
for texto in textos/*.txt; do
    echo "Processando texto: $texto"
    python ai_service_cli.py ai \
      --model gpt-3.5-turbo \
      --prompt "Analise este arquivo: $texto"
done
```

### 10. Exit codes

- `0`: Sucesso
- `1`: Erro de processamento
- `130`: Interrupção pelo usuário (Ctrl+C)

### 11. Logs e debug

Para mais detalhes, verifique:
- Saída do CLI no terminal
- Logs do sistema (se configurados)
- Arquivo de resultado JSON (se usado --output)
- Ajuda específica de cada comando

### 12. Extensibilidade

O CLI foi projetado para ser facilmente extensível:

- **Novos comandos**: Herde de `BaseCommand` e implemente a lógica
- **Novos argumentos**: Adicione em `add_arguments()` de cada comando
- **Novas funcionalidades**: Integre com os serviços existentes do sistema

### 13. Testando diferentes cenários

#### Teste básico
```bash
python ai_service_cli.py --help
```

#### Teste de comando específico
```bash
python ai_service_cli.py resume --help
```

#### Teste de validação
```bash
python ai_service_cli.py resume --pdf arquivo_inexistente.pdf --application-id TEST123
```

#### Teste de comando futuro
```bash
python ai_service_cli.py jobs --action create --input vaga.json
```
