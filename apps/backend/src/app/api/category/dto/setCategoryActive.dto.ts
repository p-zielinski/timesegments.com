import { IsString } from 'class-validator';

export class SetCategoryActiveDto {
  @IsString()
  controlValue: string;
  @IsString()
  categoryId: string;
}
