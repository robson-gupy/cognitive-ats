import {
  IsDateString,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

// Interface para os detalhes de avaliação
interface EvaluationDetails {
  overall_score?: number;
  question_responses_score?: number;
  education_score?: number;
  experience_score?: number;
  provider?: string;
  model?: string;
  [key: string]: unknown;
}

export class UpdateApplicationEvaluationDto {
  @IsOptional()
  @IsNumber()
  overallScore?: number;

  @IsOptional()
  @IsNumber()
  questionResponsesScore?: number;

  @IsOptional()
  @IsNumber()
  educationScore?: number;

  @IsOptional()
  @IsNumber()
  experienceScore?: number;

  @IsOptional()
  @IsString()
  evaluationProvider?: string;

  @IsOptional()
  @IsString()
  evaluationModel?: string;

  @IsOptional()
  @IsObject()
  evaluationDetails?: EvaluationDetails;

  @IsOptional()
  @IsDateString()
  evaluatedAt?: string;
}
