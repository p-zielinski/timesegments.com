import { IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MaxLength(40)
  name: string;
  @IsString()
  color: string;
}
