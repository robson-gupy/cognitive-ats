import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreateCompanyDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

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
  description?: string;
}
