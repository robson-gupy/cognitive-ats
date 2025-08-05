import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  // Dados da empresa
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  companyName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  corporateName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(14)
  @MaxLength(18)
  cnpj: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  businessArea: string;

  @IsOptional()
  @IsString()
  companyDescription?: string;

  // Dados do usuário
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
