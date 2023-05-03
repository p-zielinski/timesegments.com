import { IsBoolean } from 'class-validator';

export class SetExpandNotesDto {
  @IsBoolean()
  expandNotes: boolean;
}
