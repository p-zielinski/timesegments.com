import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class UpdateNoteDto {
  @IsString()
  @IsNotEmpty()
  noteId: string;

  @IsString()
  @IsNotEmpty()
  note: string;

  @IsBoolean()
  favorite: boolean;
}
