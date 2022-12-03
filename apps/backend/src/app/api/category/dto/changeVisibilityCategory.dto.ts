import { IsBoolean, IsString } from 'class-validator';

export class ChangeVisibilityCategoryDto {
  @IsString()
  subcategoryId: string;
  @IsBoolean()
  visible: boolean;
}
