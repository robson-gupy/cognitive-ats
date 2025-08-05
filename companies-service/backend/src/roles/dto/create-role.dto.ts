import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  code: string;

  @IsString()
  @IsOptional()
  description?: string;
}
