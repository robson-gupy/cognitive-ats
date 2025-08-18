# Integração do Candidates Service ao Docker Compose

## Resumo das Mudanças

Este documento descreve as alterações feitas para integrar o **Candidates Service** ao sistema Docker Compose existente.

## 🚀 O que foi implementado

### 1. Dockerfiles para o Candidates Service
- **`Dockerfile`**: Para produção com build otimizado
- **`Dockerfile.dev`**: Para desenvolvimento com hot reload
- **`.dockerignore`**: Para otimizar o build

### 2. Integração ao Docker Compose
- Serviço `candidates-service` adicionado ao `docker-compose.yml`
- Porta configurável via variável de ambiente `CANDIDATES_SERVICE_PORT`
- Dependências e volumes configurados para desenvolvimento

### 3. Configuração do Proxy Caddy
- Roteamento via domínio `*.jobs.localhost`
- Exemplo: `gupy.jobs.localhost`, `empresa1.jobs.localhost`
- Proxy reverso para o container `candidates-service:3001`

### 4. Variáveis de Ambiente
- `CANDIDATES_SERVICE_PORT=3001` adicionado ao `env.example`
- Configuração de porta para o serviço

### 5. Documentação e Scripts
- `README-DOCKER.md` específico para o candidates-service
- Script de teste `test-candidates-service.sh`
- Atualização do `hosts-example.txt` com exemplos

## 🔧 Como usar

### 1. Configurar variáveis de ambiente
```bash
# Adicione ao seu arquivo .env
CANDIDATES_SERVICE_PORT=3001
```

### 2. Iniciar o serviço
```bash
# Iniciar todos os serviços
docker-compose up -d

# Ou apenas o candidates-service
docker-compose up -d candidates-service
```

### 3. Acessar o serviço
- **Direto**: `http://localhost:3001`
- **Via proxy**: `http://gupy.jobs.localhost` (após configurar hosts)

### 4. Testar
```bash
# Executar script de teste
./scripts/test-candidates-service.sh
```

## 🌐 Estrutura de Domínios

### Domínios existentes:
- `*.localhost` → Companies Service (frontend + backend)
- `ai.localhost` → AI Service

### Novo domínio:
- `*.jobs.localhost` → Candidates Service (páginas de vagas)

### Exemplos:
- `gupy.localhost` → Sistema da empresa Gupy
- `gupy.jobs.localhost` → Página de vagas da Gupy
- `empresa1.localhost` → Sistema da empresa1
- `empresa1.jobs.localhost` → Página de vagas da empresa1

## 🏗️ Arquitetura do Candidates Service

### Tecnologias:
- **Backend**: NestJS (Node.js)
- **Frontend**: React com Server-Side Rendering (SSR)
- **Estilização**: Tailwind CSS via CDN
- **Porta**: 3001 (configurável)

### Características:
- Renderização no servidor para melhor SEO
- Hot reload em desenvolvimento
- Volumes mapeados para desenvolvimento
- Integração com proxy reverso Caddy

## 📁 Arquivos modificados/criados

### Criados:
- `candidates-service/Dockerfile`
- `candidates-service/Dockerfile.dev`
- `candidates-service/.dockerignore`
- `candidates-service/README-DOCKER.md`
- `scripts/test-candidates-service.sh`
- `CANDIDATES_SERVICE_INTEGRATION.md`

### Modificados:
- `docker-compose.yml` → Adicionado serviço candidates-service
- `Caddyfile` → Adicionado roteamento *.jobs.localhost
- `env.example` → Adicionada variável CANDIDATES_SERVICE_PORT
- `hosts-example.txt` → Adicionados exemplos do candidates-service

## 🔍 Troubleshooting

### Porta já em uso:
```bash
lsof -i :3001
kill -9 <PID>
```

### Problemas de build:
```bash
docker-compose build --no-cache candidates-service
```

### Ver logs:
```bash
docker-compose logs -f candidates-service
```

## ✅ Status da Implementação

- [x] Dockerfiles criados
- [x] Integração ao docker-compose
- [x] Configuração do proxy Caddy
- [x] Variáveis de ambiente configuradas
- [x] Documentação criada
- [x] Scripts de teste criados
- [x] Arquivos de exemplo atualizados

## 🎯 Próximos passos sugeridos

1. **Testar a integração** executando o script de teste
2. **Configurar hosts locais** para testar domínios personalizados
3. **Implementar lógica de empresa** no candidates-service
4. **Adicionar autenticação** se necessário
5. **Configurar banco de dados** para vagas e candidatos
