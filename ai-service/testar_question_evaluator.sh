#!/bin/bash

# Script para testar o QuestionEvaluator
echo "🧪 Testando QuestionEvaluator"
echo "================================"

# Verificar se estamos no diretório correto
if [ ! -f "test_question_evaluator.py" ]; then
    echo "❌ Execute este script do diretório ai-service"
    exit 1
fi

# Verificar se o ambiente virtual está ativado
if [ -z "$VIRTUAL_ENV" ]; then
    echo "🔧 Ativando ambiente virtual..."
    if [ -d ".venv" ]; then
        source .venv/bin/activate
    else
        echo "❌ Ambiente virtual não encontrado. Execute 'python -m venv .venv' primeiro"
        exit 1
    fi
fi

# Verificar se as dependências estão instaladas
echo "🔧 Verificando dependências..."
pip install -r requirements.txt > /dev/null 2>&1

# Verificar se a API key está configurada
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  OPENAI_API_KEY não configurada"
    echo "Configure a variável de ambiente:"
    echo "export OPENAI_API_KEY='sua-api-key-aqui'"
    echo ""
    echo "Ou adicione ao arquivo .env:"
    echo "OPENAI_API_KEY=sua-api-key-aqui"
    echo ""
    read -p "Deseja continuar mesmo sem API key? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Executar o teste
echo "🚀 Executando teste..."
python test_question_evaluator.py

echo ""
echo "✅ Teste concluído!"
