import { IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class InitializeEmailChangeDto {
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  currentEmail: string;
}
