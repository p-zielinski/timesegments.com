import { IsBoolean, IsString } from 'class-validator';

export class ChangeVisibilitySubcategoryDto {
  @IsString()
  subcategoryId: string;
  @IsBoolean()
  visible: boolean;
}
