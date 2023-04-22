import { IsDefined, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FromToDate } from '@test1/shared';

class Date {
  @IsNumber()
  day: number;

  @IsNumber()
  month: number;

  @IsNumber()
  year: number;
}

export class FromToDatesDto {
  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => Date)
  from: FromToDate;
  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => Date)
  to: FromToDate;
}
