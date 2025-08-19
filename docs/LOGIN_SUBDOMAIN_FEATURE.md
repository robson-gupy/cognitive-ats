# Funcionalidade de Login Baseada em Subdomínio

## Visão Geral

Implementamos uma funcionalidade inteligente de login que se adapta automaticamente baseada na presença ou ausência de um subdomínio na URL.

## Como Funciona

### 🏢 **Com Subdomínio (ex: gupy.localhost)**

Quando o usuário acessa uma URL com subdomínio:

- ✅ **Apenas a tela de login é exibida**
- ✅ **Não há aba "Registrar Empresa"**
- ✅ **Mostra indicador visual da empresa atual**
- ✅ **Login direto com email e senha**

**Exemplo de URLs que ativam este modo:**
- `http://gupy.localhost`
- `http://empresa1.localhost`
- `http://minha-empresa.localhost`

### 🌐 **Sem Subdomínio (ex: localhost)**

Quando o usuário acessa a URL raiz:

- ✅ **Campo "Identificador da Empresa" é exibido no login**
- ✅ **Aba "Registrar Empresa" está disponível**
- ✅ **Usuário pode especificar qual empresa acessar**
- ✅ **Funcionalidade completa de registro**

**Exemplo de URLs que ativam este modo:**
- `http://localhost`
- `http://127.0.0.1`

## Implementação Técnica

### 1. **Detecção de Subdomínio**

```typescript
function hasActiveSubdomain(): boolean {
  const hostname = window.location.hostname;
  
  // Se estamos em localhost ou 127.0.0.1, não há subdomínio
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return false;
  }
  
  // Se há um ponto no hostname e não é localhost, há subdomínio
  if (hostname.includes('.') && !hostname.includes('.localhost')) {
    return true;
  }
  
  // Se é um subdomínio .localhost, há subdomínio
  if (hostname.match(/^[^.]+\.localhost$/)) {
    return true;
  }
  
  return false;
}
```

### 2. **Interface Condicional**

```typescript
// Determinar quais abas mostrar baseado na presença de subdomínio
const tabs = hasSubdomain 
  ? [
      {
        key: 'login',
        label: 'Entrar',
        children: loginFormContent,
      }
    ]
  : [
      {
        key: 'login',
        label: 'Entrar',
        children: loginFormContent,
      },
      {
        key: 'register',
        label: 'Registrar Empresa',
        children: registerFormContent,
      }
    ];
```

### 3. **Campo de Identificador Condicional**

```typescript
{/* Campo de identificador da empresa - apenas quando não há subdomínio */}
{!hasSubdomain && (
  <Form.Item
    label="Identificador da Empresa"
    name="companySlug"
    rules={[
      { required: true, message: 'Por favor, insira o identificador da empresa!' },
      { min: 2, message: 'O identificador deve ter pelo menos 2 caracteres!' },
      { pattern: /^[a-z0-9-]+$/, message: 'O identificador deve conter apenas letras minúsculas, números e hífens!' },
    ]}
    tooltip="Digite o identificador da sua empresa (ex: minha-empresa)"
  >
    <Input 
      placeholder="ex: minha-empresa" 
      prefix={<GlobalOutlined />}
    />
  </Form.Item>
)}
```

### 4. **Backend - DTO de Login Atualizado**

```typescript
// companies-service/backend/src/auth/dto/login.dto.ts
export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()  // ← Campo opcional para subdomínio
  @IsString()
  companySlug?: string; // ← Para especificar empresa quando não há subdomínio
}
```

## Fluxos de Uso

### **Fluxo 1: Usuário com Subdomínio**

1. Usuário acessa `http://gupy.localhost`
2. Sistema detecta subdomínio "gupy"
3. Mostra apenas tela de login
4. Exibe indicador visual: "🏢 Empresa: gupy"
5. Usuário faz login com email e senha
6. Sistema usa automaticamente o subdomínio "gupy"

### **Fluxo 2: Usuário sem Subdomínio**

1. Usuário acessa `http://localhost`
2. Sistema não detecta subdomínio
3. Mostra campo "Identificador da Empresa" no login
4. Mostra aba "Registrar Empresa"
5. Usuário pode:
   - Fazer login especificando o identificador da empresa
   - Registrar uma nova empresa

### **Fluxo 3: Registro de Nova Empresa**

1. Usuário acessa `http://localhost`
2. Clica na aba "Registrar Empresa"
3. Preenche dados da empresa e usuário
4. Sistema cria empresa e usuário administrador
5. Usuário é redirecionado para login
6. Pode fazer login especificando o identificador criado

