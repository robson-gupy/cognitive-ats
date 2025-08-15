import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateQuestionResponseDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  answer?: string;
}
