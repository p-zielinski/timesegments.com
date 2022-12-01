import { IsString } from 'class-validator';

export class RenameCategoryDto {
  @IsString()
  name: string;

  @IsString()
  categoryId: string;
}
