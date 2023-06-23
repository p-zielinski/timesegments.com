import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EmailType } from '@test1/shared';

export class ConfirmEmailDto {
  @IsString()
  emailId: string;
  @IsEnum(EmailType)
  type: string;
  @IsOptional()
  @IsString()
  key?: string;
}