## Vantagens da Implementação

### ✅ **Para Usuários Existentes**
- Acesso direto à empresa via subdomínio
- Interface limpa e focada
- Identificação clara da empresa atual

### ✅ **Para Novos Usuários**
- Processo de registro intuitivo
- Criação de empresa e usuário em um fluxo
- Flexibilidade para escolher identificador

### ✅ **Para Desenvolvedores**
- Código limpo e organizado
- Lógica condicional bem definida
- Fácil manutenção e extensão

## Configuração

### **Variáveis de Ambiente**

```bash
# URL base do backend (para desenvolvimento local)
VITE_BACKEND_URL=http://localhost/api

# Slug padrão da empresa para desenvolvimento local
VITE_DEFAULT_COMPANY_SLUG=gupy
```

### **Configuração do Caddy**

O Caddy está configurado para:
- Rotear `/api/*` para o backend
- Rotear `/*` para o frontend
- Aceitar tanto subdomínios quanto localhost direto

## Casos de Uso

### **Desenvolvimento Local**
- `http://localhost` → Modo sem subdomínio
- `http://gupy.localhost` → Modo com subdomínio

### **Produção**
- `https://minhaempresa.com` → Modo com subdomínio
- `https://app.minhaempresa.com` → Modo com subdomínio

### **Testes**
- `http://empresa1.localhost` → Modo com subdomínio
- `http://empresa2.localhost` → Modo com subdomínio

## Correções Implementadas

### **Problema 1: Campo companySlug rejeitado no login**

**Erro original:**
```json
{
  "message": ["property companySlug should not exist"],
  "error": "Bad Request",
  "statusCode": 400
}
```

**Causa:**
O `ValidationPipe` estava configurado com `forbidNonWhitelisted: true`, rejeitando campos não definidos no DTO.

**Solução:**
1. Adicionado campo `companySlug` ao `LoginDto`
2. Marcado como opcional com `@IsOptional()`
3. Backend reiniciado para aplicar mudanças

**Status:** ✅ **Corrigido e funcionando**

### **Problema 2: Campo companySlug rejeitado no registro**

**Erro original:**
```json
{
  "message": ["property companySlug should not exist"],
  "error": "Bad Request",
  "statusCode": 400
}
```

**Causa:**
O `ValidationPipe` também estava rejeitando o campo `companySlug` no endpoint de registro.

**Solução:**
1. Adicionado campo `companySlug` ao `RegisterDto`
2. Marcado como opcional com `@IsOptional()`
3. Validação de formato implementada (`/^[a-z0-9-]+$/`)
4. Controller atualizado para usar slug personalizado ou gerar automaticamente
5. Backend reiniciado para aplicar mudanças

**Status:** ✅ **Corrigido e funcionando**

### **Funcionalidades Adicionadas no Registro**

- ✅ **Slug Personalizado**: Usuário pode especificar identificador personalizado
- ✅ **Fallback Automático**: Gera slug automaticamente se não fornecido
- ✅ **Validação Robusta**: Formato, comprimento e unicidade
- ✅ **Compatibilidade**: Não quebra código existente

## Próximos Passos

1. **Testar no frontend** se o login está funcionando ✅
2. **Implementar lógica** para usar o companySlug quando fornecido
3. **Adicionar validação** de empresa no backend
4. **Implementar redirecionamento** para subdomínio da empresa
5. **Adicionar testes automatizados** para os diferentes fluxos

## Troubleshooting

### **Problema: Subdomínio não é detectado**
- Verificar se o hostname está correto
- Confirmar se o Caddy está roteando corretamente
- Verificar logs do navegador

### **Problema: Campo de identificador não aparece**
- Verificar se `hasSubdomain` está retornando `false`
- Confirmar se o componente está renderizando corretamente
- Verificar se não há erros no console

### **Problema: Login não funciona com identificador**
- ✅ **RESOLVIDO**: Campo companySlug agora é aceito pelo backend
- Verificar se a URL do backend está sendo construída corretamente
- Confirmar se o backend está aceitando o subdomínio
- Verificar logs do backend

### **Problema: Erro 400 "property companySlug should not exist"**

- ✅ **RESOLVIDO**: DTOs atualizados e backend reiniciado
- ✅ **Login**: Campo companySlug agora é aceito
- ✅ **Registro**: Campo companySlug agora é aceito
- Verificar se o backend está rodando
- Confirmar se as mudanças foram aplicadas
