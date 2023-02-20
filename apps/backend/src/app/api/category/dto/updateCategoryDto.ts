import { IsString } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  categoryId: string;
  @IsString()
  name: string;
  @IsString()
  color: string;
}
