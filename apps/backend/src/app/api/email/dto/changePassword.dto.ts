import { IsString } from 'class-validator';

export class ChangeEmailDto {
  @IsString()
  newPassword: string;
  @IsString()
  emailId: string;
  @IsString()
  secretKey: string;
}
