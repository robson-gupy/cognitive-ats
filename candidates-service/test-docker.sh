#!/bin/bash

# Script de teste para o Candidates Service com Docker Compose
echo "🐳 Testando Candidates Service com Docker Compose..."
echo ""

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Inicie o Docker Desktop primeiro."
    exit 1
fi

echo "✅ Docker está rodando"
echo ""

# Verificar se o docker-compose está disponível
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose não está instalado ou não está no PATH"
    exit 1
fi

echo "✅ docker-compose está disponível"
echo ""

# Navegar para o diretório raiz do projeto
cd /Users/robson/src/gupy/cognitive-ats

echo "📁 Diretório atual: $(pwd)"
echo ""

# Verificar se o arquivo docker-compose.yml existe
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml não encontrado"
    exit 1
fi

echo "✅ docker-compose.yml encontrado"
echo ""

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado. Copiando do env.example..."
    cp env.example .env
    echo "✅ Arquivo .env criado. Edite-o com suas configurações se necessário."
    echo ""
fi

echo "✅ Arquivo .env configurado"
echo ""

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down
echo ""

# Construir e iniciar os serviços
echo "🚀 Construindo e iniciando os serviços..."
docker-compose up -d --build

# Aguardar os serviços iniciarem
echo ""
echo "⏳ Aguardando os serviços iniciarem..."
sleep 10

# Verificar status dos containers
echo ""
echo "📊 Status dos containers:"
docker-compose ps

echo ""

# Testar o candidates-service
echo "🧪 Testando Candidates Service..."
echo ""

# Testar health check
echo "📡 Health check:"
if curl -s http://localhost:3002/health > /dev/null; then
    echo "✅ Candidates Service está respondendo na porta 3002"
else
    echo "❌ Candidates Service não está respondendo na porta 3002"
fi

echo ""

# Testar página principal
echo "🌐 Testando página principal:"
if curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3002; then
    echo "✅ Página principal está funcionando"
else
    echo "❌ Página principal não está funcionando"
fi

echo ""

# Verificar logs do candidates-service
echo "📋 Últimos logs do Candidates Service:"
docker-compose logs --tail=10 candidates-service

echo ""

# Instruções para testar subdomínios
echo "🎯 Para testar subdomínios:"
echo ""
echo "1. Adicione no seu arquivo /etc/hosts:"
echo "   127.0.0.1 gupy.jobs.localhost"
echo "   127.0.0.1 empresa.jobs.localhost"
echo "   127.0.0.1 startup.jobs.localhost"
echo ""
echo "2. Acesse os subdomínios:"
echo "   http://gupy.jobs.localhost"
echo "   http://empresa.jobs.localhost"
echo "   http://startup.jobs.localhost"
echo ""
echo "3. Ou acesse diretamente:"
echo "   http://localhost:3002"
echo ""
echo "4. Para ver logs em tempo real:"
echo "   docker-compose logs -f candidates-service"
echo ""
echo "5. Para parar todos os serviços:"
echo "   docker-compose down"
echo ""
echo "�� Teste concluído!"
