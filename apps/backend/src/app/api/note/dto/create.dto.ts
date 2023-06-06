import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  text: string;
  @IsOptional()
  @IsString()
  categoryId: string;
}
