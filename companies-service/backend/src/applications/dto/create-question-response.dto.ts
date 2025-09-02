import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateQuestionResponseDto {
  @IsUUID()
  @IsNotEmpty()
  jobQuestionId: string;

  @IsString()
  @IsNotEmpty()
  answer: string;
}
