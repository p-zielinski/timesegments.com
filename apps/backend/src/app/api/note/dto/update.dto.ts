import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateNoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  noteId: string;

  @IsString()
  @IsNotEmpty()
  text: string;
}
