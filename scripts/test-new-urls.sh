#!/bin/bash

# Script para testar a nova estrutura de URLs
# Testa se o roteamento baseado em path está funcionando corretamente

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Verificar se o Docker está rodando
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker não está rodando. Inicie o Docker e tente novamente."
        exit 1
    fi
    print_message "Docker está rodando"
}

# Verificar se o docker compose está rodando
check_docker_compose() {
    if ! docker compose ps | grep -q "caddy-proxy"; then
        print_error "Serviço Caddy não está rodando. Execute: docker compose up -d"
        exit 1
    fi
    print_message "Serviço Caddy está rodando"
}

# Testar roteamento baseado em path
test_path_based_routing() {
    print_message "Testando roteamento baseado em path..."
    
    local test_domains=("gupy.localhost" "empresa1.localhost" "teste.localhost")
    
    for domain in "${test_domains[@]}"; do
        print_message "Testando domínio: $domain"
        
        # Testar frontend (rota raiz)
        if curl -s -I "http://$domain" | grep -q "HTTP/"; then
            print_success "Frontend ($domain) respondeu"
        else
            print_warning "Frontend ($domain) não respondeu"
        fi
        
        # Testar backend (rota /api)
        if curl -s -I "http://$domain/api" | grep -q "HTTP/"; then
            print_success "Backend ($domain/api) respondeu"
        else
            print_warning "Backend ($domain/api) não respondeu"
        fi
        
        # Testar se o path /api é removido corretamente
        if curl -s "http://$domain/api" | grep -q "Cannot GET /"; then
            print_success "Path /api removido corretamente (erro 404 esperado)"
        else
            print_warning "Path /api não foi removido corretamente"
        fi
    done
}

# Testar se o CORS está funcionando
test_cors() {
    print_message "Testando configuração CORS..."
    
    local test_domain="gupy.localhost"
    
    # Testar preflight OPTIONS
    if curl -s -X OPTIONS -H "Origin: http://$test_domain" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type" \
        "http://$test_domain/api" | grep -q "HTTP/"; then
        print_success "CORS preflight funcionando"
    else
        print_warning "CORS preflight pode não estar funcionando"
    fi
}

# Testar endpoints específicos da API
test_api_endpoints() {
    print_message "Testando endpoints específicos da API..."
    
    local test_domain="gupy.localhost"
    
    # Testar endpoint de health check (se existir)
    if curl -s "http://$test_domain/api" | grep -q "Cannot GET /"; then
        print_success "API base endpoint respondeu (erro 404 esperado)"
    else
        print_warning "API base endpoint não respondeu como esperado"
    fi
    
    # Testar se o Caddy está removendo o prefixo /api
    if curl -s "http://$test_domain/api/companies" | grep -q "Cannot GET /companies"; then
        print_success "Prefix /api removido corretamente para /companies"
    else
        print_warning "Prefix /api não foi removido corretamente"
    fi
}

# Verificar logs do Caddy
check_caddy_logs() {
    print_message "Verificando logs do Caddy..."
    
    local logs=$(docker compose logs --tail=20 caddy-proxy)
    if echo "$logs" | grep -q "ERROR"; then
        print_warning "Encontrados erros nos logs do Caddy:"
        echo "$logs" | grep "ERROR"
    else
        print_success "Logs do Caddy sem erros"
    fi
}

# Função principal
main() {
    print_header "Teste da Nova Estrutura de URLs"
    
    check_docker
    check_docker_compose
    
    echo
    
    test_path_based_routing
    echo
    
    test_cors
    echo
    
    test_api_endpoints
    echo
    
    check_caddy_logs
    
    echo
    print_header "Teste Concluído!"
    
    print_message "Nova estrutura de URLs:"
    print_message "- Frontend: http://gupy.localhost"
    print_message "- Backend: http://gupy.localhost/api"
    print_message "- AI Service: http://ai.localhost"
    
    echo
    print_message "Para testar manualmente:"
    print_message "1. Acesse: http://gupy.localhost (deve mostrar o frontend)"
    print_message "2. Acesse: http://gupy.localhost/api (deve mostrar erro 404 da API)"
    print_message "3. Acesse: http://gupy.localhost/api/companies (deve mostrar erro 404 da API)"
}

# Executar função principal
main "$@"
