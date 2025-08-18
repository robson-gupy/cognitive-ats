#!/bin/bash

# Script para testar o Candidates Service
echo "🧪 Testando Candidates Service..."

# Verificar se o container está rodando
if ! docker ps | grep -q "cognitive-ats-candidates-service"; then
    echo "❌ Candidates Service não está rodando. Iniciando..."
    docker-compose up -d candidates-service
    sleep 10
fi

# Testar acesso direto na porta 3001
echo "📡 Testando acesso direto na porta 3001..."
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Candidates Service acessível na porta 3001"
else
    echo "❌ Candidates Service não acessível na porta 3001"
fi

# Testar via proxy Caddy (se estiver rodando)
if docker ps | grep -q "cognitive-ats-caddy-proxy"; then
    echo "🌐 Testando via proxy Caddy..."
    
    # Testar domínio genérico
    if curl -s -H "Host: empresa.jobs.localhost" http://localhost > /dev/null; then
        echo "✅ Proxy Caddy funcionando para *.jobs.localhost"
    else
        echo "❌ Proxy Caddy não funcionando para *.jobs.localhost"
    fi
else
    echo "⚠️  Proxy Caddy não está rodando"
fi

# Verificar logs
echo "📋 Últimos logs do Candidates Service:"
docker-compose logs --tail=10 candidates-service

echo "�� Teste concluído!"
