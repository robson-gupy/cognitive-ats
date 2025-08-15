# Nova Estrutura de URLs - Cognitive ATS

## Visão Geral

A estrutura de URLs foi reconfigurada para usar o mesmo domínio tanto para frontend quanto para backend, com o backend sendo acessado através do path `/api/`.

## Antes vs. Depois

### ❌ Estrutura Anterior (Subdomínios separados)
```
Frontend: gupy.admin.localhost
Backend:  gupy.api.localhost
```

### ✅ Nova Estrutura (Mesmo domínio com path)
```
Frontend: gupy.localhost
Backend:  gupy.localhost/api
```

## Vantagens da Nova Estrutura

1. **Simplicidade**: Apenas um domínio para gerenciar
2. **Consistência**: Padrão mais comum em aplicações web
3. **Manutenção**: Menos configurações de DNS/subdomínios
4. **Flexibilidade**: Fácil de adaptar para diferentes ambientes

## Como Funciona

### Roteamento no Caddy

O Caddy agora usa roteamento baseado em path:

```caddy
# Rota para API (/api/*)
@api {
    path /api/*
}
handle @api {
    uri strip_prefix /api
    reverse_proxy companies-backend:3000
}

# Rota para Frontend (/*)
@frontend {
    not path /api/*
}
handle @frontend {
    reverse_proxy companies-frontend:5173
}
```

### Exemplos de URLs

| Empresa | Frontend | Backend |
|---------|----------|---------|
| Gupy | `http://gupy.localhost` | `http://gupy.localhost/api` |
| Empresa1 | `http://empresa1.localhost` | `http://empresa1.localhost/api` |
| TestCorp | `http://testcorp.localhost` | `http://testcorp.localhost/api` |

## Configuração do Frontend

O frontend automaticamente detecta o domínio e constrói a URL do backend:

```typescript
// Exemplo: gupy.localhost -> http://gupy.localhost/api
function buildBackendUrl(companySlug: string): string {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // Novo padrão: mesmo domínio com /api/ para o backend
  if (hostname.includes('.localhost')) {
    return `${protocol}//${hostname}/api`;
  }
  
  return 'http://localhost:3000'; // Fallback para desenvolvimento local
}
```

## Migração

### Para Desenvolvedores

1. **Atualizar URLs de acesso**:
   - Antes: `gupy.admin.localhost` e `gupy.api.localhost`
   - Agora: `gupy.localhost` e `gupy.localhost/api`

2. **Configuração de ambiente**:
   - Não é necessário alterar variáveis de ambiente
   - O frontend detecta automaticamente o novo padrão

### Para DevOps/Infraestrutura

1. **DNS**: Configurar apenas um domínio por empresa
2. **SSL**: Certificados para um domínio principal
3. **Load Balancer**: Roteamento baseado em path `/api/*`

## Exemplos de Uso

### Desenvolvimento Local

```bash
# Acessar frontend
http://gupy.localhost

# Acessar API
http://gupy.localhost/api/jobs
http://gupy.localhost/api/companies
http://gupy.localhost/api/users
```

### Produção

```bash
# Exemplo com domínio real
Frontend: https://gupy.empresa.com
Backend:  https://gupy.empresa.com/api

# Outras empresas
Frontend: https://empresa1.empresa.com
Backend:  https://empresa1.empresa.com/api
```

## Troubleshooting

### Problema: API não responde
- Verificar se o Caddy está roteando corretamente para `/api/*`
- Confirmar se o backend está rodando na porta 3000

### Problema: Frontend não carrega
- Verificar se o Caddy está roteando corretamente para `/*`
- Confirmar se o frontend está rodando na porta 5173

### Problema: CORS
- O Caddy está configurado com headers CORS apropriados
- Verificar se as configurações estão corretas no Caddyfile

## Arquivos Modificados

1. **Caddyfile**: Nova configuração de roteamento baseado em path
2. **config.ts**: Atualização da lógica de construção de URLs
3. **env.example**: Documentação atualizada
4. **hosts-example.txt**: Exemplos de URLs atualizados
5. **README-Docker.md**: Documentação atualizada

## Próximos Passos

1. Testar a nova configuração localmente
2. Atualizar documentação de APIs se necessário
3. Configurar ambiente de produção com o novo padrão
4. Treinar equipe sobre a nova estrutura de URLs
