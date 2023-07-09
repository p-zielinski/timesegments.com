import {
  IsDefined,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FromToDateTime } from '@test1/shared';

class DateTime {
  @IsNumber()
  day: number;

  @IsNumber()
  month: number;

  @IsNumber()
  year: number;

  @IsNumber()
  hour: number;

  @IsNumber()
  minute: number;

  @IsNumber()
  second: number;
}

export class CreateTimeLogDto {
  @IsString()
  categoryId: string;
  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => DateTime)
  from: FromToDateTime;
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DateTime)
  to?: FromToDateTime;
}
