export class PublicJobDto {
  id: string;
  title: string;
  description: string;
  requirements: string;
  expirationDate: Date | null;
  status: string;
  departmentId: string | null;
  slug: string;
  publishedAt: Date | null;
  requiresAddress: boolean;
  department: {
    id: string;
    name: string;
    description: string;
  } | null;
}

export class PublicJobsResponseDto {
  success: boolean;
  data: PublicJobDto[];
  total: number;
  companyId: string;
  message: string;
}

export class PublicJobResponseDto {
  success: boolean;
  data: PublicJobDto;
  companyId: string;
  message: string;
}

export class PublicJobQuestionsResponseDto {
  success: boolean;
  data: {
    id: string;
    question: string;
    orderIndex: number;
    isRequired: boolean;
  }[];
  total: number;
  jobId: string;
  message: string;
}
