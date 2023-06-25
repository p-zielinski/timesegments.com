import { IsString } from 'class-validator';

export class ValidateEmailDto {
  @IsString()
  emailId: string;
  @IsString()
  secretKey: string;
}
