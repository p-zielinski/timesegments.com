import { IsOptional, IsString } from 'class-validator';

export class ValidateEmailDto {
  @IsString()
  emailId: string;
  @IsOptional()
  @IsString()
  key?: string;
}
