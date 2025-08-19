import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsArray,
  ValidateNested,
  MinLength,
  IsEnum,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { JobStatus } from '../entities/job.entity';

export class CreateJobQuestionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  question: string;

  @IsOptional()
  orderIndex?: number;

  @IsOptional()
  isRequired?: boolean;
}

export class CreateJobStageDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  orderIndex?: number;

  @IsOptional()
  isActive?: boolean;
}

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  description: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  requirements: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  slug?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateJobQuestionDto)
  questions?: CreateJobQuestionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateJobStageDto)
  stages?: CreateJobStageDto[];
}
