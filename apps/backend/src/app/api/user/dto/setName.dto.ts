import { IsString } from 'class-validator';

export class SetNameDto {
  @IsString()
  name: string;
}
