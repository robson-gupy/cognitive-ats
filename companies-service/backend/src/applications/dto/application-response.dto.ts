import { Application } from '../entities/application.entity';

export interface EvaluationSummaryDto {
  score?: number | null;
  details?: Record<string, unknown> | null;
}

export class ApplicationResponseDto {
  id: string;
  jobId: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;

  aiScore?: number | null;
  overallScore?: number | null;
  questionResponsesScore?: number | null;
  educationScore?: number | null;
  experienceScore?: number | null;

  evaluationDetails?: EvaluationSummaryDto | null;
  evaluatedAt?: Date | null;

  resumeUrl?: string | null;
  currentStageId?: string | null;

  address?: {
    id?: string;
    street?: string | null;
    neighborhood?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
  } | null;

  createdAt: Date;
  updatedAt: Date;

  // Campos opcionais carregados por relations quando aplicável
  job?: any;
  currentStage?: any;
  questionResponses?: any[];
}

function sanitizeEvaluationDetails(raw: any): EvaluationSummaryDto | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const score =
    (typeof raw.score === 'number' ? raw.score : null) ??
    (typeof raw.overall_score === 'number' ? raw.overall_score : null);

  const detailsSource =
    raw.details && typeof raw.details === 'object' ? raw.details : raw;

  if (!detailsSource || typeof detailsSource !== 'object') {
    return { score, details: null };
  }

  const { model, provider, ...rest } = detailsSource as Record<string, unknown>;

  return {
    score: score ?? null,
    details: Object.keys(rest).length > 0 ? rest : null,
  };
}

export function mapApplicationToResponse(
  application: Application,
): ApplicationResponseDto {
  const {
    evaluationProvider: _omitProvider,
    evaluationModel: _omitModel,
    evaluationDetails,
    ...rest
  } = application as any;

  const response: ApplicationResponseDto = {
    ...rest,
    evaluationDetails: sanitizeEvaluationDetails(evaluationDetails),
    address: application.address
      ? {
          id: (application as any).address?.id ?? undefined,
          street: (application as any).address?.street ?? null,
          neighborhood: (application as any).address?.neighborhood ?? null,
          city: (application as any).address?.city ?? null,
          state: (application as any).address?.state ?? null,
          zipCode: (application as any).address?.zipCode ?? null,
        }
      : null,
  };

  return response;
}

export function mapApplicationsToResponse(
  applications: Application[],
): ApplicationResponseDto[] {
  return applications.map(mapApplicationToResponse);
}


