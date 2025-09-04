import { IsEmail, IsObject, IsOptional, IsString, IsUrl, IsUUID, Matches, MaxLength, MinLength, ValidateIf, } from 'class-validator';

class AddressDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  street?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  neighborhood?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  city?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  state?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{5}-\d{3}$/)
  zipCode?: string;
}

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

  // Endereço (opcional no create) como objeto
  @IsOptional()
  @IsObject()
  address?: AddressDto;
}
