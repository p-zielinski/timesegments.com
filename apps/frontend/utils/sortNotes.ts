import { NotesSortOption } from '@test1/shared';
import { Note } from '@prisma/client';

const sortByDate = (note2, note1) =>
  new Date(note1?.createdAt).getTime() - new Date(note2?.createdAt).getTime();
export const sortNotes = (notes: Note[], sortOption: NotesSortOption) => {
  switch (sortOption) {
    case NotesSortOption.BY_DATE:
      return [...notes.sort(sortByDate)];
    case NotesSortOption.FAVORITES_FIRST:
      return [
        ...notes.filter((note) => note.favorite).sort(sortByDate),
        ...notes.filter((note) => !note.favorite).sort(sortByDate),
      ];
    default:
      return notes;
  }
};
