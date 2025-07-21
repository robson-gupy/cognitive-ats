export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyId: string;
  roleId?: string;
  roleCode?: string;
  departmentId?: string;
  createdAt: string;
  updatedAt: string;
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

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyId: string;
  roleId: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  companyId?: string;
  roleId?: string;
} 