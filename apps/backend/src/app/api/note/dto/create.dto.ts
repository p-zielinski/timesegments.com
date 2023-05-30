import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  text: string;
  @IsOptional()
  @IsString()
  categoryId: string;
}
