export const JobStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CLOSED: 'CLOSED',
  PAUSED: 'PAUSED',
} as const;

export type JobStatus = typeof JobStatus[keyof typeof JobStatus];

export interface JobQuestion {
  id?: string;
  question: string;
  orderIndex: number;
  isRequired: boolean;
}

export interface JobStage {
  id?: string;
  name: string;
  description?: string;
  orderIndex: number;
  isActive: boolean;
}

export interface JobLog {
  id: string;
  description: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  expirationDate: string;
  status: JobStatus;
  companyId: string;
  departmentId?: string;
  createdById: string;
  publishedAt?: string;
  closedAt?: string;
  slug: string;
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
    code: string;
    description?: string;
  };
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  questions: JobQuestion[];
  stages: JobStage[];
  logs?: JobLog[];
  applicationCount?: number;
}

export interface CreateJobData {
  title: string;
  description: string;
  requirements: string;
  expirationDate: string;
  departmentId?: string;
  slug: string;
  questions?: JobQuestion[];
  stages?: JobStage[];
}

export interface UpdateJobData {
  title?: string;
  description?: string;
  requirements?: string;
  expirationDate?: string;
  status?: JobStatus;
  departmentId?: string;
  slug?: string;
  questions?: JobQuestion[];
  stages?: JobStage[];
} 