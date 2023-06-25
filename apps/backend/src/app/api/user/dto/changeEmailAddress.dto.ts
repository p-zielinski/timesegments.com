import { IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class ChangeEmailAddressDto {
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  newEmail: string;
}
