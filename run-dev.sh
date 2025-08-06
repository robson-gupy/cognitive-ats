#!/bin/bash

set -a
source .env

docker compose up -d
./scripts/setup-localstack.sh
docker compose up

