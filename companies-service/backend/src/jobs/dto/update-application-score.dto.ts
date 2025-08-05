import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpdateApplicationScoreDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  aiScore?: number;
} 