// @mui
import {Box} from '@mui/material'; // utils
import React from 'react';
import AddNote from '../notes/AddNote'; // ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export default function CategoryNotesCards({
  controlValue,
  setControlValue,
  category,
  categories,
  setCategories,
  isEditing,
  setIsEditing,
  isSaving,
  setIsSaving,
  disableHover,
}) {
  return (isEditing?.createNewNote === category.id ||
    (category.showRecentNotes && category.notes?.length)) > 0 ? (
    <Box sx={{ display: 'flex', flexDirection: 'row', m: 0 }}>
      <Box sx={{ minWidth: '10%', m: 0 }} />
      <Box sx={{ flex: 1, m: 0, gap: '10px' }}>
        {isEditing?.createNewNote === category.id && (
          <AddNote
            controlValue={controlValue}
            setControlValue={setControlValue}
            disableHover={disableHover}
            isSaving={isSaving}
            setIsSaving={setIsSaving}
            category={category}
            setIsEditing={setIsEditing}
          />
        )}
        {category.showRecentNotes &&
          (category.notes || []).map((note) => <Box key={note.id}>aaaa</Box>)}
      </Box>
    </Box>
  ) : undefined;
}
