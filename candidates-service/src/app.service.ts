import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  expirationDate: string | null;
  status: string;
  departmentId: string | null;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  department: {
    id: string;
    name: string;
    description: string;
  } | null;
}

export interface CompanyJobsResponse {
  success: boolean;
  data: Job[];
  total: number;
  companyId: string;
  message: string;
}

export interface JobResponse {
  success: boolean;
  data: Job;
  companyId: string;
  message: string;
}

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {}

  async getCompanyJobs(slug: string): Promise<CompanyJobsResponse> {
    try {
      // URL da API pública do companies-service
      const apiUrl = process.env.COMPANIES_API_URL || 'http://localhost:3001';
      const response: AxiosResponse<CompanyJobsResponse> = await firstValueFrom(
        this.httpService.get<CompanyJobsResponse>(`${apiUrl}/public/${slug}/jobs`)
      );
      
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar vagas da empresa:', error);
      throw new Error(`Erro ao buscar vagas da empresa: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getJob(companySlug: string, jobSlug: string): Promise<JobResponse> {
    try {
      // URL da API pública do companies-service
      const apiUrl = process.env.COMPANIES_API_URL || 'http://localhost:3001';
      const response: AxiosResponse<JobResponse> = await firstValueFrom(
        this.httpService.get<JobResponse>(`${apiUrl}/public/${companySlug}/jobs/${jobSlug}`)
      );
      
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar vaga:', error);
      throw new Error(`Erro ao buscar vaga: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  getHealth(): string {
    return 'OK';
  }
}
