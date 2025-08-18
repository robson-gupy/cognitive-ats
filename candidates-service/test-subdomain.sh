#!/bin/bash

# Script de teste para verificar a funcionalidade de subdomínios
# Execute este script após iniciar o candidates-service

echo "🧪 Testando funcionalidade de subdomínios..."
echo ""

# Verificar se o serviço está rodando
echo "📡 Verificando se o candidates-service está rodando..."
if curl -s http://localhost:3002/health > /dev/null; then
    echo "✅ Candidates Service está rodando na porta 3002"
else
    echo "❌ Candidates Service não está rodando na porta 3002"
    echo "   Execute: npm run start:dev"
    exit 1
fi

echo ""

# Testar página genérica (sem subdomínio)
echo "🌐 Testando página genérica (localhost:3002)..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3002

echo ""

# Testar com subdomínio gupy
echo "🏢 Testando subdomínio gupy.jobs.localhost..."
echo "   Adicione no /etc/hosts: 127.0.0.1 gupy.jobs.localhost"
echo "   Acesse: http://gupy.jobs.localhost:3002"

echo ""

# Testar com subdomínio empresa
echo "🏢 Testando subdomínio empresa.jobs.localhost..."
echo "   Adicione no /etc/hosts: 127.0.0.1 empresa.jobs.localhost"
echo "   Acesse: http://empresa.jobs.localhost:3002"

echo ""

# Verificar se o companies-service está rodando
echo "🔍 Verificando se o companies-service está rodando..."
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Companies Service está rodando na porta 3001"
    echo "   Teste a API: http://localhost:3001/public/gupy/jobs"
else
    echo "⚠️  Companies Service não está rodando na porta 3001"
    echo "   Para testar vagas reais, inicie o companies-service:"
    echo "   cd ../companies-service/backend && npm run start:dev"
fi

echo ""
echo "🎯 Para testar completamente:"
echo "1. Adicione no /etc/hosts:"
echo "   127.0.0.1 gupy.jobs.localhost"
echo "   127.0.0.1 empresa.jobs.localhost"
echo ""
echo "2. Acesse os subdomínios:"
echo "   http://gupy.jobs.localhost:3002"
echo "   http://empresa.jobs.localhost:3002"
echo ""
echo "3. Verifique se as vagas são exibidas corretamente"
