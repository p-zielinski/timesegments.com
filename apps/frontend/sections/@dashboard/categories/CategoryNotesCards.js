// @mui
import {Box} from '@mui/material'; // utils
import React from 'react';
import AddNote from '../notes/AddNote';
import {Note} from '../notes/Note'; // ----------------------------------------------------------------------

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
  user,
}) {
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
          (category.notes || []).map((note) => (
            <Note
              category={category}
              controlValue={controlValue}
              setControlValue={setControlValue}
              isSaving={isSaving}
              setIsSaving={setIsSaving}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              disableHover={disableHover}
              note={note}
              user={user}
              key={note.id}
            />
          ))}
      </Box>
    </Box>
  ) : undefined;
}
