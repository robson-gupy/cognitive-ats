import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  salary: string;
  location: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyJobsResponse {
  success: boolean;
  data: Job[];
  total: number;
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

  getHealth(): string {
    return 'OK';
  }
}
