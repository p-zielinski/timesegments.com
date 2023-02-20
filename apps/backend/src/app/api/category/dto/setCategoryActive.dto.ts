import { IsString } from 'class-validator';

export class SetCategoryActiveDto {
  @IsString()
  categoryId: string;
}
