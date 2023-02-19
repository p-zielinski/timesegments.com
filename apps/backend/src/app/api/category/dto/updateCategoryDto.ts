import { IsString } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  controlValue: string;
  @IsString()
  categoryId: string;
  @IsString()
  name: string;
  @IsString()
  color: string;
}
