import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class Period {
  @IsNumber()
  from: number;
  @IsNumber()
  to: number;
}

export class FromToDatesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => Period)
  periods: Period[];
  @IsOptional()
  @IsString({ each: true })
  alreadyKnownCategories: string[];
}
