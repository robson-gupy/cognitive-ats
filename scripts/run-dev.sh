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

# Configurando ambiente AWS
docker compose -f docker-compose.yml up localstack -d
./scripts/setup-localstack.sh

#iniciando a aplicação
docker compose -f docker-compose.yml up

