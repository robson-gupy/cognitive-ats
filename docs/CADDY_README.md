# Caddy Proxy Reverso - Cognitive ATS

Este serviço utiliza o Caddy como proxy reverso para rotear requisições baseado em subdomínios, permitindo acesso organizado aos diferentes serviços da aplicação.

## 🚀 Como Funciona

O Caddy automaticamente roteia as requisições baseado no padrão do subdomínio:

- **`*.admin.localhost`** → Frontend das empresas (React)
- **`*.api.localhost`** → Backend das empresas (NestJS)
- **`ai.localhost`** → Serviço de IA (FastAPI)

## 📋 Configuração

### 1. Variáveis de Ambiente

Adicione ao seu arquivo `.env`:

```bash
# Caddy Proxy Reverse
CADDY_PORT_HTTP=80
CADDY_PORT_HTTPS=443
```

### 2. Iniciar os Serviços

```bash
# Iniciar todos os serviços incluindo o Caddy
docker-compose up -d

# Ou apenas o Caddy
docker-compose up -d caddy-proxy
```

## 🌐 URLs de Acesso

### Frontend das Empresas
```
http://gupy.admin.localhost          # Frontend da empresa Gupy
http://empresa1.admin.localhost      # Frontend da empresa1
http://empresa2.admin.localhost      # Frontend da empresa2
```

### Backend/API das Empresas
```
http://gupy.api.localhost            # API da empresa Gupy
http://empresa1.api.localhost        # API da empresa1
http://empresa2.api.localhost        # API da empresa2
```

### Serviço de IA
```
http://ai.localhost                   # Serviço de inteligência artificial
```

## 🔧 Configuração Avançada

### Adicionar Nova Empresa

Para adicionar uma nova empresa, simplesmente use o novo slug no subdomínio:

```bash
# Nova empresa com slug "startup"
http://startup.admin.localhost       # Frontend
http://startup.api.localhost         # Backend
```

### Personalizar CORS

O Caddy inclui configurações de CORS pré-configuradas para desenvolvimento. Para personalizar, edite o `Caddyfile`.

### Health Checks

O Caddy verifica a saúde dos serviços automaticamente:
- **Intervalo**: 30 segundos
- **Timeout**: 10 segundos
- **Max falhas**: 3

## 📁 Arquivos de Configuração

- **`Caddyfile`** - Configuração principal do Caddy
- **`Dockerfile.caddy`** - Imagem Docker do Caddy
- **`docker-compose.yml`** - Configuração do serviço

## 🐛 Troubleshooting

### Serviço não responde
```bash
# Verificar logs do Caddy
docker-compose logs caddy-proxy

# Verificar se os serviços estão rodando
docker-compose ps
```

### Erro de conexão
```bash
# Verificar se as portas estão expostas
docker-compose port caddy-proxy 80
docker-compose port caddy-proxy 443
```

### Reiniciar apenas o Caddy
```bash
docker-compose restart caddy-proxy
```

## 🔒 Segurança

- **CORS**: Configurado para desenvolvimento (permite todas as origens)
- **Headers**: Inclui headers de segurança padrão
- **Timeouts**: Configurados para evitar travamentos
- **Health Checks**: Monitoramento automático dos serviços

## 📊 Monitoramento

O Caddy inclui logs estruturados para monitoramento:
- Logs de acesso
- Logs de erro
- Logs de health check
- Métricas de performance

## 🚀 Produção

Para uso em produção, considere:

1. **CORS restritivo**: Configure origens específicas
2. **HTTPS**: Configure certificados SSL
3. **Rate limiting**: Adicione proteção contra abuso
4. **Logs estruturados**: Configure rotação de logs
5. **Monitoramento**: Integre com sistemas de observabilidade

## 📚 Recursos Adicionais

- [Documentação oficial do Caddy](https://caddyserver.com/docs/)
- [Caddyfile syntax](https://caddyserver.com/docs/caddyfile)
- [Docker Hub - Caddy](https://hub.docker.com/_/caddy)
