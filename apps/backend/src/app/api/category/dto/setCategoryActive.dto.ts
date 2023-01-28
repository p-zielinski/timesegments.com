import { IsBoolean, IsString } from 'class-validator';

export class SetCategoryActiveDto {
  @IsString()
  categoryId: string;
}
