import { IsString } from 'class-validator';

export class SetSubcategoryDeletedDto {
  @IsString()
  subcategoryId: string;
}
