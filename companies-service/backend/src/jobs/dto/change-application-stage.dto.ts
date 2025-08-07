import { IsUUID, IsOptional, IsString } from 'class-validator';

export class ChangeApplicationStageDto {
  @IsUUID()
  toStageId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
