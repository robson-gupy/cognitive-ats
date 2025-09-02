import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionResponseDto } from './create-question-response.dto';

export class CreateMultipleQuestionResponsesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionResponseDto)
  @IsNotEmpty()
  responses: CreateQuestionResponseDto[];
}
