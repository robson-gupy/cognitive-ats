export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleRequest {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateRoleRequest {
  name?: string;
  code?: string;
  description?: string;
}

export const RoleType = {
  ADMIN: 'ADMIN',
  RECRUITER: 'RECRUITER',
  MANAGER: 'MANAGER'
} as const; 