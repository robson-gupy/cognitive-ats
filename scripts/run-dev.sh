#!/bin/bash

set -a
source .env

# Rodando Migração
docker compose -f docker-compose.yml up postgres -d
cd companies-service/backend
export DB_HOST=localhost
npm run migration:run
cd ../..
export DB_HOST=postgres

# Configurando ambiente MinIO
docker compose -f docker-compose.yml up minio -d
./scripts/setup-minio.sh

#iniciando a aplicação
docker compose -f docker-compose.yml up

