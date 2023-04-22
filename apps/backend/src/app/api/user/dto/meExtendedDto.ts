import { IsArray, IsEnum } from 'class-validator';
import { MeExtendedOption } from '@test1/shared';

export class MeExtendedDto {
  @IsArray()
  @IsEnum(MeExtendedOption, { each: true })
  extend: MeExtendedOption[];
}
