import { IsOptional, IsString } from 'class-validator';

export class UpdateSubcategoryDto {
  @IsString()
  controlValue: string;
  @IsOptional()
  @IsString()
  color: string;
  @IsString()
  name: string;

  @IsString()
  subcategoryId: string;
}
