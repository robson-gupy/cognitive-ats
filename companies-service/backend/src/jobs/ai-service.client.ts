import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

export interface JobCreationRequest {
  prompt: string;
  generate_questions?: boolean;
  generate_stages?: boolean;
  max_questions?: number;
  max_stages?: number;
  provider?: string;
  api_key?: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
}

export interface JobCreationResponse {
  title: string;
  description: string;
  requirements: string;
  questions?: Array<{
    question: string;
    isRequired: boolean;
  }>;
  stages?: Array<{
    name: string;
    description?: string;
    isActive: boolean;
  }>;
}

@Injectable()
export class AiServiceClient {
  private readonly aiServiceUrl: string;

  constructor() {
    this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://ai-service:8000';
  }

  async createJobFromPrompt(
    request: JobCreationRequest,
  ): Promise<JobCreationResponse> {
    try {
      const response = await axios.post(
        `${this.aiServiceUrl}/jobs/create-from-prompt`,
        request,
        {
          timeout: 60000, // 60 segundos de timeout
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      // O AI Service retorna um objeto com 'job', 'questions', 'stages', etc.
      // Precisamos extrair os dados do objeto 'job'
      const responseData = response.data as any;
      const jobData = responseData.job;

      return {
        title: jobData.title,
        description: jobData.description,
        requirements: jobData.requirements,
        questions: responseData.questions,
        stages: responseData.stages,
      } as JobCreationResponse;
    } catch (error: any) {
      if (error.response) {
        const message =
          error.response?.data?.detail ||
          error.message ||
          'Erro ao comunicar com o AI Service';
        throw new HttpException(
          message,
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        'Erro interno do servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
