import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

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

  // Endereço (opcional no create)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  logradouro?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  bairro?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  cidade?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  uf?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{5}-\d{3}$/)
  cep?: string;
}
