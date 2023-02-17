import { IsString } from 'class-validator';

export class SetSubcategoryActiveDto {
  @IsString()
  subcategoryId: string;
}
