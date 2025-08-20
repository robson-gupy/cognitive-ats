# Candidates Service - Docker Setup

## Visão Geral

O Candidates Service é um serviço NestJS que utiliza React Server-Side Rendering (SSR) para renderizar páginas de vagas para candidatos.

## Configuração Docker

### Variáveis de Ambiente

Adicione ao seu arquivo `.env`:

```bash
# Candidates Service
CANDIDATES_SERVICE_PORT=3001
```

### Acesso via Domínio

O serviço está configurado para ser acessível via:
- `*.jobs.localhost` (ex: `gupy.jobs.localhost`, `empresa.jobs.localhost`)

### Executando com Docker Compose

```bash
# Construir e iniciar todos os serviços
docker-compose up -d

# Construir apenas o candidates-service
docker-compose build candidates-service

# Ver logs do candidates-service
docker-compose logs -f candidates-service

# Parar todos os serviços
docker-compose down
```

### Desenvolvimento

Para desenvolvimento, o serviço usa:
- **Porta**: 3001
- **Hot Reload**: Ativado via `npm run start:dev`
- **Volumes**: Código fonte mapeado para desenvolvimento

### Build de Produção

Para build de produção, use o Dockerfile principal:

```bash
docker build -t candidates-service:prod .
```

## Estrutura do Serviço

- **NestJS**: Backend API
- **React SSR**: Renderização no servidor
- **Tailwind CSS**: Estilização via CDN
- **Porta**: 3001 (configurável via variável de ambiente)

## Testando

1. Acesse `http://localhost:3001` diretamente
2. Acesse via proxy: `http://empresa.jobs.localhost` (após configurar hosts)
3. Verifique logs: `docker-compose logs candidates-service`

## Troubleshooting

### Porta já em uso
```bash
# Verificar processos na porta 3001
lsof -i :3001

# Parar processo específico
kill -9 <PID>
```

### Problemas de build
```bash
# Limpar cache do Docker
docker system prune -a

# Reconstruir imagem
docker-compose build --no-cache candidates-service
```
