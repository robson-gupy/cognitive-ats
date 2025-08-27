#!/bin/bash

# Script para testar o CLI Genérico do AI Service
# Uso: ./testar_cli.sh

echo "🧪 Testando CLI Genérico do AI Service"
echo "======================================"

# Verifica se a venv existe
if [ ! -d ".venv" ]; then
    echo "❌ Diretório .venv não encontrado"
    echo "Execute 'python -m venv .venv' para criar a venv"
    exit 1
fi

# Ativa a venv
echo "🔧 Ativando venv..."
source .venv/bin/activate

# Verifica se o CLI existe
if [ ! -f "ai_service_cli.py" ]; then
    echo "❌ Arquivo ai_service_cli.py não encontrado"
    exit 1
fi

echo "✅ Venv ativada"
echo ""

# Testa a ajuda geral do CLI
echo "📖 Testando ajuda geral do CLI..."
python ai_service_cli.py --help
echo ""

# Testa a ajuda específica de cada comando
echo "📖 Testando ajuda do comando 'resume'..."
python ai_service_cli.py resume --help
echo ""

echo "📖 Testando ajuda do comando 'jobs'..."
python ai_service_cli.py jobs --help
echo ""

echo "📖 Testando ajuda do comando 'ai'..."
python ai_service_cli.py ai --help
echo ""

# Testa comando jobs (deve mostrar que não está implementado)
echo "🔍 Testando comando 'jobs' (não implementado)..."
python ai_service_cli.py jobs --action create --input vaga.json
echo ""

# Testa comando ai (deve mostrar que não está implementado)
echo "🔍 Testando comando 'ai' (não implementado)..."
python ai_service_cli.py ai --model gpt-4 --prompt "Teste"
echo ""

# Testa validação de arquivo inexistente no comando resume
echo "🔍 Testando validação de arquivo inexistente no comando 'resume'..."
python ai_service_cli.py resume --pdf arquivo_inexistente.pdf --application-id TEST123
echo ""

# Verifica se o arquivo .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado"
    echo "Para usar o CLI com IA, crie o arquivo .env:"
    echo "  cp env.example .env"
    echo "  # Edite o arquivo com suas chaves de API"
    echo ""
fi

echo "🎯 Testes concluídos!"
echo ""
echo "📋 Para usar o CLI com funcionalidades reais:"
echo "  1. Configure o arquivo .env com suas chaves de API"
echo "  2. Execute: python ai_service_cli.py resume --pdf seu_arquivo.pdf --application-id ID123"
echo ""
echo "🔮 Comandos disponíveis:"
echo "  - resume: Processamento de currículos (implementado)"
echo "  - jobs:   Operações de vagas (futuro)"
echo "  - ai:     Operações gerais de IA (futuro)"
echo ""
echo "📚 Para mais informações, consulte:"
echo "  - CLI_README.md (documentação completa)"
echo "  - exemplo_uso_cli.md (exemplos práticos)"
echo ""
echo "🧪 Para testar comandos específicos:"
echo "  python ai_service_cli.py resume --help"
echo "  python ai_service_cli.py jobs --help"
echo "  python ai_service_cli.py ai --help"
