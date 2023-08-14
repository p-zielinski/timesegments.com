import { IsBoolean, IsString } from 'class-validator';

export class SetExpandCategoriesDto {
  @IsString()
  categoryId: string;
  @IsBoolean()
  showRecentNotes: boolean;
}
