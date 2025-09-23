import { 
  IsOptional, 
  IsNumber, 
  IsObject, 
  IsString,
  IsDateString,
  MaxLength
} from 'class-validator';
import { EvaluationDetails } from '../entities/application.entity';

export class InternalUpdateApplicationDto {
  // Scores de avaliação
  @IsOptional()
  @IsNumber()
  aiScore?: number;

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

  // Informações de avaliação
  @IsOptional()
  @IsString()
  @MaxLength(50)
  evaluationProvider?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  evaluationModel?: string;

  @IsOptional()
  @IsObject()
  evaluationDetails?: EvaluationDetails;

  @IsOptional()
  @IsDateString()
  evaluatedAt?: string;
}
