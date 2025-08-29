import { IsString, IsOptional, IsUUID, Length, Matches } from 'class-validator';

export class CreateTagDto {
  @IsString()
  @Length(1, 100)
  label: string;

  @IsOptional()
  @IsString()
  @Length(7, 7)
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Color deve ser um código de cor hexadecimal válido (ex: #3B82F6)',
  })
  color?: string;

  @IsOptional()
  @IsString()
  @Length(7, 7)
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'TextColor deve ser um código de cor hexadecimal válido (ex: #FFFFFF)',
  })
  textColor?: string;
}
