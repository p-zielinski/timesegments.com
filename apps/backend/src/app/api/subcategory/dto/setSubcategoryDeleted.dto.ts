import { IsString } from 'class-validator';

export class SetSubcategoryDeletedDto {
  @IsString()
  controlValue: string;
  @IsString()
  subcategoryId: string;
}
