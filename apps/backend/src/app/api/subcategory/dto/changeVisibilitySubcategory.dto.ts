import { IsBoolean, IsString } from 'class-validator';

export class ChangeVisibilitySubcategoryDto {
  @IsString()
  controlValue: string;
  @IsString()
  subcategoryId: string;
  @IsBoolean()
  visible: boolean;
}
