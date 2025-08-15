import { IsUUID, IsString, IsEmail, IsOptional, ValidateIf, IsUrl } from 'class-validator';

export class CreateApplicationDto {
  @IsUUID()
  jobId: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsEmail()
  @ValidateIf((o) => !o.phone)
  email?: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.email)
  phone?: string;

  @IsOptional()
  @IsUrl()
  resumeUrl?: string;
} 