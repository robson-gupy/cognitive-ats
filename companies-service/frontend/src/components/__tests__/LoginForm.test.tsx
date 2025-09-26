import {beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import {LoginForm} from '../LoginForm'

// Mock do contexto de autenticação
vi.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => ({
    login: vi.fn(),
    logout: vi.fn(),
    currentUser: null,
    isAuthenticated: false,
    isLoading: false,
  }),
}))

// Mock do serviço de API
vi.mock('../../services/api', () => ({
  apiService: {
    register: vi.fn(),
    login: vi.fn(),
  },
}))

describe('LoginForm', () => {
  const mockOnLoginSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar o formulário de login', () => {
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess}/>)

    // Verificar se o título está sendo renderizado
    expect(screen.getByText('Cognitive ATS')).toBeInTheDocument()

    // Verificar se as abas estão sendo renderizadas
    expect(screen.getAllByText('Entrar')).toHaveLength(2) // Aba e botão
    expect(screen.getByText('Registrar Empresa')).toBeInTheDocument()
  })

  it('deve mostrar campos obrigatórios', () => {
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess}/>)

    // Verificar se os labels estão sendo renderizados
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Senha')).toBeInTheDocument()
  })

  it('deve ter campos de input para email e senha', () => {
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess}/>)

    // Verificar se os campos de input estão presentes
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Sua senha')).toBeInTheDocument()
  })

  it('deve ter botão de submit', () => {
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess}/>)

    // Verificar se o botão de submit está presente
    const submitButtons = screen.getAllByRole('button', {name: /entrar/i})
    expect(submitButtons).toHaveLength(2) // Aba e botão de submit
  })

  it('deve permitir alternar entre abas de login e registro', () => {
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess}/>)

    // Verificar se ambas as abas estão presentes
    expect(screen.getAllByText('Entrar')).toHaveLength(2) // Aba e botão
    expect(screen.getByText('Registrar Empresa')).toBeInTheDocument()
  })
})
