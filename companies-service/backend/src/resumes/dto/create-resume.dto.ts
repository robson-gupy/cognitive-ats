import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateResumeProfessionalExperienceDto {
  @IsString()
  companyName: string;

  @IsString()
  position: string;

  @IsString()
  startDate: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  isCurrent?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  responsibilities?: string;

  @IsOptional()
  @IsString()
  achievements?: string;
}

export class CreateResumeAcademicFormationDto {
  @IsString()
  institution: string;

  @IsString()
  course: string;

  @IsString()
  degree: string;

  @IsString()
  startDate: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  isCurrent?: boolean;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateResumeAchievementDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateResumeLanguageDto {
  @IsString()
  language: string;

  @IsString()
  proficiencyLevel: string;
}

export class CreateResumeDto {
  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateResumeProfessionalExperienceDto)
  professionalExperiences?: CreateResumeProfessionalExperienceDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateResumeAcademicFormationDto)
  academicFormations?: CreateResumeAcademicFormationDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateResumeAchievementDto)
  achievements?: CreateResumeAchievementDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateResumeLanguageDto)
  languages?: CreateResumeLanguageDto[];
}
