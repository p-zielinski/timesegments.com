import { IsString } from 'class-validator';

export class CreateSubcategoryDto {
  @IsString()
  categoryId: string;
  @IsString()
  name: string;
}
