import { IsString } from 'class-validator';

export class SetCategoryDeletedDto {
  @IsString()
  controlValue: string;
  @IsString()
  categoryId: string;
}
