import { Stack } from '@mui/material';
import React, { useState } from 'react';
import SortCategories from './Sort';
import CategoryList from './CategoryList';

export const CategoriesSection = ({
  categories,
  setCategories,
  viewMode,
  setViewMode,
  limits,
  controlValue,
  setControlValue,
  user,
  isSaving,
  setIsSaving,
  disableHover,
}) => {
  const [isEditing, setIsEditing] = useState<{
    categoryId: string;
    subcategoryId: string;
    createNew: string;
  }>({
    categoryId: undefined,
    subcategoryId: undefined,
    createNew: undefined,
  });

  return (
    <>
      <Stack
        direction="row"
        flexWrap="wrap-reverse"
        alignItems="center"
        justifyContent="flex-end"
      >
        <Stack direction="row" spacing={1} flexShrink={0} sx={{ mt: 1, mb: 1 }}>
          <SortCategories
            user={user}
            categories={categories}
            setCategories={setCategories}
          />
        </Stack>
      </Stack>
      <CategoryList
        controlValue={controlValue}
        setControlValue={setControlValue}
        disableHover={disableHover}
        isSaving={isSaving}
        setIsSaving={setIsSaving}
        categories={categories}
        setCategories={setCategories}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        limits={limits}
      />
    </>
  );
};
