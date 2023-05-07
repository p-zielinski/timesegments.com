import { IsEnum } from 'class-validator';
import { CategoriesSortOption } from '@test1/shared';

export class SetSortingCategoriesDto {
  @IsEnum(CategoriesSortOption)
  sortingCategories: CategoriesSortOption;
}
