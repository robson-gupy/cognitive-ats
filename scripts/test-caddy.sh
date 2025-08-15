#!/bin/bash

# Script para testar o serviço Caddy
# Verifica se o proxy reverso está funcionando corretamente

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

# Testar endpoint de status
test_status_endpoint() {
    print_message "Testando endpoint de status..."
    
    if curl -s http://localhost > /dev/null; then
        print_success "Endpoint de status respondeu"
        curl -s http://localhost
        echo
    else
        print_error "Endpoint de status não respondeu"
        return 1
    fi
}

# Testar frontend das empresas
test_frontend_endpoints() {
    print_message "Testando endpoints do frontend..."
    
    local endpoints=("gupy.localhost" "empresa1.localhost" "teste.localhost")
    
    for endpoint in "${endpoints[@]}"; do
        print_message "Testando: $endpoint"
        if curl -s -I "http://$endpoint" | grep -q "HTTP/"; then
            print_success "$endpoint respondeu"
        else
            print_warning "$endpoint não respondeu"
        fi
    done
}

# Testar backend das empresas
test_backend_endpoints() {
    print_message "Testando endpoints do backend..."
    
    local endpoints=("gupy.localhost/api" "empresa1.localhost/api" "teste.localhost/api")
    
    for endpoint in "${endpoints[@]}"; do
        print_message "Testando: $endpoint"
        if curl -s -I "http://$endpoint" | grep -q "HTTP/"; then
            print_success "$endpoint respondeu"
        else
            print_warning "$endpoint não respondeu"
        fi
    done
}

# Testar serviço de IA
test_ai_endpoint() {
    print_message "Testando endpoint do AI Service..."
    
    if curl -s -I "http://ai.localhost" | grep -q "HTTP/"; then
        print_success "AI Service respondeu"
    else
        print_warning "AI Service não respondeu"
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

# Verificar saúde dos serviços
check_services_health() {
    print_message "Verificando saúde dos serviços..."
    
    local services=("companies-frontend" "companies-backend" "ai-service")
    
    for service in "${services[@]}"; do
        if docker compose ps | grep -q "$service.*Up"; then
            print_success "$service está rodando"
        else
            print_error "$service não está rodando"
        fi
    done
}

# Função principal
main() {
    print_header "Teste do Caddy Proxy Reverso"
    
    check_docker
    check_docker_compose
    check_services_health
    
    echo
    
    test_status_endpoint
    echo
    
    test_frontend_endpoints
    echo
    
    test_backend_endpoints
    echo
    
    test_ai_endpoint
    echo
    
    check_caddy_logs
    
    echo
    print_header "Teste Concluído!"
    
    print_message "Para acessar os serviços:"
    print_message "- Status: http://localhost"
    print_message "- Frontend: http://gupy.localhost"
    print_message "- Backend: http://gupy.localhost/api"
    print_message "- AI Service: http://ai.localhost"
}

# Executar função principal
main "$@"
