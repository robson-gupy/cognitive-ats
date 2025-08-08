import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from '../useAuth'

// Mock do serviço de API
vi.mock('../../services/api', () => ({
  apiService: {
    isAuthenticated: vi.fn(),
    getProfile: vi.fn(),
    removeToken: vi.fn(),
    login: vi.fn(),
    setToken: vi.fn(),
  },
}))

describe('useAuth', () => {
  let mockApiService: any

  beforeEach(async () => {
    vi.clearAllMocks()
    const apiModule = await import('../../services/api')
    mockApiService = apiModule.apiService
  })

  it('deve inicializar com estado padrão', async () => {
    mockApiService.isAuthenticated.mockReturnValue(false)
    
    const { result } = renderHook(() => useAuth())
    
    // Aguardar a inicialização
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    expect(result.current.currentUser).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('deve verificar status de autenticação ao inicializar', async () => {
    mockApiService.isAuthenticated.mockReturnValue(true)
    mockApiService.getProfile.mockResolvedValue({
      id: 1,
      email: 'teste@email.com',
      name: 'Usuário Teste',
      roleCode: 'USER',
    })
    
    const { result } = renderHook(() => useAuth())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.currentUser).toEqual({
      id: 1,
      email: 'teste@email.com',
      name: 'Usuário Teste',
      roleCode: 'USER',
    })
  })

  it('deve fazer logout quando getProfile falha', async () => {
    mockApiService.isAuthenticated.mockReturnValue(true)
    mockApiService.getProfile.mockRejectedValue(new Error('Erro de autenticação'))
    
    const { result } = renderHook(() => useAuth())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    expect(mockApiService.removeToken).toHaveBeenCalled()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.currentUser).toBeNull()
  })

  it('deve fazer login com sucesso', async () => {
    const mockUser = {
      id: 1,
      email: 'teste@email.com',
      name: 'Usuário Teste',
      roleCode: 'USER',
    }
    
    const mockResponse = {
      access_token: 'token123',
      user: mockUser,
    }
    
    mockApiService.login.mockResolvedValue(mockResponse)
    
    const { result } = renderHook(() => useAuth())
    
    await act(async () => {
      await result.current.login({ email: 'teste@email.com', password: 'senha123' })
    })
    
    expect(mockApiService.setToken).toHaveBeenCalledWith('token123')
    expect(result.current.currentUser).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('deve fazer logout corretamente', () => {
    const { result } = renderHook(() => useAuth())
    
    act(() => {
      result.current.logout()
    })
    
    expect(mockApiService.removeToken).toHaveBeenCalled()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.currentUser).toBeNull()
  })

  it('deve verificar se usuário é admin', async () => {
    mockApiService.isAuthenticated.mockReturnValue(true)
    mockApiService.getProfile.mockResolvedValue({
      id: 1,
      email: 'admin@email.com',
      name: 'Admin',
      roleCode: 'ADMIN',
    })
    
    const { result } = renderHook(() => useAuth())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    expect(result.current.isAdmin()).toBe(true)
  })

  it('deve verificar se usuário tem role específica', async () => {
    mockApiService.isAuthenticated.mockReturnValue(true)
    mockApiService.getProfile.mockResolvedValue({
      id: 1,
      email: 'user@email.com',
      name: 'Usuário',
      roleCode: 'USER',
    })
    
    const { result } = renderHook(() => useAuth())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    expect(result.current.hasRole('USER')).toBe(true)
    expect(result.current.hasRole('ADMIN')).toBe(false)
  })
})
