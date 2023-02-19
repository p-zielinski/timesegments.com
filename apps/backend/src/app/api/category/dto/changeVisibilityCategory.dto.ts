import { IsBoolean, IsString } from 'class-validator';

export class ChangeVisibilityCategoryDto {
  @IsString()
  controlValue: string;
  @IsString()
  @IsString()
  categoryId: string;
  @IsBoolean()
  visible: boolean;
}
