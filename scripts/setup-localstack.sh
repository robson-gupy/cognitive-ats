#!/bin/bash

# Script para configurar o LocalStack e criar os recursos AWS necessários

echo "Configurando LocalStack..."

# Aguardar o LocalStack estar pronto
echo "Aguardando LocalStack estar pronto..."
until curl -s http://localhost:4566/health > /dev/null; do
    echo "LocalStack ainda não está pronto, aguardando..."
    sleep 2
done

echo "LocalStack está pronto!"

# Criar bucket S3 para uploads
echo "Criando bucket S3..."
docker run --rm --network cognitive-ats_cognitive-ats-network \
    -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
    -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
    -e AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION \
    amazon/aws-cli:latest s3 mb s3://$RESUMES_BUCKET_NAME \
    --endpoint-url=http://localstack:4566

# Configurar bucket para acesso público (para desenvolvimento)
echo "Configurando bucket para acesso público..."
docker run --rm --network cognitive-ats_cognitive-ats-network \
    -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
    -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
    -e AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION \
    amazon/aws-cli:latest s3api put-bucket-acl \
    --bucket $RESUMES_BUCKET_NAME \
    --acl public-read \
    --endpoint-url=http://localstack:4566

# Configurar política de bucket para acesso público
echo "Configurando política de bucket..."
docker run --rm --network cognitive-ats_cognitive-ats-network \
    -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
    -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
    -e AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION \
    amazon/aws-cli:latest s3api put-bucket-policy \
    --bucket $RESUMES_BUCKET_NAME \
    --policy '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::$RESUMES_BUCKET_NAME/*"
            }
        ]
    }' \
    --endpoint-url=http://localstack:4566

# Criar fila SQS para aplicações
echo "Criando as filas SQS..."
docker run --rm --network cognitive-ats_cognitive-ats-network \
    -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
    -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
    -e AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION \
    amazon/aws-cli:latest sqs create-queue \
    --queue-name $APPLICATIONS_SQS_QUEUE_NAME \
    --attributes '{"VisibilityTimeout": "30", "MessageRetentionPeriod": "1209600"}' \
    --endpoint-url=http://localstack:4566

docker run --rm --network cognitive-ats_cognitive-ats-network \
    -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
    -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
    -e AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION \
    amazon/aws-cli:latest sqs create-queue \
    --queue-name $APPLICATIONS_AI_SCORE_SQS_QUEUE_NAME \
    --attributes '{"VisibilityTimeout": "30", "MessageRetentionPeriod": "1209600"}' \
    --endpoint-url=http://localstack:4566

docker run --rm --network cognitive-ats_cognitive-ats-network \
    -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
    -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
    -e AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION \
    amazon/aws-cli:latest sqs create-queue \
    --queue-name $QUESTION_RESPONSES_SQS_QUEUE_NAME \
    --attributes '{"VisibilityTimeout": "30", "MessageRetentionPeriod": "1209600"}' \
    --endpoint-url=http://localstack:4566

# Listar recursos criados
echo "Recursos criados:"
echo "Buckets S3:"
docker run --rm --network cognitive-ats_cognitive-ats-network \
    -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
    -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
    -e AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION \
    amazon/aws-cli:latest s3 ls --endpoint-url=http://localstack:4566

echo "Filas SQS:"
docker run --rm --network cognitive-ats_cognitive-ats-network \
    -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
    -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
    -e AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION \
    amazon/aws-cli:latest sqs list-queues --endpoint-url=http://localstack:4566

echo "Configuração do LocalStack concluída!"
echo ""
echo "Acessos:"
echo "- LocalStack: http://localhost:4566" 