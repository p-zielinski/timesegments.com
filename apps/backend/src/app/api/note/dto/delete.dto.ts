import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteNoteDto {
  @IsString()
  @IsNotEmpty()
  noteId: string;
}
