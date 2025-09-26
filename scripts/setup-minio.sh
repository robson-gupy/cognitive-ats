#!/bin/bash

# Script para criar buckets no MinIO usando AWS CLI

echo "Configurando buckets no MinIO..."

# Aguardar o MinIO estar pronto
echo "Aguardando MinIO estar pronto..."
until curl -s http://localhost:9000/minio/health/live > /dev/null; do
    echo "MinIO ainda não está pronto, aguardando..."
    sleep 2
done

echo "MinIO está pronto!"
echo "Aguardando MinIO estar completamente inicializado..."

# Executar configuração usando AWS CLI
echo "Criando buckets $RESUMES_BUCKET_NAME usando AWS CLI..."
docker run --rm --network cognitive-ats_cognitive-ats-network \
    -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
    -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
    -e AWS_DEFAULT_REGION=us-east-1 \
    -e RESUMES_BUCKET_NAME=$RESUMES_BUCKET_NAME \
    -e MEDIA_BUCKET_NAME=$MEDIA_BUCKET_NAME \
    amazon/aws-cli:latest \
    s3api create-bucket --endpoint-url="http://minio:9000" --bucket $RESUMES_BUCKET_NAME

echo "Configuração dos buckets concluída!"
