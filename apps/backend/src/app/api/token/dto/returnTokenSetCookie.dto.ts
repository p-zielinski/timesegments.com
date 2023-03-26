import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class ReturnTokenSetCookieDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  days?: number;
}
