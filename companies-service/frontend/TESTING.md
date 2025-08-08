# Testes no Frontend

Este documento explica como configurar e executar testes no frontend da aplicação.

## Configuração

Os testes estão configurados usando:
- **Vitest**: Framework de testes rápido
- **React Testing Library**: Para testar componentes React
- **jsdom**: Ambiente DOM para testes
- **@testing-library/jest-dom**: Matchers adicionais para assertions

## Scripts Disponíveis

```bash
# Executar testes em modo watch
npm run test

# Executar testes com interface gráfica
npm run test:ui

# Executar testes com cobertura
npm run test:coverage

# Executar testes uma vez
npm run test:run
```

## Estrutura de Testes

```
src/
├── components/
│   └── __tests__/
│       └── LoginForm.test.tsx
├── hooks/
│   └── __tests__/
│       └── useAuth.test.ts
├── services/
│   └── __tests__/
│       └── api.test.ts
└── test/
    └── setup.ts
```

## Tipos de Testes

### 1. Testes de Componentes

Teste componentes React usando React Testing Library:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { MyComponent } from '../MyComponent'

describe('MyComponent', () => {
  it('deve renderizar corretamente', () => {
    render(<MyComponent />)
    expect(screen.getByText('Texto esperado')).toBeInTheDocument()
  })

  it('deve responder a interações do usuário', () => {
    render(<MyComponent />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(screen.getByText('Resultado')).toBeInTheDocument()
  })
})
```

### 2. Testes de Hooks

Teste hooks customizados usando `renderHook`:

```typescript
import { renderHook, act } from '@testing-library/react'
import { useMyHook } from '../useMyHook'

describe('useMyHook', () => {
  it('deve retornar estado inicial', () => {
    const { result } = renderHook(() => useMyHook())
    expect(result.current.value).toBe(0)
  })

  it('deve atualizar estado', () => {
    const { result } = renderHook(() => useMyHook())
    
    act(() => {
      result.current.increment()
    })
    
    expect(result.current.value).toBe(1)
  })
})
```

### 3. Testes de Serviços

Teste serviços de API mockando o fetch:

```typescript
import { ApiService } from '../api'

// Mock do fetch global
global.fetch = vi.fn()

describe('ApiService', () => {
  it('deve fazer requisição correta', async () => {
    const mockResponse = { data: 'test' }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const result = await apiService.getData()
    expect(result).toEqual(mockResponse)
  })
})
```

## Mocks Configurados

### Ant Design
Componentes do Ant Design são mockados para evitar problemas de renderização:

```typescript
// Button, Input, Form, Table, Modal, etc.
vi.mock('antd', () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
  Input: ({ ...props }) => <input {...props} />,
  // ...
}))
```

### React Router
Hooks e componentes do React Router são mockados:

```typescript
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  // ...
}))
```

### Day.js
Biblioteca de datas é mockada:

```typescript
vi.mock('dayjs', () => ({
  default: (date) => ({
    format: (format) => date || '2024-01-01',
    toDate: () => new Date(date || '2024-01-01'),
  }),
}))
```

## Boas Práticas

### 1. Nomenclatura
- Use nomes descritivos para testes
- Agrupe testes relacionados em `describe`
- Use `it` para casos de teste individuais

### 2. Organização
- Coloque testes em `__tests__` dentro de cada diretório
- Use `.test.ts` ou `.test.tsx` como extensão
- Mantenha testes próximos ao código que testam

### 3. Assertions
- Use assertions específicas e descritivas
- Teste comportamento, não implementação
- Use `toBeInTheDocument()` para verificar presença de elementos

### 4. Mocks
- Mock apenas o necessário
- Use `vi.clearAllMocks()` no `beforeEach`
- Documente mocks complexos

## Exemplos de Testes

### Teste de Formulário
```typescript
it('deve validar campos obrigatórios', async () => {
  render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />)
  
  const submitButton = screen.getByRole('button', { name: 'Entrar' })
  fireEvent.click(submitButton)
  
  await waitFor(() => {
    expect(screen.getByText('Por favor, insira seu email!')).toBeInTheDocument()
  })
})
```

### Teste de Hook com API
```typescript
it('deve fazer login com sucesso', async () => {
  mockApiService.login.mockResolvedValue(mockResponse)
  
  const { result } = renderHook(() => useAuth())
  
  await act(async () => {
    await result.current.login({ email: 'test@email.com', password: '123' })
  })
  
  expect(result.current.isAuthenticated).toBe(true)
})
```

## Cobertura de Testes

Para verificar a cobertura:

```bash
npm run test:coverage
```

Isso gerará um relatório mostrando:
- Linhas cobertas
- Branches cobertos
- Funções cobertas
- Statements cobertos

## Troubleshooting

### Problemas Comuns

1. **Erro de módulo não encontrado**
   - Verifique se o caminho do import está correto
   - Certifique-se de que o arquivo existe

2. **Erro de renderização**
   - Verifique se todos os mocks necessários estão configurados
   - Use `console.log` para debugar o que está sendo renderizado

3. **Teste falhando inesperadamente**
   - Use `screen.debug()` para ver o que está sendo renderizado
   - Verifique se os mocks estão retornando dados corretos

### Debug de Testes

```typescript
// Para ver o que está sendo renderizado
screen.debug()

// Para ver um elemento específico
screen.debug(screen.getByRole('button'))

// Para aguardar elementos
await waitFor(() => {
  expect(screen.getByText('Texto')).toBeInTheDocument()
})
```
