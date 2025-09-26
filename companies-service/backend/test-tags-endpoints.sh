#!/bin/bash

# Script para testar os endpoints de tags
# Requer que o serviço esteja rodando em http://localhost:3000

BASE_URL="http://localhost:3000"
JWT_TOKEN=""

echo "🧪 Testando endpoints de Tags"
echo "=============================="

# Função para fazer login e obter token JWT
login() {
    echo "🔐 Fazendo login..."
    
    # Substitua com credenciais válidas do seu sistema
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "admin@company.com",
            "password": "password123"
        }')
    
    if [ $? -eq 0 ]; then
        JWT_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
        if [ -n "$JWT_TOKEN" ]; then
            echo "✅ Login realizado com sucesso"
            echo "Token: ${JWT_TOKEN:0:20}..."
        else
            echo "❌ Falha ao extrair token JWT"
            echo "Resposta: $LOGIN_RESPONSE"
            exit 1
        fi
    else
        echo "❌ Falha na requisição de login"
        exit 1
    fi
}

# Função para criar uma tag
create_tag() {
    echo "📝 Criando tag de teste..."
    
    CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/tags" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "label": "Candidato Promissor",
            "color": "#10B981",
            "textColor": "#FFFFFF"
        }')
    
    if [ $? -eq 0 ]; then
        echo "✅ Tag criada com sucesso"
        echo "Resposta: $CREATE_RESPONSE"
        
        # Extrair ID da tag criada para testes subsequentes
        TAG_ID=$(echo $CREATE_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
        if [ -n "$TAG_ID" ]; then
            echo "ID da tag: $TAG_ID"
            export TAG_ID
        fi
    else
        echo "❌ Falha ao criar tag"
        echo "Resposta: $CREATE_RESPONSE"
    fi
}

# Função para listar todas as tags
list_tags() {
    echo "📋 Listando todas as tags..."
    
    LIST_RESPONSE=$(curl -s -X GET "$BASE_URL/tags" \
        -H "Authorization: Bearer $JWT_TOKEN")
    
    if [ $? -eq 0 ]; then
        echo "✅ Tags listadas com sucesso"
        echo "Resposta: $LIST_RESPONSE"
    else
        echo "❌ Falha ao listar tags"
        echo "Resposta: $LIST_RESPONSE"
    fi
}

# Função para buscar uma tag específica
get_tag() {
    if [ -z "$TAG_ID" ]; then
        echo "⚠️  TAG_ID não disponível, pulando teste de busca"
        return
    fi
    
    echo "🔍 Buscando tag específica (ID: $TAG_ID)..."
    
    GET_RESPONSE=$(curl -s -X GET "$BASE_URL/tags/$TAG_ID" \
        -H "Authorization: Bearer $JWT_TOKEN")
    
    if [ $? -eq 0 ]; then
        echo "✅ Tag encontrada com sucesso"
        echo "Resposta: $GET_RESPONSE"
    else
        echo "❌ Falha ao buscar tag"
        echo "Resposta: $GET_RESPONSE"
    fi
}

# Função para atualizar uma tag
update_tag() {
    if [ -z "$TAG_ID" ]; then
        echo "⚠️  TAG_ID não disponível, pulando teste de atualização"
        return
    fi
    
    echo "✏️  Atualizando tag (ID: $TAG_ID)..."
    
    UPDATE_RESPONSE=$(curl -s -X PATCH "$BASE_URL/tags/$TAG_ID" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "color": "#EF4444",
            "textColor": "#000000"
        }')
    
    if [ $? -eq 0 ]; then
        echo "✅ Tag atualizada com sucesso"
        echo "Resposta: $UPDATE_RESPONSE"
    else
        echo "❌ Falha ao atualizar tag"
        echo "Resposta: $UPDATE_RESPONSE"
    fi
}

# Função para remover uma tag
delete_tag() {
    if [ -z "$TAG_ID" ]; then
        echo "⚠️  TAG_ID não disponível, pulando teste de remoção"
        return
    fi
    
    echo "🗑️  Removendo tag (ID: $TAG_ID)..."
    
    DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/tags/$TAG_ID" \
        -H "Authorization: Bearer $JWT_TOKEN")
    
    if [ $? -eq 0 ]; then
        echo "✅ Tag removida com sucesso"
        echo "Código de resposta: $DELETE_RESPONSE"
    else
        echo "❌ Falha ao remover tag"
        echo "Resposta: $DELETE_RESPONSE"
    fi
}

# Função para testar endpoint sem autenticação
test_unauthorized() {
    echo "🚫 Testando acesso sem autenticação..."
    
    UNAUTH_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/tags")
    
    if [ $? -eq 0 ]; then
        echo "✅ Requisição sem autenticação retornou erro apropriado"
        echo "Resposta: $UNAUTH_RESPONSE"
    else
        echo "❌ Falha na requisição sem autenticação"
    fi
}

# Executar testes
main() {
    echo "🚀 Iniciando testes dos endpoints de tags..."
    echo ""
    
    # Teste sem autenticação
    test_unauthorized
    echo ""
    
    # Login
    login
    echo ""
    
    if [ -z "$JWT_TOKEN" ]; then
        echo "❌ Não foi possível obter token JWT. Abortando testes."
        exit 1
    fi
    
    # Testes com autenticação
    create_tag
    echo ""
    
    list_tags
    echo ""
    
    get_tag
    echo ""
    
    update_tag
    echo ""
    
    # Listar novamente para ver as mudanças
    list_tags
    echo ""
    
    delete_tag
    echo ""
    
    # Listar novamente para confirmar remoção
    list_tags
    echo ""
    
    echo "🎉 Testes concluídos!"
}

# Executar função principal
main
