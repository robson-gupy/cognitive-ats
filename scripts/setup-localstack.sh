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
    -e AWS_ACCESS_KEY_ID=test \
    -e AWS_SECRET_ACCESS_KEY=test \
    -e AWS_DEFAULT_REGION=us-east-1 \
    amazon/aws-cli:latest s3 mb s3://cognitive-ats-uploads \
    --endpoint-url=http://localstack:4566

# Configurar bucket para acesso público (para desenvolvimento)
echo "Configurando bucket para acesso público..."
docker run --rm --network cognitive-ats_cognitive-ats-network \
    -e AWS_ACCESS_KEY_ID=test \
    -e AWS_SECRET_ACCESS_KEY=test \
    -e AWS_DEFAULT_REGION=us-east-1 \
    amazon/aws-cli:latest s3api put-bucket-acl \
    --bucket cognitive-ats-uploads \
    --acl public-read \
    --endpoint-url=http://localstack:4566

# Configurar política de bucket para acesso público
echo "Configurando política de bucket..."
docker run --rm --network cognitive-ats_cognitive-ats-network \
    -e AWS_ACCESS_KEY_ID=test \
    -e AWS_SECRET_ACCESS_KEY=test \
    -e AWS_DEFAULT_REGION=us-east-1 \
    amazon/aws-cli:latest s3api put-bucket-policy \
    --bucket cognitive-ats-uploads \
    --policy '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::cognitive-ats-uploads/*"
            }
        ]
    }' \
    --endpoint-url=http://localstack:4566

# Criar fila SQS para aplicações
echo "Criando fila SQS..."
docker run --rm --network cognitive-ats_cognitive-ats-network \
    -e AWS_ACCESS_KEY_ID=test \
    -e AWS_SECRET_ACCESS_KEY=test \
    -e AWS_DEFAULT_REGION=us-east-1 \
    amazon/aws-cli:latest sqs create-queue \
    --queue-name applications-queue \
    --attributes '{"VisibilityTimeout": "30", "MessageRetentionPeriod": "1209600"}' \
    --endpoint-url=http://localstack:4566

# Listar recursos criados
echo "Recursos criados:"
echo "Buckets S3:"
docker run --rm --network cognitive-ats_cognitive-ats-network \
    -e AWS_ACCESS_KEY_ID=test \
    -e AWS_SECRET_ACCESS_KEY=test \
    -e AWS_DEFAULT_REGION=us-east-1 \
    amazon/aws-cli:latest s3 ls --endpoint-url=http://localstack:4566

echo "Filas SQS:"
docker run --rm --network cognitive-ats_cognitive-ats-network \
    -e AWS_ACCESS_KEY_ID=test \
    -e AWS_SECRET_ACCESS_KEY=test \
    -e AWS_DEFAULT_REGION=us-east-1 \
    amazon/aws-cli:latest sqs list-queues --endpoint-url=http://localstack:4566

echo "Configuração do LocalStack concluída!"
echo ""
echo "Acessos:"
echo "- LocalStack: http://localhost:4566" 