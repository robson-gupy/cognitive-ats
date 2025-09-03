import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
  requiresAddress?: boolean;
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

export interface ResumeData {
  personal_info?: Record<string, unknown>;
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
    gpa?: string;
  }>;
  experience?: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  skills?: string[];
  languages?: Array<{
    language: string;
    level: string;
  }>;
  achievements?: string[];
}

export interface JobData {
  title: string;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  education_required?: string;
  experience_required?: string;
  skills_required?: string[];
}

export interface QuestionResponse {
  question: string;
  answer: string;
}

export interface CandidateEvaluationRequest {
  resume: ResumeData;
  job: JobData;
  question_responses?: QuestionResponse[];
  provider?: string;
  api_key?: string;
  model?: string;
}

export interface CandidateEvaluationResponse {
  overall_score: number;
  question_responses_score: number;
  education_score: number;
  experience_score: number;
  provider: string;
  model?: string;
  evaluation_details?: Record<string, unknown>;
}

// Interface para dados de resposta de erro
interface ErrorResponseData {
  detail?: string;
  [key: string]: unknown;
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
    } catch (error: unknown) {
      // Verificar se é um erro do axios
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: ErrorResponseData; status?: number };
        };
        const message =
          axiosError.response?.data?.detail ||
          (error as any)?.message ||
          'Erro ao comunicar com o AI Service';
        throw new HttpException(
          message,
          axiosError.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        'Erro interno do servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async evaluateCandidate(
    request: CandidateEvaluationRequest,
  ): Promise<CandidateEvaluationResponse> {
    try {
      const response = await axios.post(
        `${this.aiServiceUrl}/ai/evaluate-candidate`,
        request,
        {
          timeout: 60000, // 60 segundos de timeout
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data as CandidateEvaluationResponse;
    } catch (error: unknown) {
      // Verificar se é um erro do axios
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: ErrorResponseData; status?: number };
        };
        const message =
          axiosError.response?.data?.detail ||
          (error as any)?.message ||
          'Erro ao avaliar candidato com o AI Service';
        throw new HttpException(
          message,
          axiosError.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        'Erro interno do servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
