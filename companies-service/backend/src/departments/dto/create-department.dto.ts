import { IsString, IsNotEmpty, IsOptional, IsUUID, Length } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 10)
  code: string;

  @IsUUID()
  @IsNotEmpty()
  companyId: string;
} 