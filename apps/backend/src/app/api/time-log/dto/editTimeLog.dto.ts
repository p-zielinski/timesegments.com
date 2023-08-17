import { IsNumber, IsOptional, IsString } from 'class-validator';

export class EditTimeLogDto {
  @IsString()
  timeLogId: string;
  @IsNumber()
  from: number;
  @IsOptional()
  @IsNumber()
  to?: number;
}
