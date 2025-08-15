import { IsUUID, IsString, IsNotEmpty } from 'class-validator';

export class CreateQuestionResponseDto {
  @IsUUID()
  @IsNotEmpty()
  jobQuestionId: string;

  @IsString()
  @IsNotEmpty()
  answer: string;
} 