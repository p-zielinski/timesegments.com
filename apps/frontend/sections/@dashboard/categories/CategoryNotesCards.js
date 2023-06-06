// @mui
import {Box} from '@mui/material'; // utils
import React from 'react';
import AddNote from '../notes/AddNote';
import {Note} from '../notes/Note'; // ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export default function CategoryNotesCards({
  limits,
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
            <AddNote
              controlValue={controlValue}
              setControlValue={setControlValue}
              disableHover={disableHover}
              isSaving={isSaving}
              setIsSaving={setIsSaving}
              setIsEditing={setIsEditing}
              category={category}
              categories={categories}
              setCategories={setCategories}
            />
          )}
        {category.showRecentNotes &&
          (category.notes || []).map((note) => (
            <Note
              key={note.id}
              category={category}
              categories={categories}
              setCategories={setCategories}
              controlValue={controlValue}
              setControlValue={setControlValue}
              isSaving={isSaving}
              setIsSaving={setIsSaving}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              disableHover={disableHover}
              note={note}
              user={user}
            />
          ))}
      </Box>
    </Box>
  ) : undefined;
}
