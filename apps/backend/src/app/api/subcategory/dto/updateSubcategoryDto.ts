import { IsOptional, IsString } from 'class-validator';

export class UpdateSubcategoryDto {
  @IsOptional()
  @IsString()
  color: string;
  @IsString()
  name: string;

  @IsString()
  subcategoryId: string;
}
