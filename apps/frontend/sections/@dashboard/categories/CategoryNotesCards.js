// @mui
import {Box} from '@mui/material'; // utils
import React, {useContext} from 'react';
import AddNote from '../notes/AddNote';
import {Note} from '../notes/Note';
import {StoreContext} from '../../../hooks/useStore';
import {useStore} from 'zustand'; // ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export default function CategoryNotesCards({ category }) {
  const store = useContext(StoreContext);
  const { limits, isEditing, notes } = useStore(store);
  const categoryNotes = notes.filter(
    (note) => note?.categoryId === category.id
  );
  const categoriesNotesLimit = limits?.categoriesNotesLimit || 5;
  const currentCategoryNumberOfNotes = (category.notes || []).length;

  return (isEditing?.createNewNote === category.id ||
    (category.showRecentNotes && categoryNotes?.length)) > 0 ? (
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
          (categoryNotes || []).map((note) => (
            <Note key={note.id} useStore={useStore} />
          ))}
      </Box>
    </Box>
  ) : undefined;
}
