import { IsString } from 'class-validator';

export class ControlValueDto {
  @IsString()
  controlValue: string;
}
