import { IsOptional, IsString } from 'class-validator';

export class ConfirmEmailDto {
  @IsString()
  emailId: string;
  @IsOptional()
  @IsString()
  key?: string;
}
