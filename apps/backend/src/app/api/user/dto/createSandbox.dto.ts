import { IsEnum } from 'class-validator';
import { Timezones } from '@test1/shared';

export class CreateSandboxDto {
  @IsEnum(Timezones)
  timezone: Timezones;
}
