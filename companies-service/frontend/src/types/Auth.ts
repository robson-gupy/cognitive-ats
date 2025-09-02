export interface LoginData {
  email: string;
  password: string;
  companySlug?: string; // Campo opcional para especificar o subdomínio da empresa
}

export interface RegisterData {
  // Dados da empresa
  companyName: string;
  corporateName: string;
  cnpj: string;
  businessArea: string;
  companyDescription?: string;

  // Dados do usuário
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    companyId: string;
    roleId?: string;
    roleCode?: string;
  };
}

export interface RegisterResponse {
  message: string;
  company: {
    id: string;
    name: string;
    corporateName: string;
    cnpj: string;
    businessArea: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    companyId: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyId: string;
  roleId?: string;
  roleCode?: string;
  createdAt?: string;
  company?: {
    id: string;
    name: string;
    corporateName: string;
    cnpj: string;
    businessArea: string;
    description?: string;
  };
  department?: {
    id: string;
    name: string;
    description?: string;
  };
  role?: {
    id: string;
    name: string;
    code: string;
    description?: string;
  };
} 