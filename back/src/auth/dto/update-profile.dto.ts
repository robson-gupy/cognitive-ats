import { IsString, IsNotEmpty, MinLength, IsEmail } from 'class-validator';

export class UpdateProfileDto {
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
} 