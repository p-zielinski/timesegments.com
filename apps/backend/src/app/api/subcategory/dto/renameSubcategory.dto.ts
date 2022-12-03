import { IsString } from 'class-validator';

export class RenameSubcategoryDto {
  @IsString()
  name: string;

  @IsString()
  subcategoryId: string;
}
