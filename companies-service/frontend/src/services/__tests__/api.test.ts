import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {ApiService} from '../api'

// Mock do fetch global
global.fetch = vi.fn()

describe('ApiService', () => {
  let apiService: ApiService
  const mockFetch = vi.mocked(fetch)

  beforeEach(() => {
    apiService = new ApiService()
    vi.clearAllMocks()
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  describe('Autenticação', () => {
    it('deve fazer login com sucesso', async () => {
      const mockResponse = {
        access_token: 'token123',
        user: {
          id: 1,
          email: 'teste@email.com',
          name: 'Usuário Teste',
          roleCode: 'USER',
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers({'content-type': 'application/json'}),
      } as Response)

      const result = await apiService.login({
        email: 'teste@email.com',
        password: 'senha123',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'teste@email.com',
            password: 'senha123',
          }),
        })
      )

      expect(result).toEqual(mockResponse)
    })

    it('deve registrar usuário com sucesso', async () => {
      const mockResponse = {
        message: 'Usuário registrado com sucesso',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers({'content-type': 'application/json'}),
      } as Response)

      const result = await apiService.register({
        email: 'novo@email.com',
        password: 'senha123',
        companyName: 'Empresa Teste',
        companySlug: 'empresa-teste',
        corporateName: 'Empresa Teste LTDA',
        cnpj: '12345678901234',
        businessArea: 'Tecnologia',
        firstName: 'João',
        lastName: 'Silva',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/auth/register',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      )

      expect(result).toEqual(mockResponse)
    })

    it('deve obter perfil do usuário', async () => {
      const mockUser = {
        id: 1,
        email: 'teste@email.com',
        name: 'Usuário Teste',
        roleCode: 'USER',
      }

      // Configurar token no sessionStorage
      const authData = {
        token: 'token123',
        userData: null,
        timestamp: Date.now(),
      }
      sessionStorage.setItem('authData', JSON.stringify(authData))

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
        headers: new Headers({'content-type': 'application/json'}),
      } as Response)

      const result = await apiService.getProfile()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/auth/profile',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer token123',
          }),
        })
      )

      expect(result).toEqual(mockUser)
    })
  })

  describe('Gerenciamento de Token', () => {
    it('deve definir e obter token', () => {
      apiService.setToken('token123')
      expect(apiService.getToken()).toBe('token123')
    })

    it('deve remover token', () => {
      apiService.setToken('token123')
      apiService.removeToken()
      expect(apiService.getToken()).toBeNull()
    })

    it('deve verificar se está autenticado', () => {
      expect(apiService.isAuthenticated()).toBe(false)

      apiService.setToken('token123')
      expect(apiService.isAuthenticated()).toBe(true)
    })
  })

  describe('Empresas', () => {
    it('deve listar empresas', async () => {
      const mockCompanies = [
        {id: '1', name: 'Empresa 1'},
        {id: '2', name: 'Empresa 2'},
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCompanies,
        headers: new Headers({'content-type': 'application/json'}),
      } as Response)

      const result = await apiService.getCompanies()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/companies',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )

      expect(result).toEqual(mockCompanies)
    })

    it('deve criar empresa', async () => {
      const mockCompany = {
        id: '1',
        name: 'Nova Empresa',
        corporateName: 'Nova Empresa LTDA',
        cnpj: '12345678901234',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCompany,
        headers: new Headers({'content-type': 'application/json'}),
      } as Response)

      const result = await apiService.createCompany({
        name: 'Nova Empresa',
        corporateName: 'Nova Empresa LTDA',
        cnpj: '12345678901234',
        businessArea: 'Tecnologia',
        slug: 'nova-empresa',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/companies',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            name: 'Nova Empresa',
            corporateName: 'Nova Empresa LTDA',
            cnpj: '12345678901234',
            businessArea: 'Tecnologia',
            slug: 'nova-empresa',
          }),
        })
      )

      expect(result).toEqual(mockCompany)
    })
  })

  describe('Tratamento de Erros', () => {
    it('deve tratar erro de rede', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Erro de rede'))

      await expect(apiService.getCompanies()).rejects.toThrow('Erro de rede')
    })

    it('deve tratar erro HTTP', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({message: 'Dados inválidos'}),
      } as Response)

      await expect(apiService.getCompanies()).rejects.toThrow('Dados inválidos')
    })

    it('deve tratar erro de autenticação', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({message: 'Não autorizado'}),
      } as Response)

      await expect(apiService.getProfile()).rejects.toThrow('Não autorizado')
    })
  })
})
