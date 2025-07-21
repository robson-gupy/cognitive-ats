export interface Department {
  id: string;
  name: string;
  description?: string;
  code: string;
  isActive: boolean;
  companyId: string;
  company?: {
    id: string;
    name: string;
  };
  users?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentRequest {
  name: string;
  description?: string;
  code: string;
  companyId: string;
}

export interface UpdateDepartmentRequest {
  name?: string;
  description?: string;
  code?: string;
  companyId?: string;
} 