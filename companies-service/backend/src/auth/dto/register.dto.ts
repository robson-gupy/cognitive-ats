import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';

export class RegisterDto {
  // Dados da empresa
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  companyName: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'O identificador deve conter apenas letras minúsculas, números e hífens',
  })
  companySlug?: string; // Campo opcional para slug personalizado

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
