// @mui
import {Box} from '@mui/material'; // utils
import React from 'react';
import AddNote from '../notes/AddNote';
import {Note} from '../notes/Note'; // ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export default function CategoryNotesCards({ category, useStore }) {
  const { limits, isEditing } = useStore();
  const categoriesNotesLimit = limits?.categoriesNotesLimit || 5;
  const currentCategoryNumberOfNotes = (category.notes || []).length;

  return (isEditing?.createNewNote === category.id ||
    (category.showRecentNotes && category.notes?.length)) > 0 ? (
    <Box sx={{ display: 'flex', flexDirection: 'row', m: 0 }}>
      <Box sx={{ minWidth: '10%', m: 0 }} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          m: 0,
          gap: 2,
        }}
      >
        {isEditing?.createNewNote === category.id &&
          categoriesNotesLimit > currentCategoryNumberOfNotes && (
            <AddNote useStore={useStore} category={category} />
          )}
        {category.showRecentNotes &&
          (category.notes || []).map((note) => (
            <Note key={note.id} useStore={useStore} />
          ))}
      </Box>
    </Box>
  ) : undefined;
}
