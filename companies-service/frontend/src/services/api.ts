import type { User, CreateUserData, UpdateUserData } from '../types/User';
import type { LoginData, RegisterData, AuthResponse, RegisterResponse } from '../types/Auth';
import type { Company, CreateCompanyData, UpdateCompanyData } from '../types/Company';
import type { Department, CreateDepartmentRequest, UpdateDepartmentRequest } from '../types/Department';
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '../types/Role';
import type { Application, CreateApplicationData, UpdateApplicationData, UpdateApplicationScoreData } from '../types/Application';

const API_BASE_URL = 'http://localhost:3000';

export class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = this.getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Tratar diferentes formatos de erro
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      if (errorData.message) {
        if (Array.isArray(errorData.message)) {
          // Se é um array de mensagens (validação), juntar todas
          errorMessage = errorData.message.join(', ');
        } else {
          // Se é uma string única
          errorMessage = errorData.message;
        }
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
      
      throw new Error(errorMessage);
    }

    // Verificar se a resposta tem conteúdo antes de tentar fazer JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      // Para respostas vazias ou não-JSON, retornar undefined
      return undefined as T;
    }
  }

  // Autenticação
  async login(loginData: LoginData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
  }

  async register(registerData: RegisterData): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerData),
    });
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/auth/profile');
  }

  // Empresas
  async getCompanies(): Promise<Company[]> {
    return this.request<Company[]>('/companies');
  }

  async getCompany(id: string): Promise<Company> {
    return this.request<Company>(`/companies/${id}`);
  }

  async createCompany(companyData: CreateCompanyData): Promise<Company> {
    return this.request<Company>('/companies', {
      method: 'POST',
      body: JSON.stringify(companyData),
    });
  }

  async updateCompany(id: string, companyData: UpdateCompanyData): Promise<Company> {
    return this.request<Company>(`/companies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(companyData),
    });
  }

  async deleteCompany(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/companies/${id}`, {
      method: 'DELETE',
    });
  }

  // Buscar todos os usuários
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  // Buscar usuário por ID
  async getUser(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  // Criar usuário
  async createUser(userData: CreateUserData): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Atualizar usuário
  async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  // Deletar usuário
  async deleteUser(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Departamentos
  async getDepartments(companyId?: string): Promise<Department[]> {
    const endpoint = companyId ? `/departments?companyId=${companyId}` : '/departments';
    return this.request<Department[]>(endpoint);
  }

  async getDepartment(id: string): Promise<Department> {
    return this.request<Department>(`/departments/${id}`);
  }

  async createDepartment(departmentData: CreateDepartmentRequest): Promise<Department> {
    return this.request<Department>('/departments', {
      method: 'POST',
      body: JSON.stringify(departmentData),
    });
  }

  async updateDepartment(id: string, departmentData: UpdateDepartmentRequest): Promise<Department> {
    return this.request<Department>(`/departments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(departmentData),
    });
  }

  async deleteDepartment(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/departments/${id}`, {
      method: 'DELETE',
    });
  }

  async deactivateDepartment(id: string): Promise<Department> {
    return this.request<Department>(`/departments/${id}/deactivate`, {
      method: 'PATCH',
    });
  }

  // Roles
  async getRoles(): Promise<Role[]> {
    return this.request<Role[]>('/roles');
  }

  async getRole(id: string): Promise<Role> {
    return this.request<Role>(`/roles/${id}`);
  }

  async createRole(roleData: CreateRoleRequest): Promise<Role> {
    return this.request<Role>('/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  }

  async updateRole(id: string, roleData: UpdateRoleRequest): Promise<Role> {
    return this.request<Role>(`/roles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(roleData),
    });
  }

  async deleteRole(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/roles/${id}`, {
      method: 'DELETE',
    });
  }

  async deactivateRole(id: string): Promise<Role> {
    return this.request<Role>(`/roles/${id}/deactivate`, {
      method: 'PATCH',
    });
  }

  async createDefaultRoles(): Promise<void> {
    return this.request<void>('/roles/create-defaults', {
      method: 'POST',
    });
  }

  // Utilitários
  setToken(token: string, userData?: any): void {
    const authData = {
      token,
      userData,
      timestamp: Date.now(),
    };
    sessionStorage.setItem('authData', JSON.stringify(authData));
  }

  getToken(): string | null {
    const authData = sessionStorage.getItem('authData');
    if (!authData) {
      return null;
    }
    
    try {
      const parsed = JSON.parse(authData);
      // Verificar se o token não expirou (24 horas)
      const tokenAge = Date.now() - parsed.timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 horas em millisegundos
      
      if (tokenAge > maxAge) {
        this.removeToken();
        return null;
      }
      
      return parsed.token;
    } catch (error) {
      this.removeToken();
      return null;
    }
  }

  getUserData(): any {
    const authData = sessionStorage.getItem('authData');
    if (!authData) return null;
    
    try {
      const parsed = JSON.parse(authData);
      return parsed.userData;
    } catch (error) {
      console.error('Erro ao parsear userData:', error);
      return null;
    }
  }

  removeToken(): void {
    sessionStorage.removeItem('authData');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Verificar se o token é válido fazendo uma chamada de teste
    return true; // A validação real será feita pelo backend
  }

  // Verificar se há dados de autenticação em outras abas
  hasAuthDataInOtherTabs(): boolean {
    return sessionStorage.getItem('authData') !== null;
  }

  // Sincronizar com dados de outras abas
  syncWithOtherTabs(): void {
    const authData = sessionStorage.getItem('authData');
    if (authData) {
      try {
        JSON.parse(authData);
        // Disparar evento para notificar esta aba
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'authData',
          newValue: authData,
        }));
      } catch (error) {
        console.error('Erro ao sincronizar dados:', error);
      }
    }
  }

  // Atualizar perfil do usuário
  async updateProfile(profileData: { firstName: string; lastName: string; email: string }): Promise<any> {
    return this.request('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }

  // Alterar senha do usuário
  async changePassword(passwordData: { currentPassword: string; newPassword: string }): Promise<any> {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  // Jobs
  async getJobs(): Promise<any[]> {
    return this.request<any[]>('/jobs');
  }

  async getJob(id: string): Promise<any> {
    return this.request<any>(`/jobs/${id}`);
  }

  async createJob(jobData: any): Promise<any> {
    return this.request<any>('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async createJobWithAi(prompt: string, maxQuestions?: number, maxStages?: number): Promise<any> {
    return this.request<any>('/jobs/with-ai', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        maxQuestions: maxQuestions || 5,
        maxStages: maxStages || 3,
      }),
    });
  }

  async updateJob(id: string, jobData: any): Promise<any> {
    return this.request<any>(`/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(jobData),
    });
  }

  async publishJob(id: string): Promise<any> {
    return this.request<any>(`/jobs/${id}/publish`, {
      method: 'POST',
    });
  }

  async closeJob(id: string): Promise<any> {
    return this.request<any>(`/jobs/${id}/close`, {
      method: 'POST',
    });
  }

  async deleteJob(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  async getJobLogs(id: string): Promise<any[]> {
    return this.request<any[]>(`/jobs/${id}/logs`);
  }

  // Verificar se os dados de autenticação estão consistentes
  isAuthDataConsistent(): boolean {
    const authData = sessionStorage.getItem('authData');
    if (!authData) return false;
    
    try {
      JSON.parse(authData);
      return true;
    } catch (error) {
      console.error('Erro ao verificar consistência dos dados:', error);
      return false;
    }
  }

  // Limpar dados inconsistentes
  clearInconsistentData(): void {
    if (!this.isAuthDataConsistent()) {
      this.removeToken();
    }
    
    // Verificar se há dados antigos no localStorage
    const oldToken = localStorage.getItem('token');
    if (oldToken) {
      localStorage.removeItem('token');
    }
    
    // Verificar se há múltiplos dados de autenticação
    const allKeys = Object.keys(sessionStorage);
    const authKeys = allKeys.filter(key => key.includes('auth') || key.includes('token'));
    if (authKeys.length > 1) {
      authKeys.forEach(key => sessionStorage.removeItem(key));
    }
  }

  // Applications
  async getApplications(jobId: string): Promise<Application[]> {
    return this.request<Application[]>(`/jobs/${jobId}/applications`);
  }

  async getApplicationsWithQuestionResponses(jobId: string): Promise<Application[]> {
    return this.request<Application[]>(`/jobs/${jobId}/applications/with-question-responses`);
  }

  async getApplication(jobId: string, applicationId: string): Promise<Application> {
    return this.request<Application>(`/jobs/${jobId}/applications/${applicationId}`);
  }

  async createApplication(jobId: string, applicationData: CreateApplicationData): Promise<Application> {
    return this.request<Application>(`/jobs/${jobId}/applications`, {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async updateApplication(jobId: string, applicationId: string, applicationData: UpdateApplicationData): Promise<Application> {
    return this.request<Application>(`/jobs/${jobId}/applications/${applicationId}`, {
      method: 'PATCH',
      body: JSON.stringify(applicationData),
    });
  }

  async deleteApplication(jobId: string, applicationId: string): Promise<void> {
    return this.request<void>(`/jobs/${jobId}/applications/${applicationId}`, {
      method: 'DELETE',
    });
  }

  async updateApplicationScore(jobId: string, applicationId: string, scoreData: UpdateApplicationScoreData): Promise<Application> {
    return this.request<Application>(`/jobs/${jobId}/applications/${applicationId}/ai-score`, {
      method: 'PATCH',
      body: JSON.stringify(scoreData),
    });
  }
}

export const apiService = new ApiService(); 