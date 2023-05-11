import React, { useState } from 'react';
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
    <CategoryList
      user={user}
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
  );
};
