import { IsEnum } from 'class-validator';
import { Timezones } from '@test1/shared';

export class ChangeTimezoneDto {
  @IsEnum(Timezones)
  timezone: Timezones;
}
