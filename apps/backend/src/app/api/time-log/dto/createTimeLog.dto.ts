import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTimeLogDto {
  @IsString()
  categoryId: string;
  @IsNumber()
  from: number;
  @IsOptional()
  @IsNumber()
  to?: number;
}
