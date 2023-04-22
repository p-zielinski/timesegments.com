import { IsBoolean, IsString } from 'class-validator';

export class ChangeVisibilityCategoryDto {
  @IsString()
  @IsString()
  categoryId: string;
  @IsBoolean()
  visible: boolean;
}
