# Integração com Subdomínios - Candidates Service

## Como Funciona

O Candidates Service agora suporta subdomínios para exibir vagas específicas de cada empresa. O sistema extrai automaticamente o slug da empresa do subdomínio da URL.

## Formato dos Subdomínios

### Padrão
```
{slug}.jobs.{domain}
```

### Exemplos
- `gupy.jobs.localhost` → Busca vagas da empresa com slug "gupy"
- `empresa.jobs.localhost` → Busca vagas da empresa com slug "empresa"
- `startup.jobs.localhost` → Busca vagas da empresa com slug "startup"

## Configuração

### 1. Variáveis de Ambiente
Crie um arquivo `.env` baseado no `env.example`:

```bash
# URL da API do Companies Service
COMPANIES_API_URL=http://localhost:3001

# Porta do servidor
PORT=3002

# Ambiente
NODE_ENV=development
```

### 2. Configuração do DNS Local
Para testar localmente, adicione entradas no seu arquivo `/etc/hosts`:

```bash
# Exemplo para macOS/Linux
127.0.0.1 gupy.jobs.localhost
127.0.0.1 empresa.jobs.localhost
```

### 3. Configuração do Caddy (Recomendado)
Use o Caddyfile para rotear automaticamente os subdomínios:

```caddyfile
gupy.jobs.localhost {
    reverse_proxy localhost:3002
}

*.jobs.localhost {
    reverse_proxy localhost:3002
}
```

## 🐳 Docker Compose

### Configuração Automática
O projeto já está configurado para funcionar com Docker Compose. O `docker-compose.yml` inclui:

- **Porta**: 3002 (configurável via `CANDIDATES_SERVICE_PORT`)
- **Rede**: `cognitive-ats-network`
- **Dependências**: `companies-backend`
- **Volumes**: Hot-reload para desenvolvimento

### Iniciar com Docker Compose

```bash
# No diretório raiz do projeto
cd /Users/robson/src/gupy/cognitive-ats

# Iniciar todos os serviços
docker-compose up -d --build

# Ver logs do candidates-service
docker-compose logs -f candidates-service

# Parar todos os serviços
docker-compose down
```

### Teste Automatizado
Use o script de teste para verificar se tudo está funcionando:

```bash
cd candidates-service
./test-docker.sh
```

### Configuração de Rede Docker
O serviço usa a rede interna `cognitive-ats-network` e se comunica com o `companies-backend` via:

```
COMPANIES_API_URL=http://companies-backend:3000
```

## Funcionalidades

### Home Dinâmica
- **Com slug**: Exibe vagas específicas da empresa
- **Sem slug**: Exibe página genérica da plataforma

### Seção de Vagas
- Lista todas as vagas disponíveis da empresa
- Mostra título, localização, tipo, descrição e salário
- Botão de candidatura para cada vaga

### Personalização
- Logo e nome da empresa no header
- Título e descrição personalizados
- Footer com informações da empresa

## API Utilizada

O serviço consome a API pública do Companies Service:

```
GET /public/{slug}/jobs
```

### Resposta Esperada
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Desenvolvedor Full Stack",
      "description": "Descrição da vaga...",
      "requirements": "Requisitos...",
      "salary": "R$ 5.000 - R$ 8.000",
      "location": "São Paulo, SP",
      "type": "CLT",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "companyId": "uuid",
  "message": "Vagas encontradas com sucesso"
}
```

## Testando

### 1. Com Docker Compose (Recomendado)
```bash
cd /Users/robson/src/gupy/cognitive-ats
docker-compose up -d --build
```

### 2. Localmente
```bash
cd candidates-service
npm run start:dev
```

### 3. Acessar os Subdomínios
- `http://gupy.jobs.localhost` → Vagas da Gupy
- `http://empresa.jobs.localhost` → Vagas da Empresa
- `http://localhost:3002` → Página genérica

## Tratamento de Erros

- Se o slug não for encontrado, a página é exibida sem vagas
- Se a API estiver indisponível, a página continua funcionando
- Logs de erro são exibidos no console do servidor
- No Docker, use `docker-compose logs candidates-service` para ver logs

## Próximos Passos

- [ ] Implementar cache das vagas
- [ ] Adicionar paginação para muitas vagas
- [ ] Implementar filtros por tipo, localização, etc.
- [ ] Adicionar sistema de candidatura
- [ ] Implementar busca e ordenação
