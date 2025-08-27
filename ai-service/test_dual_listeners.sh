#!/bin/bash

# Script de teste para demonstrar os dois listeners SQS
# CVs e Scores funcionando em paralelo com FLUXO AUTOMATIZADO

echo "🚀 Testando Sistema de Dois Listeners SQS com Fluxo Automatizado"
echo "================================================================"
echo

# Verificar se o Docker Compose está rodando
if ! docker ps | grep -q "localstack"; then
    echo "❌ LocalStack não está rodando. Inicie o docker-compose primeiro:"
    echo "   docker-compose up -d"
    exit 1
fi

if ! docker ps | grep -q "postgres"; then
    echo "❌ PostgreSQL não está rodando. Inicie o docker-compose primeiro:"
    echo "   docker-compose up -d"
    exit 1
fi

echo "✅ Serviços Docker verificados"
echo

# Configurar variáveis de ambiente
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_REGION=us-east-1

# Criar filas SQS se não existirem
echo "🔧 Configurando filas SQS..."

# Fila para CVs
aws --endpoint-url=http://localhost:4566 sqs create-queue \
    --queue-name applications-queue \
    --attributes '{"MessageRetentionPeriod": "1209600"}' \
    --region us-east-1

# Fila para Scores
aws --endpoint-url=http://localhost:4566 sqs create-queue \
    --queue-name applications-ai-score-queue \
    --attributes '{"MessageRetentionPeriod": "1209600"}' \
    --region us-east-1

echo "✅ Filas SQS criadas/configuradas"
echo

# Listar filas
echo "📋 Filas SQS disponíveis:"
aws --endpoint-url=http://localhost:4566 sqs list-queues --region us-east-1
echo

# Função para enviar mensagem de CV (que dispara o fluxo automatizado)
send_cv_message() {
    local application_id=$1
    local job_id=$2
    
    aws --endpoint-url=http://localhost:4566 sqs send-message \
        --queue-url http://localhost:4566/000000000000/applications-queue \
        --message-body "{
            \"resumeUrl\": \"https://exemplo.com/cv-${application_id}.pdf\",
            \"applicationId\": \"${application_id}\",
            \"jobId\": \"${job_id}\",
            \"companyId\": \"company-123\"
        }" \
        --region us-east-1
    
    echo "📄 Mensagem de CV enviada para application ${application_id} (dispara fluxo automatizado)"
}

# Função para enviar mensagem de score (método manual - opcional)
send_score_message() {
    local application_id=$1
    local candidate_name=$2
    
    aws --endpoint-url=http://localhost:4566 sqs send-message \
        --queue-url http://localhost:4566/000000000000/applications-ai-score-queue \
        --message-body "{
            \"applicationId\": \"${application_id}\",
            \"resumeData\": {
                \"personal_info\": {
                    \"name\": \"${candidate_name}\",
                    \"email\": \"${candidate_name,,}@email.com\"
                },
                \"education\": [
                    {
                        \"degree\": \"Bacharelado em Computação\",
                        \"institution\": \"Universidade Federal\",
                        \"year\": \"2022\"
                    }
                ],
                \"experience\": [
                    {
                        \"title\": \"Desenvolvedor Full Stack\",
                        \"company\": \"Tech Corp\",
                        \"duration\": \"2 anos\",
                        \"description\": \"React, Node.js, TypeScript\"
                    }
                ],
                \"skills\": [\"JavaScript\", \"React\", \"Node.js\", \"TypeScript\"]
            },
            \"jobData\": {
                \"title\": \"Desenvolvedor Full Stack Senior\",
                \"description\": \"Desenvolvimento de aplicações web modernas\",
                \"requirements\": [\"React\", \"Node.js\", \"TypeScript\"],
                \"education_required\": \"Bacharelado em Computação\",
                \"experience_required\": \"3+ anos\"
            },
            \"questionResponses\": [
                {
                    \"question\": \"Como você lida com prazos apertados?\",
                    \"answer\": \"Uso metodologias ágeis e organizo tarefas por prioridade\"
                }
            ]
        }" \
        --region us-east-1
    
    echo "📊 Mensagem de score manual enviada para application ${application_id}"
}

# Enviar mensagens de teste
echo "📤 Enviando mensagens de teste..."
echo

echo "🔄 FLUXO AUTOMATIZADO - Enviando para fila de CVs:"
echo "   (O sistema automaticamente enviará para fila de scores após processamento)"
echo

# Mensagens de CV (disparam fluxo automatizado)
send_cv_message "auto-cv-001" "job-001"
send_cv_message "auto-cv-002" "job-001"
send_cv_message "auto-cv-003" "job-002"

echo
echo "📊 MÉTODO MANUAL - Enviando diretamente para fila de scores:"
echo "   (Para casos onde você já tem os dados processados)"
echo

# Mensagens de Score (método manual)
send_score_message "manual-score-001" "João Silva"
send_score_message "manual-score-002" "Maria Santos"

echo
echo "✅ Mensagens de teste enviadas"
echo

# Verificar mensagens nas filas
echo "📊 Status das filas:"
echo

echo "📄 Fila de CVs (applications-queue):"
aws --endpoint-url=http://localhost:4566 sqs get-queue-attributes \
    --queue-url http://localhost:4566/000000000000/applications-queue \
    --attribute-names All \
    --region us-east-1 | jq '.Attributes.ApproximateNumberOfMessages // "0"'

echo "📊 Fila de Scores (applications-ai-score-queue):"
aws --endpoint-url=http://localhost:4566 sqs get-queue-attributes \
    --queue-url http://localhost:4566/000000000000/applications-ai-score-queue \
    --attribute-names All \
    --region us-east-1 | jq '.Attributes.ApproximateNumberOfMessages // "0"'

echo
echo "🎯 FLUXO AUTOMATIZADO - Como funciona:"
echo "======================================"
echo
echo "1. 📄 Você envia PDF para fila de CVs"
echo "2. 🔄 Sistema processa automaticamente:"
echo "   - Download do PDF"
echo "   - Parse com IA"
echo "   - Extração de dados"
echo "   - Envio para backend"
echo "   🚀 ENVIO AUTOMÁTICO para fila de scores"
echo "3. 📊 Sistema calcula scores automaticamente:"
echo "   - Recebe dados da fila de scores"
echo "   - Calcula scores com IA"
echo "   - Atualiza application no banco"
echo "4. ✅ Processo completo finalizado"
echo
echo "💡 VANTAGEM: Você só precisa enviar UMA mensagem para a fila de CVs!"
echo "   O sistema cuida de todo o resto automaticamente."
echo
echo "🎯 Próximos passos:"
echo "1. Inicie o consumer: cd ai-service/consumer && python main.py"
echo "2. Observe o fluxo automatizado funcionando:"
echo "   - CVs sendo processados"
echo "   - Dados sendo enviados automaticamente para fila de scores"
echo "   - Scores sendo calculados e salvos"
echo "3. Use Ctrl+C para parar quando quiser"
echo
echo "🔍 Para monitorar o fluxo em tempo real:"
echo "   # Terminal 1: Consumer"
echo "   cd ai-service/consumer && python main.py"
echo
echo "   # Terminal 2: Monitorar filas"
echo "   watch -n 2 'aws --endpoint-url=http://localhost:4566 sqs get-queue-attributes --queue-url http://localhost:4566/000000000000/applications-queue --attribute-names All --region us-east-1 | jq .Attributes.ApproximateNumberOfMessages'"
echo
echo "✅ Teste configurado com sucesso!"
echo
echo "🚀 FLUXO AUTOMATIZADO ATIVADO - O sistema agora funciona sozinho!"
