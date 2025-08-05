import { IsUUID, IsString, IsEmail, IsOptional, ValidateIf } from 'class-validator';

export class UploadResumeDto {
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
} 