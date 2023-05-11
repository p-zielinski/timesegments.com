import { IsEnum } from 'class-validator';
import { NotesSortOption } from '@test1/shared';

export class SetSortingNotesDto {
  @IsEnum(NotesSortOption)
  sortingNotes: NotesSortOption;
}
