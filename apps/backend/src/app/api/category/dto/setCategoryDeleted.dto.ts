import { IsString } from 'class-validator';

export class SetCategoryDeletedDto {
  @IsString()
  categoryId: string;
}
