import { IsBoolean, IsString } from 'class-validator';

export class SetExpandSubcategoriesDto {
  @IsString()
  categoryId: string;
  @IsBoolean()
  showRecentNotes: boolean;
}