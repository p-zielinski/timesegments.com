import { IsString } from 'class-validator';

export class ConfirmEmailDto {
  @IsString()
  emailId: string;
  @IsString()
  secretKey: string;
}
