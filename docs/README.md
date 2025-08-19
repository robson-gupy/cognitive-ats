# 📚 Documentação do Projeto Cognitive ATS

Bem-vindo à documentação centralizada do projeto Cognitive ATS. Aqui você encontrará todos os documentos organizados por categoria.

## 🚀 **Visão Geral**
- [SERVICES.md](./SERVICES.md) - Visão geral de todos os serviços
- [README-Docker.md](./README-Docker.md) - Guia de Docker e containers

## 🔧 **Configurações e Integrações**
- [CANDIDATES_SERVICE_INTEGRATION.md](./CANDIDATES_SERVICE_INTEGRATION.md) - Integração com serviço de candidatos
- [CADDY_README.md](./CADDY_README.md) - Configuração do Caddy
- [CADDY_USAGE.md](./CADDY_USAGE.md) - Como usar o Caddy

## 🌐 **Estrutura de URLs e Subdomínios**
- [NEW_URL_STRUCTURE.md](./NEW_URL_STRUCTURE.md) - Nova estrutura de URLs
- [LOGIN_SUBDOMAIN_FEATURE.md](./LOGIN_SUBDOMAIN_FEATURE.md) - Funcionalidade de login por subdomínio

## 🐛 **Correções e Testes**
- [REGISTER_FIX.md](./REGISTER_FIX.md) - Correção do sistema de registro
- [TEST_LOGIN_FIX.md](./TEST_LOGIN_FIX.md) - Teste da correção de login

## 📝 **Histórico e Mudanças**
- [CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md) - Resumo de mudanças

---

## 📁 **Estrutura do Projeto**

```
cognitive-ats/
├── 📁 docs/                    # Esta pasta - Documentação
├── 📁 config/                  # Configurações (Docker, Caddy, env)
├── 📁 scripts/                 # Scripts utilitários
├── 📁 services/                # Serviços da aplicação
│   ├── 📁 ai-service/
│   ├── 📁 candidates-service/
│   └── 📁 companies-service/
└── 📄 README.md                # README principal na raiz
```

## 🔍 **Como Navegar**

- **Configurações**: Veja a pasta `../config/` para arquivos de configuração
- **Scripts**: Veja a pasta `../scripts/` para utilitários
- **Serviços**: Navegue pelas pastas de serviços para código específico
- **Raiz**: Mantenha apenas o README principal e .gitignore

---

*Documentação organizada para facilitar o desenvolvimento e manutenção do projeto.*
