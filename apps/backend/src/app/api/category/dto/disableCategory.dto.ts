import { IsString } from 'class-validator';

export class DisableCategoryDto {
  @IsString()
  categoryId: string;
}
