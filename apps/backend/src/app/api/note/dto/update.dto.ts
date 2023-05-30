import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateNoteDto {
  @IsString()
  @IsNotEmpty()
  noteId: string;

  @IsString()
  @IsNotEmpty()
  text: string;
}
