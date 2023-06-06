import { IsString, MaxLength } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  categoryId: string;
  @IsString()
  @MaxLength(40)
  name: string;
  @IsString()
  color: string;
}
