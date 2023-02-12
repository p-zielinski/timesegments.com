import { IsEnum } from 'class-validator';
import { ColumnSortOption } from '@test1/shared';

export class SetSortingCategoriesDto {
  @IsEnum(ColumnSortOption)
  sortingCategories: ColumnSortOption;
}
