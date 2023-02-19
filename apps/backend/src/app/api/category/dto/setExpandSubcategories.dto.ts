import { IsBoolean, IsString } from 'class-validator';

export class SetExpandSubcategoriesDto {
  @IsString()
  controlValue: string;
  @IsString()
  categoryId: string;
  @IsBoolean()
  expandSubcategories: boolean;
}
