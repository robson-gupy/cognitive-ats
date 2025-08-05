import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  MinLength,
} from 'class-validator';

export class CreateJobWithAiDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  prompt: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  maxQuestions?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  maxStages?: number;
}
