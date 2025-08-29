import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateApplicationTagDto {
  @IsUUID()
  @IsNotEmpty()
  applicationId: string;

  @IsUUID()
  @IsNotEmpty()
  tagId: string;
}
