import { IsNumber, IsOptional, IsString, IsObject, IsDateString } from 'class-validator';

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
  evaluationDetails?: any;

  @IsOptional()
  @IsDateString()
  evaluatedAt?: string;
}
