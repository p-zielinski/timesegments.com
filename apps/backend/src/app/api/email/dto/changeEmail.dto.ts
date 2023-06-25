import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class ChangeEmailDto {
  @IsString()
  @Transform(({ value }) => value.toLowerCase())
  newEmail: string;
  @IsString()
  emailId: string;
  @IsString()
  secretKey: string;
}
