# Candidates Service

Serviço de candidatos da plataforma Gupy com suporte a subdomínios para empresas específicas.

## 🚀 Funcionalidades

- **Home Dinâmica**: Exibe vagas específicas baseadas no subdomínio da empresa
- **Subdomínios Inteligentes**: Suporte a `{empresa}.jobs.{dominio}`
- **SSR (Server-Side Rendering)**: Renderização no servidor para melhor SEO
- **Responsivo**: Interface adaptável para todos os dispositivos
- **Integração com Companies Service**: Consome API pública para buscar vagas
- **🐳 Docker Compose**: Configuração completa para desenvolvimento e produção

## 🏗️ Arquitetura

- **Backend**: NestJS com TypeScript
- **Frontend**: React com Tailwind CSS
- **SSR**: Renderização no servidor com hidratação no cliente
- **API**: Consome Companies Service via HTTP
- **Containerização**: Docker com hot-reload para desenvolvimento

## 📋 Pré-requisitos

- Node.js 18+ (para desenvolvimento local)
- Docker e Docker Compose (recomendado)
- Companies Service rodando (para buscar vagas)

## 🛠️ Instalação

### 🐳 Com Docker Compose (Recomendado)

1. **Clone o repositório**
```bash
cd /Users/robson/src/gupy/cognitive-ats
```

2. **Configure as variáveis de ambiente**
```bash
cp env.example .env
# Edite o arquivo .env se necessário
```

3. **Inicie todos os serviços**
```bash
docker-compose up -d --build
```

4. **Verifique o status**
```bash
docker-compose ps
```

### 💻 Desenvolvimento Local

1. **Clone o repositório**
```bash
cd candidates-service
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Inicie o serviço**
```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## ⚙️ Configuração

### Variáveis de Ambiente

```bash
# URL da API do Companies Service
COMPANIES_API_URL=http://localhost:3001

# Porta do servidor
PORT=3002

# Ambiente
NODE_ENV=development
```

### Subdomínios

O serviço suporta subdomínios no formato:
```
{slug}.jobs.{domain}
```

**Exemplos:**
- `gupy.jobs.localhost` → Vagas da empresa "gupy"
- `empresa.jobs.localhost` → Vagas da empresa "empresa"
- `startup.jobs.localhost` → Vagas da empresa "startup"

## 🧪 Testando

### 🐳 Com Docker Compose

```bash
# No diretório raiz
cd /Users/robson/src/gupy/cognitive-ats

# Iniciar todos os serviços
docker-compose up -d --build

# Testar automaticamente
cd candidates-service
./test-docker.sh

# Ver logs
docker-compose logs -f candidates-service
```

### 💻 Localmente

```bash
cd candidates-service

# Testar funcionalidade
./test-subdomain.sh

# Iniciar serviço
npm run start:dev
```

### 🌐 Acessar os Subdomínios

Para testar localmente, adicione no `/etc/hosts`:
```bash
127.0.0.1 gupy.jobs.localhost
127.0.0.1 empresa.jobs.localhost
```

Acesse:
- `http://gupy.jobs.localhost` → Vagas da Gupy
- `http://empresa.jobs.localhost` → Vagas da Empresa
- `http://localhost:3002` → Página genérica

## 📚 Scripts Disponíveis

```bash
# Desenvolvimento
npm run start:dev      # Inicia com hot-reload
npm run start:debug    # Inicia em modo debug

# Build
npm run build          # Compila o projeto
npm run start:prod     # Inicia versão de produção

# Qualidade de código
npm run lint           # Executa ESLint
npm run format         # Formata com Prettier

# Testes
npm run test           # Executa testes unitários
npm run test:watch     # Executa testes em modo watch
npm run test:e2e       # Executa testes end-to-end

# 🐳 Docker
./test-docker.sh       # Testa com Docker Compose
./test-subdomain.sh    # Testa funcionalidade local
```

## 🏗️ Estrutura do Projeto

```
src/
├── app.controller.ts          # Controller principal
├── app.service.ts             # Serviço de negócio
├── app.module.ts              # Módulo principal
├── main.ts                    # Ponto de entrada
└── react/                     # Componentes React
    ├── app.component.tsx      # Componente principal
    └── react-ssr.service.ts   # Serviço de SSR
```

## 🔌 Integração com Companies Service

O serviço consome a API pública:
```
GET /public/{slug}/jobs
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Desenvolvedor Full Stack",
      "description": "Descrição da vaga...",
      "salary": "R$ 5.000 - R$ 8.000",
      "location": "São Paulo, SP",
      "type": "CLT"
    }
  ],
  "total": 1,
  "companyId": "uuid"
}
```

## 🐳 Docker

### Desenvolvimento
```bash
docker build -f Dockerfile.dev -t candidates-service:dev .
docker run -p 3002:3002 candidates-service:dev
```

### Produção
```bash
docker build -t candidates-service:prod .
docker run -p 3002:3002 candidates-service:prod
```

### Docker Compose
```bash
# Iniciar todos os serviços
docker-compose up -d --build

# Ver logs
docker-compose logs -f candidates-service

# Parar
docker-compose down
```

## 📖 Documentação Adicional

- [Integração com Subdomínios](./SUBDOMAIN_INTEGRATION.md)
- [README Docker](./README-DOCKER.md)
- [React Home](./REACT_HOME.md)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e proprietário da Gupy.

## 🆘 Suporte

Para dúvidas ou problemas:
- Abra uma issue no repositório
- Entre em contato com a equipe de desenvolvimento
- Use `docker-compose logs candidates-service` para debug
