import { IsString } from 'class-validator';

export class RenameCategoryDto {
  @IsString()
  categoryId: string;
  @IsString()
  name: string;
  @IsString()
  color: string;
}
