import { IsOptional, IsString } from 'class-validator';

export class CreateSubcategoryDto {
  @IsString()
  controlValue: string;
  @IsString()
  categoryId: string;
  @IsString()
  name: string;
  @IsOptional()
  @IsString()
  color: string;
}
