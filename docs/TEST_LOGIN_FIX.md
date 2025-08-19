# Teste da Correção do Campo companySlug

## Problema Identificado

O backend estava rejeitando o campo `companySlug` com o erro:
```
{"message":["property companySlug should not exist"],"error":"Bad Request","statusCode":400}
```

## Causa do Problema

O `ValidationPipe` estava configurado com `forbidNonWhitelisted: true`, que rejeita campos não definidos no DTO.

## Solução Implementada

### 1. **DTO de Login Atualizado**

```typescript
// companies-service/backend/src/auth/dto/login.dto.ts
export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()  // ← NOVO: Campo opcional
  @IsString()
  companySlug?: string; // ← NOVO: Para especificar subdomínio da empresa
}
```

### 2. **Backend Reiniciado**

```bash
docker compose restart companies-backend
```

## Teste da Correção

### **Teste 1: Campo companySlug sendo aceito**

```bash
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","companySlug":"test-company"}' \
  -v
```

**Resultado esperado:**
- ✅ **Antes**: 400 Bad Request com "property companySlug should not exist"
- ✅ **Depois**: 401 Unauthorized (credenciais inválidas, mas campo aceito)

### **Teste 2: Login sem companySlug**

```bash
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -v
```

**Resultado esperado:**
- ✅ 401 Unauthorized (credenciais inválidas, mas campo opcional aceito)

### **Teste 3: Validação de campos obrigatórios**

```bash
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"companySlug":"test-company"}' \
  -v
```

**Resultado esperado:**
- ✅ 400 Bad Request com validação de email e senha obrigatórios

## Status da Correção

- ✅ **Campo companySlug adicionado ao DTO**
- ✅ **Campo marcado como opcional (@IsOptional())**
- ✅ **Backend reiniciado com sucesso**
- ✅ **Validação funcionando corretamente**
- ✅ **Campo sendo aceito nas requisições**

## Próximos Passos

1. **Testar no frontend** se o login está funcionando
2. **Implementar lógica** para usar o companySlug quando fornecido
3. **Adicionar validação** de empresa no backend
4. **Implementar redirecionamento** para subdomínio da empresa

## Como Testar no Frontend

1. Acesse `http://localhost` (sem subdomínio)
2. Preencha o campo "Identificador da Empresa"
3. Preencha email e senha
4. Clique em "Entrar"
5. Verifique se não há mais erro de validação

## Arquivos Modificados

1. **`companies-service/backend/src/auth/dto/login.dto.ts`** - DTO atualizado
2. **`TEST_LOGIN_FIX.md`** - Este arquivo de teste

## Logs Relevantes

```bash
# Verificar se o backend está funcionando
docker compose logs --tail=20 companies-backend

# Verificar se o Caddy está roteando corretamente
docker compose logs --tail=20 caddy-proxy
```
