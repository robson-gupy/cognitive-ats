import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateQuestionResponseDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  answer?: string;
}
