import { IsString } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  newPassword: string;
  @IsString()
  emailId: string;
  @IsString()
  secretKey: string;
}
