import { IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  controlValue: string;
  @IsString()
  name: string;
  @IsString()
  color: string;
}
