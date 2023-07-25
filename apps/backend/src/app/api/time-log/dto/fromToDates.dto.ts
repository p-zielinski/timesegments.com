import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FromToDatesDto {
  @IsNumber()
  from: number;
  @IsNumber()
  to: number;
  @IsOptional()
  @IsString({ each: true })
  alreadyKnownCategories: string[];
}
