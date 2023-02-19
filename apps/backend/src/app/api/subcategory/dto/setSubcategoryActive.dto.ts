import { IsString } from 'class-validator';

export class SetSubcategoryActiveDto {
  @IsString()
  controlValue: string;
  @IsString()
  subcategoryId: string;
}
